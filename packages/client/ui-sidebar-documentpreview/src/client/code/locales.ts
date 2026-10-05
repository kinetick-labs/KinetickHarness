

/** English dictionary with the same keys. */
import type {} from '@kinetick-labs/kh-client-ui-slots'
export const en = {
  title: 'Code',
  copy: 'Copy',
  copied: 'Copied',
} satisfies Record<string, string>

declare module '@kinetick-labs/kh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Code document implementation name and copy controls. */
    sidebarCodePreview: keyof typeof en
  }
}
