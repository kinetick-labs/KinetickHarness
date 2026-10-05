/** The optional Developer Tools bundle enables both inspectors, including fetch capture. */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'
import * as yaml from 'js-yaml'

describe('Inspector profile bundle', () => {
  it('publishes one layer containing both inspectors', () => {
    const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
      publishConfig: { access: string }
      kh: { bundle: { patch: string } }
      dependencies: Record<string, string>
    }
    expect(manifest.publishConfig.access).toBe('public')
    expect(manifest.kh.bundle.patch).toBe('./cordis.patch.yml')
    expect(manifest.dependencies).toEqual({
      '@kinetick-labs/kh-experimental-inspector': 'workspace:*',
      '@kinetick-labs/kh-experimental-session-inspector': 'workspace:*',
    })
    expect(yaml.load(readFileSync(new URL(`../${manifest.kh.bundle.patch}`, import.meta.url), 'utf8'), {
      schema: entryListSchema,
    })).toEqual([{ insert: [
      {
        id: 'experimental-inspector', name: '@kinetick-labs/kh-experimental-inspector',
        disabled: false, config: { captureFetch: true },
      },
      { id: 'session-inspector', name: '@kinetick-labs/kh-experimental-session-inspector' },
    ] }])
  })
})
