

/** The settings.locale namespace key union. */
export type SettingsLocaleKey = keyof typeof en

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'language.title': 'Language',
} satisfies Record<string, string>
