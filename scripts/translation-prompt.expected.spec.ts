/** The translation prompt gate reports that documentation is English only. */

import { execFile } from 'node:child_process'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)
const root = resolve(import.meta.dirname, '..')

describe('translation prompt runnable snapshot', () => {
  it('reports that documentation is English only', async () => {
    const { stdout, stderr } = await execFileAsync(process.execPath, [
      join(root, 'scripts/verify-translation-prompt.ts'),
      '--snapshot',
    ], { cwd: root, maxBuffer: 4 * 1024 * 1024 })
    expect(stderr).toBe('')
    expect(stdout).toBe('verify-translation-prompt: documentation is English only.\n')
  })
})
