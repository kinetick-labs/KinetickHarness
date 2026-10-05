/** Markdown implementation labels and primitive chrome. */

/** Markdown namespace keys. */
export type MarkdownPreviewKey = keyof typeof en

/** English labels, paired with the Chinese key set. */
export const en = {
  'viewer.label': 'Markdown',
  'code.copy': 'Copy',
  'code.copied': 'Copied',
  'footnotes': 'Footnotes',
} satisfies Record<string, string>

declare module '@kinetick-labs/kh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Markdown document renderer and its code/footnote controls. */
    documentMarkdown: MarkdownPreviewKey
  }
}
