import OTel from '@deepseek-ai/dsh-otel'
/** Shipped Web and Desktop compositions leave product analytics unloaded. */
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { loadOverlayPatches } from '@deepseek-ai/dsh-app-boot'
import * as Telemetry from '@deepseek-ai/dsh-host-product-telemetry-otel'
import Analytics from '@deepseek-ai/dsh-client-product-analytics'
import { expect, it, onTestFinished } from 'vitest'

it.each(['desktop', 'web'])('does not mount product analytics by default: %s', async (profile) => {
  const ctx = new Context()
  onTestFinished(() => ctx.fiber.dispose())
  ctx.provide('profileContext', {
    name: profile, dir: '/profile', patchPath: '/profile/cordis.patch.yml', installAnchor: '/profile/package.json',
    cwd: '/workspace', home: '/home', startedBundles: [], overlays: [], telemetryDisabledEnv: undefined,
  })
  await ctx.plugin(OTel)
  ctx.baseUrl = 'file:///'
  await ctx.plugin(Loader).await()
  ctx.loader.builtins.telemetry = Telemetry
  ctx.loader.builtins.analytics = Analytics
  const rows = loadOverlayPatches('analytics', fileURLToPath(new URL('../cordis.patch.yml', import.meta.url)))
    .flatMap(patch => patch.insert ?? []).filter(row => row.id === 'desktop-product-telemetry' || row.id === 'product-analytics')
  const entries = rows.map(row => ({ ...row, name: row.id === 'desktop-product-telemetry' ? 'cordis:telemetry' : 'cordis:analytics' }))
  await ctx.loader.root.update(entries)
  await ctx.loader.await()
  expect(ctx.loader.resolve('desktop-product-telemetry').disabled).toBe(true)
  expect(ctx.loader.resolve('product-analytics').disabled).toBe(true)
  expect(ctx.get('productTelemetry')).toBeUndefined()
  expect(ctx.get('productAnalytics')).toBeUndefined()
})
