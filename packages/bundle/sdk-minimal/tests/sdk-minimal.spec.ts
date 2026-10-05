/** The standalone SDK-minimal bundle's complete declared Cordis tree. */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as yaml from 'js-yaml'
import { describe, expect, it } from 'vitest'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'

function packageName(specifier: string): string {
  return specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]!
}

describe('kh-sdk-minimal bundle', () => {
  it('declares one standalone allowlisted tree with every row dependency', () => {
    const root = fileURLToPath(new URL('..', import.meta.url))
    const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
      kh?: { bundle?: { patch?: string } }
    }
    expect(manifest.kh?.bundle?.patch).toBe('./cordis.patch.yml')
    const patches = yaml.load(
      readFileSync(resolve(root, manifest.kh!.bundle!.patch!), 'utf8'),
      { schema: entryListSchema },
    ) as Array<{ insert?: Array<{ id?: string; inject?: string[]; name?: string; config?: Record<string, unknown>; disabled?: unknown }> }>
    expect(patches).toHaveLength(1)
    const rows = patches[0]?.insert ?? []
    expect(rows.map(row => [row.id, row.name])).toEqual([
      ['sdk-app-startup', '@kinetick-labs/kh-sdk-app'],
      ['sdk-jsonrpc-server', '@kinetick-labs/kh-sdk-jsonrpc-server'],
      ['deepseek-llm-api-extensions', '@kinetick-labs/kh-deepseek-llm-api-extensions'],
      ['llm-deepseek', '@kinetick-labs/kh-llm-deepseek-api-key'],
      ['sandbox', '@kinetick-labs/kh-sandbox-local'],
      ['session-projection', '@kinetick-labs/kh-session-projection'],
      ['sandbox-policy', '@kinetick-labs/kh-sandbox-policy'],
      ['subprocess', '@kinetick-labs/kh-subprocess-local'],
      ['pty', '@kinetick-labs/kh-terminal'],
      ['terminal-bash', '@kinetick-labs/kh-terminal-bash'],
      ['terminal-pwsh', '@kinetick-labs/kh-terminal-bash'],
      ['timer', '@deepseek-ai/cordis-plugin-timer'],
      ['llm', '@kinetick-labs/kh-llm'],
      ['session', '@kinetick-labs/kh-session'],
      ['session-title', '@kinetick-labs/kh-session-title'],
      ['system-prompt', '@kinetick-labs/kh-system-prompt'],
      ['tools', '@kinetick-labs/kh-tools'],
      ['mcp-resources', '@kinetick-labs/kh-mcp-resources'],
      ['agent', '@kinetick-labs/kh-agent'],
      ['llm-retry', '@kinetick-labs/kh-llm-retry'],
      ['jobs', '@kinetick-labs/kh-jobs-local'],
      ['agent-loop', '@kinetick-labs/kh-agent-loop'],
      ['persistent-bash', '@kinetick-labs/kh-tool-bash-persistent'],
      ['persistent-pwsh', '@kinetick-labs/kh-tool-pwsh-persistent'],
      ['sessions', '@kinetick-labs/kh-session-persistence-jsonl'],
    ])
    expect(rows.find(row => row.id === 'sdk-app-startup')?.config).toEqual({ profile: 'sdk-minimal' })
    expect(rows.find(row => row.id === 'sdk-jsonrpc-server')).toMatchObject({
      inject: ['sdkAppStartup', 'loader'],
      config: { maxTokensAsSuccess: false },
    })
    expect(rows.find(row => row.id === 'llm-deepseek')?.config).toEqual({
      apiKeyEnv: 'DEEPSEEK_API_KEY',
      defaultContextWindow: { __jsExpr: 'Number(process.env.KH_CONTEXT_WINDOW ?? 1000000)' },
      streamIdleTimeoutMs: 172800000,
    })
    expect(rows.find(row => row.id === 'system-prompt')?.config).toEqual({
      includeHarnessIdentity: false,
      includeRuntimeContext: false,
      personaPrefix: { __jsExpr: "process.env.KH_SYSTEM_PROMPT ?? 'You are a helpful software engineer assistant.'" },
    })
    expect(rows.find(row => row.id === 'agent-loop')?.config).toEqual({ agents: [] })
    expect(rows.find(row => row.id === 'terminal-bash')).toMatchObject({
      disabled: { __jsExpr: "process.platform === 'win32'" },
    })
    expect(rows.find(row => row.id === 'terminal-pwsh')).toMatchObject({
      disabled: { __jsExpr: "process.platform !== 'win32'" },
      config: { shellDialect: 'pwsh', timeoutMs: 300000 },
    })
    expect(Object.keys(manifest.dependencies ?? {}).sort()).toEqual(
      [...new Set(rows.map(row => row.name).filter((name): name is string => name !== undefined).map(packageName))].sort(),
    )
  })
})
