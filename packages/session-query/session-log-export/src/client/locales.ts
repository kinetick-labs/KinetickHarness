/** Dictionary namespace owned by this plugin. */
export const NS = 'session-log-download'

/** English Session export strings. */
export const en = {
  'header.more': 'More actions',
  'menu.download': 'Download session log',
  'menu.feedback': 'Feedback',
  'dialog.preparingTitle': 'Exporting Session',
  'dialog.preparingDescription': 'Preparing a ZIP containing this Session, its sub-Sessions, and attachments.',
  'dialog.successTitle': 'Session download started',
  'dialog.successDescription': 'The browser is downloading the Session ZIP.',
  'dialog.errorTitle': 'Session export failed',
  'dialog.close': 'Close',
  'dialog.commandFailed': 'Could not start the Session export.',
}

/** Stable locale keys consumed by the shared modal. */
export type SessionLogDownloadKey = keyof typeof en
