/** Shared names for the desktop Platform bridge. */
/** Private desktop channels; the Platform renderer receives bootstrap and locale updates. */
export const PLATFORM_IPC = {
  bootstrap: 'kh-platform:bootstrap',
  localeChanged: 'kh-platform:locale-changed',
  open: 'kh-platform:open',
  bounds: 'kh-platform:bounds',
  close: 'kh-platform:close',
} as const

/** Resolved Platform language; Desktop resolves the system preference before sending it. */
export type PlatformLocale = 'en_US' | 'zh_CN'
