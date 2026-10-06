/**
 * Assert that every workspace `lib/index.js` the benchmark workers import came
 * from the root tsdown pass, not from the `tsc -b` intermediate build.
 *
 * Why this exists: `build:bench` runs `tsc -b tsconfig.host.json` (which emits
 * full `lib/index.js` files on a cold cache) and then bundles the benchmark
 * workers with `@deepseek-ai/*` kept external. Only the root tsdown pass
 * (`build:lib`) inlines the vendored framework's `const enum FiberState` into
 * literals and strips Typert metadata. If the tsdown pass never ran, the raw
 * tsc product references the const enum as a *runtime* named import of
 * `@deepseek-ai/cordis` — which the published `lib` entry does not export — and
 * every external worker dies at instantiate with:
 *   SyntaxError: The requested module '@deepseek-ai/cordis' does not provide
 *   an export named 'FiberState'
 *
 * Run this after `npm run build:lib`: it fails fast with the offending package
 * list instead of failing deep inside the measured worker.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

/** Scope roots whose packages the benchmark workers may import at runtime. */
const scannedRoots = ['packages', 'vendor'] as const

/**
 * Markers that survive only in raw `tsc -b` output: a tsdown build inlines
 * every `FiberState.X` const-enum access as a numeric literal.
 */
const staleMarkers: readonly RegExp[] = [
  /FiberState\.(ACTIVE|PENDING|LOADING|FAILED|DISPOSED|UNLOADING)/,
]

/** Every package directory (depth ≤ 2 under the scope root) with a lib/index.js. */
function packageDirs(scopeDir: string): string[] {
  const found: string[] = []
  if (!existsSync(scopeDir)) return found
  for (const top of readdirSync(scopeDir, { withFileTypes: true })) {
    if (!top.isDirectory() || top.name.startsWith('.') || top.name === 'node_modules') continue
    const topPath = join(scopeDir, top.name)
    if (existsSync(join(topPath, 'lib', 'index.js'))) {
      found.push(topPath)
      continue
    }
    for (const leaf of readdirSync(topPath, { withFileTypes: true })) {
      if (!leaf.isDirectory() || leaf.name.startsWith('.')) continue
      const leafPath = join(topPath, leaf.name)
      if (existsSync(join(leafPath, 'lib', 'index.js'))) found.push(leafPath)
    }
  }
  return found
}

function main(): void {
  const stale: string[] = []
  for (const scope of scannedRoots) {
    for (const pkg of packageDirs(join(root, scope))) {
      const libIndex = join(pkg, 'lib', 'index.js')
      const text = readFileSync(libIndex, 'utf8')
      if (staleMarkers.some(marker => marker.test(text))) stale.push(libIndex.slice(root.length + 1))
    }
  }
  if (stale.length > 0) {
    throw new Error(
      `assert-lib-is-tsdown-built: ${stale.length} package(s) carry raw-tsc lib/index.js ` +
      '(the root tsdown pass never ran for them):\n  ' + stale.join('\n  ') + '\n' +
      'run `npm run build:lib` first; if it just ran, its output is stale — delete the ' +
      'listed lib/index.js files and rerun.',
    )
  }
}

main()
