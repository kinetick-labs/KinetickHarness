import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import { ToolCallId } from '@kinetick-labs/kh-llm'
import { Session, SessionId } from '@kinetick-labs/kh-session'
import AgentRegistry from '@kinetick-labs/kh-agent'
import type { Agent } from '@kinetick-labs/kh-agent'
import SystemPrompt from '@kinetick-labs/kh-system-prompt'
import ToolRuntime from '@kinetick-labs/kh-tools'
import TerminalSessionService from '@kinetick-labs/kh-terminal'
import SandboxProvider from '@kinetick-labs/kh-sandbox'
import type { ConfinedArgv, SandboxPolicy } from '@kinetick-labs/kh-sandbox'
import SandboxPolicyService from '@kinetick-labs/kh-sandbox-policy'
import SessionProjectionRegistry from '@kinetick-labs/kh-session-projection'
import LocalSubprocessRuntime from '@kinetick-labs/kh-subprocess-local'
import * as TerminalLocal from '@kinetick-labs/kh-terminal-bash'
import * as ToolPty from '@kinetick-labs/kh-tool-terminal'
import { unsupportedInbox } from '@kinetick-labs/kh-agent-loop-testkit'

let root: string | undefined
let context: Context | undefined

afterEach(async () => {
  await context?.fiber.dispose()
  context = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

class PassthroughSandbox extends SandboxProvider {
  async confine(argv: readonly string[], _policy: SandboxPolicy): Promise<ConfinedArgv> {
    return { argv: [...argv], enforcement: 'full', denialSignatures: [], runnerFailureRules: [] }
  }
}

async function agent(ctx: Context): Promise<Agent> {
  const scope = ctx.plugin(() => {})
  const id = SessionId('pty-loader-agent')
  const session = Session.create(id)
  const value: Agent = {
    id, options: {}, session, inbox: unsupportedInbox(),
    status: 'idle',
    ctx: scope.ctx,
    send: () => {},
    followup: () => {}, steer: () => {}, inject: () => {}, cancel() {},
    runMaintenance: job => job(new AbortController().signal),
    whenIdle: () => Promise.resolve(),
  }
  await ctx.agents.register(value)
  return value
}

function resultText(result: { content: { type: string; text?: string }[] }): string {
  return result.content.filter(block => block.type === 'text').map(block => block.text).join('')
}

const suite = process.platform === 'linux' || process.platform === 'darwin' ? describe : describe.skip

suite('terminal real Loader composition through cordis.yml', () => {
  it('boots cordis.yml and preserves shell state across real tool calls', async () => {
    root = await mkdtemp(join(tmpdir(), 'kh-pty-loader-'))
    const configPath = join(root, 'cordis.yml')
    await writeFile(configPath, [
      "- name: '@kinetick-labs/kh-agent'",
      "- name: '@kinetick-labs/kh-system-prompt'",
      "- name: '@kinetick-labs/kh-tools'",
      "- name: '@kinetick-labs/kh-terminal'",
      "- name: '@kinetick-labs/kh-test-sandbox'",
      "- name: '@kinetick-labs/kh-session-projection'",
      "- name: '@kinetick-labs/kh-sandbox-policy'",
      '  config:',
      '    mode: danger-full-access',
      `    workspaceRoot: ${JSON.stringify(root)}`,
      "- name: '@kinetick-labs/kh-subprocess-local'",
      "- name: '@kinetick-labs/kh-terminal-bash'",
      '  config:',
      '    pollIntervalMs: 10',
      '    exactProbeAfterMs: 20',
      '    idleSilenceMs: 250',
      '    handoffGraceMs: 250',
      '    timeoutMs: 2000',
      '    disposeGraceMs: 500',
      "- name: '@kinetick-labs/kh-tool-terminal'",
      '',
    ].join('\n'))

    context = new Context()
    context.baseUrl = pathToFileURL(root).href + '/'
    await context.plugin(Loader)
    context.loader.builtins.include = Include
    const modules = new Map<string, unknown>([
      ['@kinetick-labs/kh-agent', AgentRegistry],
      ['@kinetick-labs/kh-system-prompt', SystemPrompt],
      ['@kinetick-labs/kh-tools', ToolRuntime],
      ['@kinetick-labs/kh-terminal', TerminalSessionService],
      ['@kinetick-labs/kh-test-sandbox', PassthroughSandbox],
      ['@kinetick-labs/kh-session-projection', SessionProjectionRegistry],
      ['@kinetick-labs/kh-sandbox-policy', SandboxPolicyService],
      ['@kinetick-labs/kh-subprocess-local', LocalSubprocessRuntime],
      ['@kinetick-labs/kh-terminal-bash', TerminalLocal],
      ['@kinetick-labs/kh-tool-terminal', ToolPty],
    ])
    context.loader.internal = {
      version: 'v2',
      async import(specifier: string) {
        if (!modules.has(specifier)) throw new Error(`unexpected Loader import: ${specifier}`)
        return modules.get(specifier)
      },
    } as unknown as NonNullable<typeof context.loader.internal>
    await context.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(configPath).href } })
    await context.loader.await()

    const owner = await agent(context)
    const signal = new AbortController().signal
    const spawn = await context.tools.execute({
      signal, callId: ToolCallId('spawn'), name: 'terminal_open', arguments: { type: 'shell', name: 'main', cwd: root }, agent: owner,
    })
    expect(resultText(spawn)).toContain('started terminal session pty-1 (main)')

    await context.tools.execute({
      signal, callId: ToolCallId('state'), name: 'terminal_send', arguments: { sessionId: 'pty-1', text: 'export KEEP=loader; cd /' }, agent: owner,
    })
    const read = await context.tools.execute({
      signal, callId: ToolCallId('read'), name: 'terminal_send', arguments: { sessionId: 'pty-1', text: 'printf "cwd=%s keep=%s\\n" "$PWD" "$KEEP"' }, agent: owner,
    })
    expect(resultText(read)).toContain('cwd=/ keep=loader')
    expect(context.terminals.list(owner)).toHaveLength(1)
  }, 15_000)
})
