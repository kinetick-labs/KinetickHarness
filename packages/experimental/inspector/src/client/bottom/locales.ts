/** Localized labels for the NodeJS Inspector bottom panel and command. */

/** English labels checked against the bottom-panel dictionary. */
export const en = {
  title: 'NodeJS Inspector',
  toggle: 'Toggle NodeJS Inspector',
  close: 'Collapse',
  resize: 'Resize NodeJS Inspector panel',
  frameTitle: 'NodeJS Inspector',
}

declare module '@kinetick-labs/kh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Shared Inspector frontend copy. */
    inspectorPanel: keyof typeof en
  }
}
