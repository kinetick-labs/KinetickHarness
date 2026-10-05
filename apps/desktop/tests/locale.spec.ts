import { describe, expect, it } from 'vitest'
import { en, formatDesktopMessage, resolveDesktopLocale, resolveDesktopStartupLocale } from '../src/locale.ts'

describe('desktop locale dictionaries', () => {
  it('ships English for every operating-system locale', () => {
    expect(resolveDesktopLocale('zh-Hans-CN')).toEqual({ id: 'en', messages: en })
    expect(resolveDesktopLocale('en-US')).toEqual({ id: 'en', messages: en })
    expect(resolveDesktopLocale('fr-FR')).toEqual({ id: 'en', messages: en })
  })

  it('formats named values without consuming unknown placeholders', () => {
    expect(formatDesktopMessage('{name}@{version} {missing}', { name: 'plugin', version: '1.2.3' }))
      .toBe('plugin@1.2.3 {missing}')
  })

  it('ignores the preference and system languages', () => {
    expect(resolveDesktopStartupLocale('zh', ['en-US']).id).toBe('en')
    expect(resolveDesktopStartupLocale('EN', ['zh-CN']).id).toBe('en')
    expect(resolveDesktopStartupLocale(null, ['ja-JP', 'zh-Hant', 'en-US']).id).toBe('en')
    expect(resolveDesktopStartupLocale(null, ['en-US', 'zh-CN']).id).toBe('en')
    expect(resolveDesktopStartupLocale(null, ['ja-JP']).id).toBe('en')
    expect(resolveDesktopStartupLocale(null, []).id).toBe('en')
    expect(resolveDesktopStartupLocale('ja', ['zh-CN']).id).toBe('en')
  })
})
