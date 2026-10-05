/**
 * Registry tests for `@kinetick-labs/kh-shell-env`: built-in facts, contributor
 * ownership and validation, collection ordering, effect-scoped disposal, and
 * the explicit disposer contract.
 */

import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { ToolCallId } from '@kinetick-labs/kh-llm'
import type { Agent } from '@kinetick-labs/kh-agent'
import { SESSION_FORMAT_VERSION } from '@kinetick-labs/kh-session'
import type { ToolExecution } from '@kinetick-labs/kh-tools'
import { ShellEnvRegistry } from '@kinetick-labs/kh-shell-env'
import * as BashEnvPlugin from '@kinetick-labs/kh-shell-env'

const testToolSignal = new AbortController().signal

afterEach(() => vi.unstubAllEnvs())

function execution(sessionId?: string): ToolExecution {
  return {
    signal: testToolSignal,
    token: Symbol('bash-env-test') as ToolExecution['token'],
    callId: ToolCallId('bash-env-call'),
    rootCallId: ToolCallId('bash-env-call'),
    name: 'bash',
    arguments: { command: 'true' },
    ...(sessionId === undefined
      ? {}
      : {
        agent: {
          session: {
            header: { version: SESSION_FORMAT_VERSION, id: sessionId, createdAt: 0, isSeeded: false },
          },
        } as unknown as Agent,
      }),
  }
}

