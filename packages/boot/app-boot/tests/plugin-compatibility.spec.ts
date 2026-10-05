/** Plugin peer checks retain exact mismatches and never inherit exemption entries. */

import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import semver from 'semver'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { evaluatePluginCompatibility, getKhRuntimeVersion, pluginCompatibilityWarning } from '../src/plugin-compatibility.ts'

const runtime = '0.1.7-alpha.1'
const identity = { name: '@example/plugin', version: '2.0.0' }
const incompatible = { ...identity, peerDependencies: { '@kinetick-labs/kh': '^0.2.0' } }

function check(peerDependencies: object) {
  return evaluatePluginCompatibility({ ...identity, peerDependencies }, {}, runtime)
}

afterEach(() => vi.restoreAllMocks())

describe('kh runtime version', () => {
  it('reads the exact version with a string path accepted by executable virtual filesystems', () => {
    const { version: expected } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string }
    const read = vi.spyOn(fs, 'readFileSync')
    expect(getKhRuntimeVersion()).toBe(expected)
    expect(semver.valid(expected)).not.toBeNull()
    expect(read).toHaveBeenCalledWith(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')
  })

  it.each([{}, { version: null }, { version: 1 }, { version: '' }, { version: 'not-semver' }])(
    'rejects an invalid or absent package version: %j', (manifest) => {
      vi.spyOn(fs, 'readFileSync').mockReturnValueOnce(JSON.stringify(manifest))
      expect(() => getKhRuntimeVersion()).toThrow('Invalid kh runtime version')
    },
  )

  it.each(['null', '[]', '1', '"text"'])('rejects non-object package JSON: %s', (contents) => {
    vi.spyOn(fs, 'readFileSync').mockReturnValueOnce(contents)
    expect(() => getKhRuntimeVersion()).toThrow('app-boot package.json must be an object')
  })

  it('propagates malformed JSON and read failures', () => {
    const read = vi.spyOn(fs, 'readFileSync').mockReturnValueOnce('{')
    expect(() => getKhRuntimeVersion()).toThrow(SyntaxError)
    read.mockImplementationOnce(() => { throw new Error('manifest unavailable') })
    expect(() => getKhRuntimeVersion()).toThrow('manifest unavailable')
  })
})

describe('plugin compatibility', () => {
  it('defaults to the installed runtime and needs no identity without mismatches', () => {
    expect(evaluatePluginCompatibility({})).toBeUndefined()
    expect(evaluatePluginCompatibility({ peerDependencies: { '@kinetick-labs/kh': getKhRuntimeVersion() } })).toBeUndefined()
    expect(check({})).toBeUndefined()
  })

  it.each(['*', '^0.1.0', '~0.1.0', '>=0.1.0 <0.2.0', '0.1.x', '0.1.0 - 0.1.9', '^0.2.0 || ^0.1.0', runtime])(
    'includes prereleases in supported semver range %s', (range) => {
      expect(check({ '@kinetick-labs/kh': range, '@kinetick-labs/kh-session': range })).toBeUndefined()
    },
  )

  it.each(['workspace:^', 'workspace:~', 'workspace:*'])('uses the source runtime for %s', (range) => {
    expect(check({ '@kinetick-labs/kh-session': range })).toBeUndefined()
  })

  it('checks the intersection of kh requirements and returns only mismatches', () => {
    expect(check({
      '@kinetick-labs/kh': '^0.1.0',
      '@kinetick-labs/kh-session': '>=0.2.0',
      '@kinetick-labs/kh-tools': '<0.1.0',
      '@deepseek-ai/cordis': '^99.0.0',
    })).toEqual({
      ...identity,
      runtimeVersion: runtime,
      peers: { '@kinetick-labs/kh-session': '>=0.2.0', '@kinetick-labs/kh-tools': '<0.1.0' },
      exempted: false,
    })
  })

  it.each(['^0.2.0', '>=0.1.7', 'broken', '', ' ', 'workspace:>=0.2.0', 'file:../kh', 'npm:kh@*'])(
    'fails closed for an incompatible or malformed range %j', (range) => {
      expect(check({ '@kinetick-labs/kh': range })?.peers).toEqual({ '@kinetick-labs/kh': range })
    },
  )

  it('ignores unrelated names and dependency fields', () => {
    expect(check({
      '@deepseek-ai/cordis': 'broken', '@deepseek-ai/cordis-plugin-loader': '^99',
      '@other/kh': '^99', '@kinetick-labs/khx': '^99', kh: '^99',
      constructor: '^99', hasOwnProperty: '^99', ['__proto__']: '^99',
    })).toBeUndefined()
    expect(evaluatePluginCompatibility({ dependencies: { '@kinetick-labs/kh': '^99' } }, {}, runtime)).toBeUndefined()
  })

  it.each([null, [], 'bad', 1, false, undefined])('rejects malformed peerDependencies: %j', (peerDependencies) => {
    expect(() => evaluatePluginCompatibility({ ...identity, peerDependencies }, {}, runtime)).toThrow('peerDependencies must be an object')
  })

  it.each([null, [], {}, 1, false, undefined])('rejects non-string peer ranges: %j', (range) => {
    for (const name of ['@kinetick-labs/kh', '@deepseek-ai/cordis']) {
      expect(() => check({ [name]: range })).toThrow(`peerDependencies[${JSON.stringify(name)}] must be a string`)
    }
  })

  it.each(['name', 'version'] as const)('requires own non-empty %s on a mismatch', (field) => {
    for (const value of [undefined, null, '', ' ', 3]) {
      expect(() => evaluatePluginCompatibility({ ...incompatible, [field]: value }, {}, runtime))
        .toThrow(`Plugin manifest ${field} must be a non-empty string`)
    }
    const inherited = Object.assign(
      Object.create({ [field]: identity[field] }) as object,
      Object.fromEntries(Object.entries(incompatible).filter(([name]) => name !== field)),
    )
    expect(() => evaluatePluginCompatibility(inherited, {}, runtime)).toThrow(`Plugin manifest ${field}`)
  })

  it('ignores inherited peer declarations and inherited peer entries', () => {
    expect(evaluatePluginCompatibility(Object.create(incompatible) as object, {}, runtime)).toBeUndefined()
    expect(check(Object.create(incompatible.peerDependencies) as object)).toBeUndefined()
    expect(check(Object.assign(Object.create({ '@kinetick-labs/kh': '^99' }) as object, { '@kinetick-labs/kh-session': '*' }))).toBeUndefined()
  })

  it('rejects an invalid explicit runtime even when no peers are declared', () => {
    expect(() => evaluatePluginCompatibility({}, {}, 'invalid')).toThrow('Invalid kh runtime version')
  })

  it('rejects array plugin manifests', () => {
    expect(() => evaluatePluginCompatibility([], {}, runtime)).toThrow('Plugin manifest must be an object')
  })
})

