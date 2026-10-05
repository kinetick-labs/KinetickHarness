/**
 * The identity, timestamp, link, mutation, and durability-sink guarantees
 * MemoryVfs owes its consumers, asserted directly rather than through the
 * `node:fs` bridge.
 *
 * `kh-fs-local` builds a version token from `dev:ino:size:mtimeNs:ctimeNs` and
 * refuses a write whose token moved since it read. Two properties carry that:
 * `ino` identifies the entry at a path, and `mtimeMs` moves on every write. The
 * timestamp cases freeze the clock, because these writes are in memory and two
 * revisions routinely land in the same millisecond — a real-clock test passes
 * whether or not the strict increment exists.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryVfs } from '../../src/storage/memory.ts'
import type { VfsBigIntStats, VfsMutation, VfsMutationSink, VfsStats } from '../../src/storage/types.ts'

const identity = (vfs: MemoryVfs, path: string): bigint =>
  (vfs.statSync(path, { bigint: true }) as VfsBigIntStats).ino

const linkCount = (vfs: MemoryVfs, path: string): bigint =>
  (vfs.statSync(path, { bigint: true }) as VfsBigIntStats).nlink

const modified = (vfs: MemoryVfs, path: string): number => (vfs.statSync(path) as VfsStats).mtimeMs

afterEach(() => { vi.restoreAllMocks() })

describe('entry identity', () => {
  it('distinguishes paths and holds each identity across repeated stats', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/one.txt', 'one')
    vfs.seed('/kh/two.txt', 'two')
    const first = identity(vfs, '/kh/one.txt')
    expect(identity(vfs, '/kh/two.txt')).not.toBe(first)
    expect(identity(vfs, '/kh/one.txt')).toBe(first)
  })

  it('forgets the identities under a directory removed as a subtree', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/skills/git/SKILL.md', '# git\n')
    const before = identity(vfs, '/kh/skills/git/SKILL.md')
    vfs.rmSync('/kh/skills', { recursive: true })
    vfs.seed('/kh/skills/git/SKILL.md', '# git rebuilt\n')
    expect(identity(vfs, '/kh/skills/git/SKILL.md')).not.toBe(before)
  })

  it('moves the source identity when a file replaces another path', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/from.txt', 'moved')
    vfs.seed('/kh/to.txt', 'replaced')
    const [source, destination] = [identity(vfs, '/kh/from.txt'), identity(vfs, '/kh/to.txt')]
    vfs.renameSync('/kh/from.txt', '/kh/to.txt')
    const renamed = identity(vfs, '/kh/to.txt')
    expect(vfs.readFileSync('/kh/to.txt', 'utf8')).toBe('moved')
    expect([renamed === source, renamed === destination]).toEqual([true, false])
  })
})

describe('modification time', () => {
  it('hydrates explicit metadata without confusing timestamps with permission bits', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/restored', 'value', { mode: 0o600, mtimeMs: 1_600_000_000_000 })
    vfs.seedDirectory('/kh/restored-directory', { mode: 0o700, mtimeMs: 1_600_000_000_001 })
    const stats = vfs.statSync('/kh/restored') as VfsStats
    const directory = vfs.statSync('/kh/restored-directory') as VfsStats
    expect([stats.mode & 0o777, stats.mtimeMs]).toEqual([0o600, 1_600_000_000_000])
    expect([directory.mode & 0o777, directory.mtimeMs]).toEqual([0o700, 1_600_000_000_001])
  })

  it('advances on every write even while the clock stands still', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const vfs = new MemoryVfs()
    vfs.seed('/kh/log.jsonl', 'first\n')
    const seeded = modified(vfs, '/kh/log.jsonl')
    vfs.writeFileSync('/kh/log.jsonl', 'second\n')
    const written = modified(vfs, '/kh/log.jsonl')
    vfs.appendFileSync('/kh/log.jsonl', 'third\n')
    const appended = modified(vfs, '/kh/log.jsonl')
    vfs.truncateSync('/kh/log.jsonl', 6)
    const truncated = modified(vfs, '/kh/log.jsonl')
    expect([written > seeded, appended > written, truncated > appended]).toEqual([true, true, true])
    // One millisecond per revision: the increment is the minimum that separates
    // two tokens, not a coarser bump that would skew a real timestamp.
    expect(truncated - seeded).toBe(3)
  })

  it('takes the clock once the clock has passed the entry', () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const vfs = new MemoryVfs()
    vfs.seed('/kh/log.jsonl', 'first\n')
    clock.mockReturnValue(1_700_000_005_000)
    vfs.writeFileSync('/kh/log.jsonl', 'second\n')
    expect(modified(vfs, '/kh/log.jsonl')).toBe(1_700_000_005_000)
  })

  it('extends truncation with zero bytes', async () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/file', new Uint8Array([1, 2]))
    vfs.truncateSync('/kh/file', 5)
    expect([...vfs.readFileSync('/kh/file') as Uint8Array]).toEqual([1, 2, 0, 0, 0])
    const handle = vfs.open('/kh/file', 'r+')
    await handle.truncate(7)
    expect([...vfs.readFileSync('/kh/file') as Uint8Array]).toEqual([1, 2, 0, 0, 0, 0, 0])
  })

  it('advances a directory only when its immediate entry set changes', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const vfs = new MemoryVfs()
    vfs.seedDirectory('/kh/workspace')
    const empty = modified(vfs, '/kh/workspace')
    vfs.writeFileSync('/kh/workspace/file.txt', 'one')
    const created = modified(vfs, '/kh/workspace')
    vfs.writeFileSync('/kh/workspace/file.txt', 'two')
    const rewritten = modified(vfs, '/kh/workspace')
    vfs.rmSync('/kh/workspace/file.txt')
    const removed = modified(vfs, '/kh/workspace')
    expect([created > empty, rewritten === created, removed > rewritten]).toEqual([true, true, true])
  })
})

describe('mutation publication', () => {
  it('publishes only committed runtime changes and keeps image seeding silent', () => {
    const vfs = new MemoryVfs()
    const mutations: VfsMutation[] = []
    vfs.subscribe((mutation) => { mutations.push(mutation) })
    vfs.seed('/kh/seeded.txt', 'seeded')
    expect(mutations).toEqual([])
    vfs.writeFileSync('/kh/seeded.txt', 'changed')
    vfs.mkdirSync('/kh/created')
    vfs.chmodSync('/kh/created', 0o700)
    vfs.renameSync('/kh/seeded.txt', '/kh/renamed.txt')
    vfs.rmSync('/kh/created', { recursive: true })
    expect(mutations.map(mutation => ({
      kind: mutation.kind,
      path: mutation.path,
      ...mutation.kind === 'write' ? { entryChanged: mutation.entryChanged } : {},
      ...mutation.kind === 'chmod' ? { mode: mutation.mode } : {},
    }))).toEqual([
      { kind: 'write', path: '/kh/seeded.txt', entryChanged: false },
      { kind: 'mkdir', path: '/kh/created' },
      { kind: 'chmod', path: '/kh/created', mode: 0o700 },
      { kind: 'remove', path: '/kh/seeded.txt' },
      { kind: 'write', path: '/kh/renamed.txt', entryChanged: true },
      { kind: 'remove', path: '/kh/created' },
    ])
    const renamed = mutations[4]
    expect(renamed?.kind === 'write' && new TextDecoder().decode(renamed.bytes)).toBe('changed')
    expect(() => { vfs.writeFileSync('/missing/file', 'no') }).toThrow(/ENOENT/)
    expect(mutations).toHaveLength(6)
  })

  it('contains a faulty observer and lets disposal stop later notifications', () => {
    const vfs = new MemoryVfs()
    vfs.seedDirectory('/kh')
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {})
    const first = vfs.subscribe(() => { throw new Error('observer failed') })
    const seen: string[] = []
    const second = vfs.subscribe((mutation) => { seen.push(mutation.path) })
    vfs.writeFileSync('/kh/one', '1')
    first()
    second()
    vfs.writeFileSync('/kh/two', '2')
    expect(seen).toEqual(['/kh/one'])
    expect(reported).toHaveBeenCalledOnce()
  })

  it('feeds the same complete mutations to a durable sink and live subscribers', async () => {
    const recorded: VfsMutation[] = []
    let flushes = 0
    const sink: VfsMutationSink = {
      record: (mutation) => { recorded.push(mutation) },
      flush: async () => { flushes += 1 },
    }
    const vfs = new MemoryVfs({ sink })
    vfs.seedDirectory('/kh')
    const observed: VfsMutation[] = []
    vfs.subscribe((mutation) => { observed.push(mutation) })
    vfs.writeFileSync('/kh/log', 'a')
    vfs.appendFileSync('/kh/log', 'bc')
    await vfs.flush()
    expect(observed).toEqual(recorded)
    expect(observed[0]).toBe(recorded[0])
    expect(recorded[0]).toMatchObject({ kind: 'write', path: '/kh/log', mode: 0o644, entryChanged: true })
    expect(recorded[1]).toMatchObject({ kind: 'write', path: '/kh/log', mode: 0o644, entryChanged: false, appendedFrom: 1 })
    expect(recorded[1]?.kind === 'write' && new TextDecoder().decode(recorded[1].bytes)).toBe('abc')
    expect(flushes).toBe(1)
  })

  it('publishes descriptor writes at the file identity current path', () => {
    const mutations: VfsMutation[] = []
    const vfs = new MemoryVfs()
    vfs.seed('/kh/source', 'old')
    const descriptor = vfs.openFileSync('/kh/source', 'r+')
    vfs.subscribe((mutation) => { mutations.push(mutation) })
    vfs.renameSync('/kh/source', '/kh/destination')
    mutations.length = 0
    descriptor.write(0, new TextEncoder().encode('new'))
    expect(mutations.map(mutation => mutation.path)).toEqual(['/kh/destination'])
    expect(vfs.readFileSync('/kh/destination', 'utf8')).toBe('new')
    vfs.unlinkSync('/kh/destination')
    mutations.length = 0
    descriptor.write(0, new TextEncoder().encode('detached'))
    expect(mutations).toEqual([])
    expect(new TextDecoder().decode(descriptor.read(0, descriptor.stat().size))).toBe('detached')
  })

  it('reports the path identity through a BigInt file handle stat', async () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/session.lock', '')
    const handle = vfs.open('/kh/session.lock', 'w')
    const held = await handle.stat({ bigint: true }) as VfsBigIntStats
    const current = vfs.statSync('/kh/session.lock', { bigint: true }) as VfsBigIntStats

    expect([held.dev, held.ino]).toEqual([current.dev, current.ino])
    await handle.chmod(0o600)
    expect((vfs.statSync('/kh/session.lock') as VfsStats).mode & 0o777).toBe(0o600)
    await handle.close()
  })

  it('decomposes a directory rename into replayable destination state', () => {
    const recorded: VfsMutation[] = []
    const vfs = new MemoryVfs({
      sink: { record: (mutation) => { recorded.push(mutation) }, flush: () => Promise.resolve() },
    })
    vfs.seedDirectory('/kh/staging/nested', { mode: 0o700 })
    vfs.seed('/kh/staging/nested/file', 'value', { mode: 0o600 })
    vfs.renameSync('/kh/staging', '/kh/published')

    expect(recorded.map(mutation => [mutation.kind, mutation.path])).toEqual([
      ['remove', '/kh/staging'],
      ['mkdir', '/kh/published'],
      ['mkdir', '/kh/published/nested'],
      ['write', '/kh/published/nested/file'],
    ])
    expect(recorded[3]).toMatchObject({ kind: 'write', mode: 0o600, entryChanged: true })
    expect(recorded[3]?.kind === 'write' && new TextDecoder().decode(recorded[3].bytes)).toBe('value')
  })
})

describe('directory rename', () => {
  it('rejects file, non-empty directory, and missing-parent destinations before mutation', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/source/nested/file', 'source')
    vfs.seed('/kh/file', 'destination')
    vfs.seed('/kh/non-empty/child', 'destination')
    const mutations: VfsMutation[] = []
    vfs.subscribe((mutation) => { mutations.push(mutation) })

    expect(() => { vfs.renameSync('/kh/source', '/kh/file') })
      .toThrow(expect.objectContaining({ code: 'ENOTDIR' }))
    expect(() => { vfs.renameSync('/kh/source', '/kh/non-empty') })
      .toThrow(expect.objectContaining({ code: 'ENOTEMPTY' }))
    expect(() => { vfs.renameSync('/kh/source', '/missing/destination') })
      .toThrow(expect.objectContaining({ code: 'ENOENT' }))

    expect(vfs.readFileSync('/kh/source/nested/file', 'utf8')).toBe('source')
    expect(vfs.readFileSync('/kh/file', 'utf8')).toBe('destination')
    expect(vfs.readFileSync('/kh/non-empty/child', 'utf8')).toBe('destination')
    expect(mutations).toEqual([])
  })

  it('replaces an empty directory with the source subtree', () => {
    const vfs = new MemoryVfs()
    vfs.seedDirectory('/kh/source/nested', { mode: 0o700 })
    vfs.seed('/kh/source/nested/file', 'source')
    vfs.seedDirectory('/kh/destination', { mode: 0o711 })

    vfs.renameSync('/kh/source', '/kh/destination')

    expect(vfs.existsSync('/kh/source')).toBe(false)
    expect(vfs.readFileSync('/kh/destination/nested/file', 'utf8')).toBe('source')
    expect((vfs.statSync('/kh/destination') as VfsStats).mode & 0o777).toBe(0o755)
    expect((vfs.statSync('/kh/destination/nested') as VfsStats).mode & 0o777).toBe(0o700)
  })
})

describe('hard links', () => {
  it('shares identity, bytes, and mode until one name is removed', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/session.jsonl', 'committed\n')
    vfs.linkSync('/kh/session.jsonl', '/kh/session-latest.jsonl')
    vfs.linkSync('/kh/session-latest.jsonl', '/kh/session-archive.jsonl')
    expect(identity(vfs, '/kh/session-latest.jsonl')).toBe(identity(vfs, '/kh/session.jsonl'))
    expect(linkCount(vfs, '/kh/session.jsonl')).toBe(3n)
    expect(vfs.readFileSync('/kh/session-latest.jsonl', 'utf8')).toBe('committed\n')
    const changedPaths: string[] = []
    vfs.subscribe((mutation) => { changedPaths.push(mutation.path) })
    vfs.appendFileSync('/kh/session.jsonl', 'appended\n')
    expect(changedPaths).toEqual([
      '/kh/session.jsonl',
      '/kh/session-latest.jsonl',
      '/kh/session-archive.jsonl',
    ])
    expect(vfs.readFileSync('/kh/session.jsonl', 'utf8')).toBe('committed\nappended\n')
    expect(vfs.readFileSync('/kh/session-latest.jsonl', 'utf8')).toBe('committed\nappended\n')
    vfs.chmodSync('/kh/session-latest.jsonl', 0o600)
    expect((vfs.statSync('/kh/session.jsonl') as VfsStats).mode & 0o777).toBe(0o600)
    vfs.unlinkSync('/kh/session-latest.jsonl')
    expect(linkCount(vfs, '/kh/session.jsonl')).toBe(2n)
    vfs.unlinkSync('/kh/session-archive.jsonl')
    expect(linkCount(vfs, '/kh/session.jsonl')).toBe(1n)
    expect(vfs.readFileSync('/kh/session.jsonl', 'utf8')).toBe('committed\nappended\n')
  })

  it('treats rename between names of the same node as a no-op', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/source', 'value')
    vfs.linkSync('/kh/source', '/kh/alias')
    const mutations: VfsMutation[] = []
    vfs.subscribe((mutation) => { mutations.push(mutation) })

    vfs.renameSync('/kh/source', '/kh/alias')

    expect(vfs.readFileSync('/kh/source', 'utf8')).toBe('value')
    expect(vfs.readFileSync('/kh/alias', 'utf8')).toBe('value')
    expect(linkCount(vfs, '/kh/source')).toBe(2n)
    expect(mutations).toEqual([])
  })

  it('retargets linked names through file replacement and directory moves', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/replacement', 'replacement')
    vfs.seed('/kh/target', 'old')
    vfs.linkSync('/kh/target', '/kh/target-alias')
    const replaced = vfs.openFileSync('/kh/target', 'r+')
    vfs.renameSync('/kh/replacement', '/kh/target')
    const mutations: VfsMutation[] = []
    vfs.subscribe((mutation) => { mutations.push(mutation) })

    replaced.write(0, new TextEncoder().encode('changed'))
    expect(mutations.map(mutation => mutation.path)).toEqual(['/kh/target-alias'])
    expect(vfs.readFileSync('/kh/target', 'utf8')).toBe('replacement')
    expect(vfs.readFileSync('/kh/target-alias', 'utf8')).toBe('changed')
    expect(linkCount(vfs, '/kh/target-alias')).toBe(1n)

    vfs.seed('/kh/tree/file', 'tree')
    vfs.linkSync('/kh/tree/file', '/kh/outside')
    const moved = vfs.openFileSync('/kh/tree/file', 'r+')
    vfs.renameSync('/kh/tree', '/kh/moved')
    mutations.length = 0
    moved.write(0, new TextEncoder().encode('moved'))
    expect(mutations.map(mutation => mutation.path)).toEqual(['/kh/outside', '/kh/moved/file'])
    expect(linkCount(vfs, '/kh/moved/file')).toBe(2n)

    vfs.rmSync('/kh/moved', { recursive: true })
    mutations.length = 0
    moved.write(0, new TextEncoder().encode('kept!'))
    expect(mutations.map(mutation => mutation.path)).toEqual(['/kh/outside'])
    expect(vfs.readFileSync('/kh/outside', 'utf8')).toBe('kept!')
    expect(linkCount(vfs, '/kh/outside')).toBe(1n)
  })

  it('rejects renaming a file over an existing directory', () => {
    const vfs = new MemoryVfs()
    vfs.seed('/kh/file', 'value')
    vfs.seedDirectory('/kh/directory')
    expect(() => { vfs.renameSync('/kh/file', '/kh/directory') }).toThrow(expect.objectContaining({ code: 'EISDIR' }))
    expect(vfs.readFileSync('/kh/file', 'utf8')).toBe('value')
    expect(vfs.statSync('/kh/directory').isDirectory()).toBe(true)
  })
})
