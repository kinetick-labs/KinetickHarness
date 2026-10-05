import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_KH_HOME_DISPLAY,
  KH_HOME_DIR_NAME,
  canonicalizeWatchPath,
  defaultKhHome,
  khCachePath,
  khHomeDisplay,
  khHomePath,
  expandHomePath,
  resolveKhHome,
} from '@kinetick-labs/kh-home-paths'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('kh path helpers', () => {
  it('owns the shared default KH home directory name', () => {
    expect(KH_HOME_DIR_NAME).toBe('.kh')
    expect(DEFAULT_KH_HOME_DISPLAY).toBe('~/.kh')
    expect(defaultKhHome()).toBe(join(homedir(), '.kh'))
  })

  it('expands tilde paths without changing non-tilde paths', () => {
    expect(expandHomePath('~')).toBe(homedir())
    expect(expandHomePath('~/.kh')).toBe(join(homedir(), '.kh'))
    expect(expandHomePath('~\\.kh')).toBe(join(homedir(), '.kh'))
    expect(expandHomePath('/tmp/.kh')).toBe('/tmp/.kh')
    expect(expandHomePath('~other/.kh')).toBe('~other/.kh')
  })

  it('resolves explicit path before KH_HOME and the default', () => {
    const envHome = join(homedir(), 'env-kh')

    expect(resolveKhHome('/tmp/explicit-kh', { KH_HOME: '~/env-kh' })).toBe(resolve('/tmp/explicit-kh'))
    expect(resolveKhHome(undefined, { KH_HOME: '~/env-kh' })).toBe(envHome)
    expect(resolveKhHome(undefined, {})).toBe(defaultKhHome())
  })

  it('treats an empty or whitespace-only KH_HOME as unset', () => {
    expect(resolveKhHome(undefined, { KH_HOME: '' })).toBe(defaultKhHome())
    expect(resolveKhHome(undefined, { KH_HOME: '   ' })).toBe(defaultKhHome())
  })

  it('reads DSH_HOME only when KH_HOME is unset', () => {
    expect(resolveKhHome(undefined, { DSH_HOME: '~/old-kh' })).toBe(join(homedir(), 'old-kh'))
    expect(resolveKhHome(undefined, { KH_HOME: '~/env-kh', DSH_HOME: '~/old-kh' })).toBe(join(homedir(), 'env-kh'))
    expect(resolveKhHome(undefined, { KH_HOME: '   ', DSH_HOME: '~/old-kh' })).toBe(join(homedir(), 'old-kh'))
  })

  it('joins child segments onto the resolved KH_HOME', () => {
    vi.stubEnv('KH_HOME', '~/env-kh')
    expect(khHomePath()).toBe(join(homedir(), 'env-kh'))
    expect(khHomePath('storages', 'cache')).toBe(join(homedir(), 'env-kh', 'storages', 'cache'))
  })

  it('labels a resolved home by whether it is the default root', () => {
    expect(khHomeDisplay(resolve(defaultKhHome()))).toBe('~/.kh')
    expect(khHomeDisplay('/some/other/root')).toBe('$KH_HOME')
  })

  it.each([
    [undefined, join(homedir(), '.kh')],
    ['', join(homedir(), '.kh')],
    ['   ', join(homedir(), '.kh')],
    ['~/env-kh', join(homedir(), 'env-kh')],
    ['./relative-kh', resolve('./relative-kh')],
  ] as const)('resolves cache paths with KH_HOME=%j', (home, expectedHome) => {
    vi.stubEnv('KH_HOME', home)
    try {
      expect(khCachePath()).toBe(join(expectedHome, 'cache'))
      expect(khCachePath('models', 'index.json')).toBe(join(expectedHome, 'cache', 'models', 'index.json'))
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('resolves configured cache homes before the environment', () => {
    vi.stubEnv('KH_HOME', '~/env-kh')
    try {
      expect(khCachePath({ khHome: '~/explicit-kh' })).toBe(join(homedir(), 'explicit-kh', 'cache'))
      expect(khCachePath({ khHome: './explicit-kh' }, 'attachments', 'request-images'))
        .toBe(resolve('./explicit-kh/cache/attachments/request-images'))
      expect(khCachePath({}, 'attachments')).toBe(join(homedir(), 'env-kh', 'cache', 'attachments'))
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('canonicalizes a watcher ancestor while preserving a missing suffix', async () => {
    const root = await mkdtemp(join(tmpdir(), 'kh-watch-path-'))
    const target = join(root, 'target')
    const alias = join(root, 'alias')
    try {
      await mkdir(target)
      await symlink(target, alias, process.platform === 'win32' ? 'junction' : 'dir')
      await expect(canonicalizeWatchPath(alias)).resolves.toBe(await realpath(target))
      await expect(canonicalizeWatchPath(join(alias, 'later', 'config.yml'))).resolves.toBe(
        join(await realpath(target), 'later', 'config.yml'),
      )
      const file = join(root, 'file')
      await writeFile(file, 'not a directory')
      await expect(canonicalizeWatchPath(join(file, 'child'))).rejects.toMatchObject({ code: 'ENOTDIR' })
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