describe('exact-version exemptions', () => {
  const exemptions = { '@example/plugin@2.0.0': [runtime] }

  it('exempts only the exact scoped plugin and runtime versions', () => {
    expect(evaluatePluginCompatibility(incompatible, exemptions, runtime)?.exempted).toBe(true)
    expect(evaluatePluginCompatibility({ ...incompatible, version: '2.0.1' }, exemptions, runtime)?.exempted).toBe(false)
    expect(evaluatePluginCompatibility({ ...incompatible, name: '@other/plugin' }, exemptions, runtime)?.exempted).toBe(false)
    expect(evaluatePluginCompatibility(incompatible, exemptions, '0.1.7-alpha.2')?.exempted).toBe(false)
    expect(evaluatePluginCompatibility(incompatible, exemptions, `${runtime}+build`)?.exempted).toBe(false)
  })

  it.each(['*', '^0.1.0', '0.1.7', '0.1.7-alpha.2'])('does not interpret exemption value %s as a range', (version) => {
    expect(evaluatePluginCompatibility(incompatible, { '@example/plugin@2.0.0': [version] }, runtime)?.exempted).toBe(false)
  })

  it('does not accept inherited exemptions, but accepts own entries on null-prototype maps', () => {
    expect(evaluatePluginCompatibility(incompatible, Object.create(exemptions) as typeof exemptions, runtime)?.exempted).toBe(false)
    const ownExemptions = Object.assign(Object.create(null) as object, exemptions)
    expect(evaluatePluginCompatibility(incompatible, ownExemptions, runtime)?.exempted).toBe(true)
  })

  it.each(['constructor', 'hasOwnProperty', '__proto__'])('handles plugin identity %s without prototype lookup', (name) => {
    const manifest = { ...incompatible, name }
    expect(evaluatePluginCompatibility(manifest, {}, runtime)?.exempted).toBe(false)
    expect(evaluatePluginCompatibility(manifest, { [`${name}@2.0.0`]: [runtime] }, runtime)?.exempted).toBe(true)
  })

  it('does not produce issues for compatible exempted plugins', () => {
    expect(evaluatePluginCompatibility({ ...identity, peerDependencies: { '@kinetick-labs/kh': '*' } }, exemptions, runtime)).toBeUndefined()
  })
})

describe('compatibility warning', () => {
  it.each([false, true])('retains mismatch details and risk when exemption status is %s', (exempted) => {
    expect(pluginCompatibilityWarning({
      ...identity, runtimeVersion: runtime,
      peers: { '@kinetick-labs/kh': '^0.2.0', '@kinetick-labs/kh-session': 'broken' }, exempted,
    })).toBe(
      'Plugin @example/plugin@2.0.0 is incompatible with kh 0.1.7-alpha.1: '
      + 'peerDependencies {"@kinetick-labs/kh":"^0.2.0","@kinetick-labs/kh-session":"broken"}. '
      + 'Running it may cause crashes or data loss. '
      + 'Update the plugin or install a plugin version compatible with this kh runtime. '
      + 'To accept this risk explicitly, grant the exact-version exemption for @example/plugin@2.0.0 on kh 0.1.7-alpha.1 '
      + 'with `kh plugin allow-version` or the plugin manager, then retry the installation or restart kh. '
      + `Exact-version exemption: ${exempted ? 'active' : 'not active'}.`,
    )
  })
})