describe('ShellEnvRegistry', () => {
  it('collects unconditional shell facts and the current agent session id', () => {
    const ctx = new Context()
    const registry = new ShellEnvRegistry(ctx, { khHome: './test-kh-home' })

    expect(registry.collect(execution())).toEqual({
      KH_HOME: resolve('./test-kh-home'),
      KH_SHELL: '1',
    })
    expect(registry.collect(execution('session-a'))).toEqual({
      KH_HOME: resolve('./test-kh-home'),
      KH_SESSION_ID: 'session-a',
      KH_SHELL: '1',
    })
  })

  it('collects the launcher-provided profile name and directory when a profile context exists', () => {
    const ctx = new Context()
    ctx.provide('profileContext', {
      name: 'web', dir: '/profiles/web', patchPath: '/profiles/web/cordis.patch.yml', installAnchor: '/kh/package.json',
      cwd: '/work', home: '/home', startedBundles: [], overlays: [],
    })
    const registry = new ShellEnvRegistry(ctx, { khHome: './test-kh-home' })
    expect(registry.collect(execution())).toMatchObject({ KH_PROFILE: 'web', KH_PROFILE_DIR: '/profiles/web' })
    expect(() => registry.register({
      name: 'profile-claimer',
      variables: { KH_PROFILE: { description: 'Reserved key.' } },
      resolve: () => ({}),
    })).toThrow(/reserved key "KH_PROFILE"/)
  })

  it('resolves KH_HOME from the ambient override or the user-home default', () => {
    vi.stubEnv('KH_HOME', './ambient-kh-home')
    const fromEnvironment = new ShellEnvRegistry(new Context())
    expect(fromEnvironment.collect(execution()).KH_HOME).toBe(resolve('./ambient-kh-home'))

    vi.stubEnv('KH_HOME', undefined)
    const fromDefault = new ShellEnvRegistry(new Context())
    expect(fromDefault.collect(execution()).KH_HOME).toBe(join(homedir(), '.kh'))
  })

  it('collects declared contributor variables and omits unavailable values', () => {
    const ctx = new Context()
    const registry = new ShellEnvRegistry(ctx, { khHome: './test-kh-home' })
    registry.register({
      name: 'optional-session-fact',
      variables: {
        KH_SESSION_OPTIONAL: { description: 'Optional session-scoped test fact.' },
      },
      resolve: exec => exec.agent === undefined ? {} : { KH_SESSION_OPTIONAL: exec.agent.session.header.id },
    })
    registry.register({
      name: 'always-available-fact',
      variables: {
        KH_ALWAYS_AVAILABLE: { description: 'Always-available test fact.' },
      },
      resolve: () => ({ KH_ALWAYS_AVAILABLE: 'yes' }),
    })

    expect(registry.collect(execution())).not.toHaveProperty('KH_SESSION_OPTIONAL')
    expect(registry.collect(execution()).KH_ALWAYS_AVAILABLE).toBe('yes')
    expect(registry.collect(execution('session-b')).KH_SESSION_OPTIONAL).toBe('session-b')
    expect(registry.list()).toEqual([
      {
        contributor: 'always-available-fact',
        description: 'Always-available test fact.',
        key: 'KH_ALWAYS_AVAILABLE',
      },
      {
        contributor: 'optional-session-fact',
        description: 'Optional session-scoped test fact.',
        key: 'KH_SESSION_OPTIONAL',
      },
    ])
  })

  it('rejects duplicate variable ownership at registration time', () => {
    const ctx = new Context()
    const registry = new ShellEnvRegistry(ctx, { khHome: './test-kh-home' })
    registry.register({
      name: 'first',
      variables: { KH_SHARED: { description: 'First owner.' } },
      resolve: () => ({ KH_SHARED: 'first' }),
    })

    expect(() => registry.register({
      name: 'second',
      variables: { KH_SHARED: { description: 'Second owner.' } },
      resolve: () => ({ KH_SHARED: 'second' }),
    })).toThrow(/KH_SHARED.*first.*second|KH_SHARED.*second.*first/)
  })

  it('rejects duplicate contributor names and malformed declarations', () => {
    const registry = new ShellEnvRegistry(new Context(), { khHome: './test-kh-home' })
    registry.register({
      name: 'declared',
      variables: { KH_DECLARED: { description: 'Declared fact.' } },
      resolve: () => ({}),
    })

    expect(() => registry.register({
      name: 'declared',
      variables: { KH_ANOTHER: { description: 'Another fact.' } },
      resolve: () => ({}),
    })).toThrow(/already registered/)
    expect(() => registry.register({
      name: ' ',
      variables: { KH_BLANK_NAME: { description: 'Blank owner.' } },
      resolve: () => ({}),
    })).toThrow(/name must be non-empty/)
    expect(() => registry.register({
      name: 'invalid-key',
      variables: { dsh_invalid: { description: 'Invalid key.' } } as unknown as Record<'KH_INVALID', { description: string }>,
      resolve: () => ({}),
    })).toThrow(/invalid key/)
    expect(() => registry.register({
      name: 'reserved-key',
      variables: { KH_HOME: { description: 'Reserved key.' } },
      resolve: () => ({}),
    })).toThrow(/reserved key/)
    expect(() => registry.register({
      name: 'blank-description',
      variables: { KH_BLANK_DESCRIPTION: { description: ' ' } },
      resolve: () => ({}),
    })).toThrow(/must describe/)
  })

  it('rejects undeclared variables returned by a contributor', () => {
    const ctx = new Context()
    const registry = new ShellEnvRegistry(ctx, { khHome: './test-kh-home' })
    registry.register({
      name: 'drifted-provider',
      variables: { KH_DECLARED: { description: 'Declared fact.' } },
      resolve: () => ({ KH_UNDECLARED: 'bad' }),
    })

    expect(() => registry.collect(execution())).toThrow(/drifted-provider.*KH_UNDECLARED/)
  })

  it('rejects non-string values returned by a contributor', () => {
    const registry = new ShellEnvRegistry(new Context(), { khHome: './test-kh-home' })
    registry.register({
      name: 'wrong-value-type',
      variables: { KH_STRING: { description: 'String fact.' } },
      resolve: () => ({ KH_STRING: 42 }) as unknown as Record<'KH_STRING', string>,
    })

    expect(() => registry.collect(execution())).toThrow(/wrong-value-type.*non-string.*KH_STRING/)
  })

  it('removes an effect-scoped contributor when its plugin is disposed', async () => {
    const ctx = new Context()
    const registry = new ShellEnvRegistry(ctx, { khHome: './test-kh-home' })
    const fiber = await ctx.plugin({
      inject: ['shellEnv'],
      apply(inner: Context) {
        inner.shellEnv.register({
          name: 'temporary',
          variables: { KH_TEMPORARY: { description: 'Temporary fact.' } },
          resolve: () => ({ KH_TEMPORARY: 'present' }),
        })
      },
    })

    expect(registry.collect(execution()).KH_TEMPORARY).toBe('present')
    await fiber.dispose()
    expect(registry.collect(execution())).not.toHaveProperty('KH_TEMPORARY')
  })

  it('returns an explicit contributor disposer', () => {
    const registry = new ShellEnvRegistry(new Context(), { khHome: './test-kh-home' })
    const dispose = registry.register({
      name: 'explicit-disposal',
      variables: { KH_EXPLICIT_DISPOSAL: { description: 'Explicitly disposed fact.' } },
      resolve: () => ({ KH_EXPLICIT_DISPOSAL: 'present' }),
    })

    expect(registry.collect(execution()).KH_EXPLICIT_DISPOSAL).toBe('present')
    dispose()
    expect(registry.collect(execution())).not.toHaveProperty('KH_EXPLICIT_DISPOSAL')
  })

  it('the plugin registers the service with no contributors on load', async () => {
    const ctx = new Context()
    await ctx.plugin(BashEnvPlugin)
    expect(ctx.shellEnv).toBeInstanceOf(ShellEnvRegistry)
    expect(ctx.shellEnv.list()).toEqual([])
  })
})
