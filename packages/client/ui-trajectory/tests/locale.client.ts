import { en as commonEn , en as commonZh } from '@kinetick-labs/kh-client-locale/src/locales/en.ts'
import { en, type TrajectoryTranslate , en as zh } from '../src/client/locales.ts'

function translator(dictionary: Record<string, string>): TrajectoryTranslate {
  return (key, params = {}) => {
    const template = dictionary[key] ?? key
    return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
      const value = params[name]
      return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
        ? String(value)
        : ''
    })
  }
}

/** English trajectory translator for component and pure-layout tests. */
export const t = translator({ ...commonEn, ...en })

/** English trajectory translator. */
export const tEn = t

/** Chinese trajectory translator for real-view fixtures that open in Chinese. */
export const tZh = translator({ ...commonZh, ...zh })
