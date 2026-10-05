/** Dictionary namespace owned by this plugin. */
export const NS = 'claude-code-mods'

/** Mods band locale key union. */
export type ModsBandKey = keyof typeof en

/** English dictionary checked against the Chinese key set. */
export const en = {
  band: 'Claude Code mods',
  pressing: 'Working…',
  'press.failed': 'The button failed: {message}',
  'press.stale': 'That button belonged to an earlier drawing; the band has refreshed',
} satisfies Record<string, string>
