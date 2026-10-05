/** Locale-owned HTML implementation name and iframe status text. */

/** HTML renderer dictionary keys. */
export type HtmlPreviewKey = keyof typeof en

/** English dictionary with the same keys as the Chinese dictionary. */
export const en = {
  title: 'HTML',
  frame: 'HTML document preview',
  loading: 'Rendering document...',
  failed: 'This HTML document could not be previewed.',
} satisfies Record<string, string>

declare module '@kinetick-labs/kh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** HTML preview selection and status text. */
    documentHtml: HtmlPreviewKey
  }
}
