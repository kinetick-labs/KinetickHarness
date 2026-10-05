import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Include from '@deepseek-ai/cordis-plugin-include'
import { ToolCallId } from '@kinetick-labs/kh-llm'
import { SESSION_FORMAT_VERSION, Session, SessionId } from '@kinetick-labs/kh-session'
import AgentRegistry from '@kinetick-labs/kh-agent'
import type { Agent } from '@kinetick-labs/kh-agent'
import TerminalSessionService from '@kinetick-labs/kh-terminal'
import * as TerminalLocal from '@kinetick-labs/kh-terminal-bash'
import SandboxProvider from '@kinetick-labs/kh-sandbox'
import type { ConfinedArgv, SandboxPolicy } from '@kinetick-labs/kh-sandbox'
import SandboxPolicyService from '@kinetick-labs/kh-sandbox-policy'
import SessionProjectionRegistry from '@kinetick-labs/kh-session-projection'
import LocalSubprocessRuntime from '@kinetick-labs/kh-subprocess-local'
import SystemPrompt from '@kinetick-labs/kh-system-prompt'
import ToolRuntime from '@kinetick-labs/kh-tools'
import * as ToolBashPersistent from '@kinetick-labs/kh-tool-bash-persistent'
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

async function agent(ctx: Context, cwd: string): Promise<Agent> {
  const id = SessionId('persistent-bash-loader-agent')
  const scope = ctx.plugin(() => {})
  const session = Session.create(id, [], {
    version: SESSION_FORMAT_VERSION, id, createdAt: 0, cwd, isSeeded: false,
  })
  const value: Agent = {
    id,
    options: {},
    session,
    inbox: unsupportedInbox(),
    status: 'idle',
    ctx: scope.ctx,
    send: () => {},
    followup: () => {},
    steer: () => ({ outcome: Promise.resolve({ status: 'rejected' as const }) }),
    inject: () => {},
    cancel() {},
    runMaintenance: task => task(new AbortController().signal),
    whenIdle: () => Promise.resolve(),
  }
  await ctx.agents.register(value)
  return value
}

function text(result: { content: { type: string; text?: string }[] }): string {
  return result.content.filter(block => block.type === 'text').map(block => block.text).join('')
}

const suite = process.platform === 'linux' || process.platform === 'darwin' ? describe : describe.skip

suite('persistent Bash through a real cordis.yml Loader composition', () => {
  it('preserves cwd and environment across calls', async () => {
    root = await mkdtemp(join(tmpdir(), 'kh-persistent-bash-loader-'))
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
      // The silence tier is pushed beyond the send bound, so no send below can
      // settle as inferred_idle: every case proves the controlled-prompt fast
      // path that the production defaults (3.5s silence) would otherwise mask.
      '    idleSilenceMs: 30000',
      '    handoffGraceMs: 100',
      '    scrollbackLines: 20000',
      '    timeoutMs: 2000',
      '    disposeGraceMs: 500',
      "- name: '@kinetick-labs/kh-tool-bash-persistent'",
      '  config:',
      '    timeoutMs: 5000',
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
      ['@kinetick-labs/kh-tool-bash-persistent', ToolBashPersistent],
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

    const owner = await agent(context, root)
    const signal = new AbortController().signal
    const execute = (id: string, command: string) => context!.tools.execute({
      signal,
      callId: ToolCallId(id),
      name: 'bash',
      arguments: { command },
      agent: owner,
    })

    expect(context.tools.schemas().map(schema => schema.name)).toEqual(['bash'])
    await execute('state', 'export KEEP=loader; mkdir -p nested; cd nested')
    const observed = text(await execute('observe', 'printf "cwd=%s keep=%s\\n" "$PWD" "$KEEP"'))
    expect(observed).toContain(`cwd=${join(root, 'nested')} keep=loader`)
    expect(observed).not.toContain('KH_PERSISTENT_BASH')

    const multiline = text(await execute(
      'multiline',
      'value="line one"\nprintf "%s:%s\\n" "$value" "it\'s fine"',
    ))
    expect(multiline).toBe("line one:it's fine\n[Command finished with exit code 0]")
    expect(multiline).not.toContain('KH_PERSISTENT_BASH')

    const heredoc = text(await execute(
      'heredoc',
      "cat <<'EOF'\nalpha\nbeta\nEOF",
    ))
    expect(heredoc).toBe('alpha\nbeta\n[Command finished with exit code 0]')

    const pipeline = text(await execute(
      'pipeline',
      '{ sleep 0.1; printf "delayed\\n"; } | cat',
    ))
    expect(pipeline).toBe('delayed\n[Command finished with exit code 0]')

    // Every trailing newline is dropped before the status trailer.
    const trailing = text(await execute('trailing-newlines', 'printf "tail\\n\\n\\n"'))
    expect(trailing).toBe('tail\n[Command finished with exit code 0]')
    expect(text(await execute('nonzero', 'exit_code() { return 3; }; exit_code')))
      .toBe('[Command finished with exit code 3]')

    const large = text(await execute('large-output', 'seq 1 12050'))
    expect(large.startsWith('1\n2\n3\n')).toBe(true)
    expect(large).toContain('<response clipped>')
    expect(large).not.toContain('beginning of this command output was dropped')

    // `exec` replaces the wrapper before its end marker prints; the seam's
    // stdin_read readiness is what returns the replacement shell's prompt
    // instead of spinning until the tool deadline.
    const execed = text(await execute('exec-replacement', 'exec bash --noprofile --norc -i'))
    expect(execed).toBe('kh> ')

    const exited = text(await execute('exit', 'exit'))
    expect(exited).toContain('next bash call starts from the workspace')
    expect(text(await execute('after-exit', 'printf "%s\\n" "$PWD"'))).toBe(`${root}\n[Command finished with exit code 0]`)
  }, 20_000)
})
