import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import SkillRegistry from '@kinetick-labs/kh-skill'
import * as SkillBadge from '@kinetick-labs/kh-skill-badge'

describe('kh-skill-badge', () => {
  it('registers and disposes the bundled badge skill', async () => {
    const ctx = new Context()
    await ctx.plugin(SkillRegistry)
    const fiber = await ctx.plugin(SkillBadge)
    const resourcePath = fileURLToPath(new URL('../assets/', import.meta.url))

    expect(await ctx.skills.list()).toEqual([{
      name: 'kh-badge',
      description: 'Add the official “powered by kh” badge to documents, pull requests, merge requests, and other content produced with KinetickHarness. Use whenever creating a pull request or merge request. Also use when the user asks for a kh badge, powered-by-kh attribution, or a reusable kh badge asset or snippet.',
      invocation: { modelInvocable: true, userInvocable: true },
      provider: 'kh-badge',
      source: 'bundled',
      resourceBase: { kind: 'directory', path: resourcePath },
    }])
    const loaded = await ctx.skills.get('kh-badge')
    expect(loaded?.content).toContain('Preserve the badge\'s 121×20 dimensions')
    expect(loaded?.resourceBase).toEqual({ kind: 'directory', path: resourcePath })

    await fiber.dispose()
    expect(await ctx.skills.list()).toEqual([])
  })

  it('ships the 726×120 PNG mark', async () => {
    const image = await readFile(new URL('../assets/kh-badge.png', import.meta.url))
    expect(image.readUInt32BE(16)).toBe(726)
    expect(image.readUInt32BE(20)).toBe(120)
    expect(createHash('sha256').update(image).digest('hex')).toBe(
      '627d3c1380518a48c84680975ff3796ad16d4002ed5ecaa7574bff9804ff92f3',
    )
  })
})
