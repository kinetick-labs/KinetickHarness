/** The translation prompt document is not part of the English-only tree. */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('translation prompt', () => {
  it('does not ship a Chinese translation prompt', () => {
    expect(existsSync(resolve(import.meta.dirname, '../docs/i18n/translation-prompt.md'))).toBe(false)
  })
})
