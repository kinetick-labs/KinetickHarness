import { zoomEn } from '../zoom/locales.ts'

/** Locale-owned image renderer labels and status text. */

/** Image renderer dictionary keys. */
export type ImagePreviewKey = keyof typeof en

/** English dictionary with the same keys as the Chinese dictionary. */
export const en = {
  ...zoomEn,
  title: 'Image',
  preview: 'Image preview: {name}',
  loading: 'Rendering document...',
  failed: 'This image could not be displayed.',
  unsupported: 'Image preview requires the complete file contents.',
} satisfies Record<string, string>

declare module '@kinetick-labs/kh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Image preview selection, accessible name, and status text. */
    sidebarImage: ImagePreviewKey
  }
}
