import { globSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findUnavailableRepositoryReferences } from './verify-public-repository-links.ts'

describe('repository link policy', () => {
  it('rejects encoded and case-varied references to the unavailable repository', () => {
    const unavailableOwner = ['deepseek', 'ai'].join('-')
    const unavailableName = ['deepseek', 'harness', 'sdk'].join('-')
    const unavailableRepository = `${unavailableOwner}/${unavailableName}`
    const encodedRepository = unavailableRepository.replaceAll('-', '%2D').replace('/', '%2F')
    const htmlEncodedRepository = unavailableRepository.replace('/', '&#x2f;')
    const jsonEscapedRepository = unavailableRepository.replace('/', '\\/')
    const unicodeEscapedRepository = unavailableRepository.replace('/', String.raw`\u002f`)
    const source = [
      'https://github.com/kinetick-labs/KinetickHarness',
      `https://github.com/${unavailableRepository.toUpperCase()}/issues/1`,
      `https://github.com/${encodedRepository}/issues/2`,
      `https://github.com/${htmlEncodedRepository}/issues/3`,
      `"https:\\/\\/github.com\\/${jsonEscapedRepository}\\/issues\\/4"`,
      `"https:\\/\\/github.com\\/${unicodeEscapedRepository}\\/issues\\/5"`,
      `https://github.com/${unavailableOwner}/cordis`,
      `https://github.com/example/${unavailableName}`,
    ].join('\n')

    expect(findUnavailableRepositoryReferences('subject.md', source)).toEqual([
      { file: 'subject.md', line: 2 },
      { file: 'subject.md', line: 3 },
      { file: 'subject.md', line: 4 },
      { file: 'subject.md', line: 5 },
      { file: 'subject.md', line: 6 },
    ])
  })

  it('preserves frozen archived Agent Notes', () => {
    const unavailableRepository = ['deepseek-ai', 'kinetick-harness-sdk'].join('/')

    // The fork rebrand rewrote note bodies; archived notes must not gain new
    // references to repositories that do not exist under kinetick-labs.
    const root = resolve(import.meta.dirname, '..')
    const files = globSync('.agents/notes/archived/**/*.md', { cwd: root })
    expect(files.length).toBeGreaterThan(0)
    const offenders = files
      .flatMap(file => findUnavailableRepositoryReferences(file.replaceAll('\\', '/'), `https://github.com/${unavailableRepository}`))
    expect(offenders).toEqual([])
  })
})
