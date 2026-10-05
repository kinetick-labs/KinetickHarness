import { describe, expect, it } from 'vitest'
import type { NpmPackageLock, RegistryIndex } from './benchmark-npm-resolution.ts'
import {
  assertDualKhInstallLayout,
  assertResolutionWorkBudget,
  buildDualKhRegistry,
  MAX_RESOLUTION_WORK_UNITS,
} from './verify-npm-install-layout.ts'

function validLayout(): NpmPackageLock {
  return {
    lockfileVersion: 3,
    packages: {
      '': { dependencies: { '@kinetick-labs/kh': '0.2.0', 'kh-previous': 'npm:@kinetick-labs/kh@0.1.0' } },
      'node_modules/@deepseek-ai/cordis': { version: '4.0.1' },
      'node_modules/@kinetick-labs/kh': {
        version: '0.2.0',
        dependencies: { '@kinetick-labs/kh-child': '^0.2.0' },
        peerDependencies: { '@deepseek-ai/cordis': '^4.0.1' },
      },
      'node_modules/@kinetick-labs/kh-child': {
        version: '0.2.0',
        dependencies: { '@kinetick-labs/kh-leaf': '^0.2.0' },
      },
      'node_modules/@kinetick-labs/kh-leaf': { version: '0.2.0' },
      'node_modules/kh-previous': {
        name: '@kinetick-labs/kh',
        version: '0.1.0',
        dependencies: { '@kinetick-labs/kh-child': '^0.1.0' },
        peerDependencies: { '@deepseek-ai/cordis': '^4.0.1' },
      },
      'node_modules/kh-previous/node_modules/@kinetick-labs/kh-child': {
        version: '0.1.0',
        dependencies: { '@kinetick-labs/kh-leaf': '^0.1.0' },
      },
      'node_modules/kh-previous/node_modules/@kinetick-labs/kh-leaf': { version: '0.1.0' },
    },
  }
}

describe('npm install layout verifier', () => {
  it('creates two incompatible versions of every KH package', () => {
    const index: RegistryIndex = new Map([
      ['@kinetick-labs/kh', new Map([['0.1.1-rc.2', {
        name: '@kinetick-labs/kh',
        version: '0.1.1-rc.2',
        dependencies: { '@kinetick-labs/kh-child': '^0.1.1-rc.2' },
        peerDependencies: { '@deepseek-ai/cordis': '^4.0.1' },
      }]])],
      ['@kinetick-labs/kh-child', new Map([['0.1.1-rc.2', {
        name: '@kinetick-labs/kh-child',
        version: '0.1.1-rc.2',
      }]])],
      ['@deepseek-ai/cordis', new Map([['4.0.1', {
        name: '@deepseek-ai/cordis',
        version: '4.0.1',
      }]])],
    ])

    const dual = buildDualKhRegistry(index, '0.1.1-rc.2')

    expect([...dual.get('@kinetick-labs/kh')?.keys() ?? []]).toEqual(['0.1.0', '0.2.0'])
    expect(dual.get('@kinetick-labs/kh')?.get('0.1.0')).toMatchObject({
      version: '0.1.0',
      dependencies: { '@kinetick-labs/kh-child': '^0.1.0' },
      peerDependencies: { '@deepseek-ai/cordis': '^4.0.1' },
    })
    expect(dual.get('@kinetick-labs/kh')?.get('0.2.0')).toMatchObject({
      version: '0.2.0',
      dependencies: { '@kinetick-labs/kh-child': '^0.2.0' },
    })
    expect(dual.get('@deepseek-ai/cordis')).toBe(index.get('@deepseek-ai/cordis'))
  })

  it('accepts isolated KH releases with one shared Cordis installation', () => {
    expect(assertDualKhInstallLayout(validLayout())).toEqual({
      khPackagesPerVersion: 3,
      checkedKhEdges: 4,
    })
  })

  it.each([
    ['react', 'node_modules/react'],
    ['react-dom', 'node_modules/react-dom'],
    ['react', 'node_modules/kh-previous/node_modules/react'],
    ['react-dom', 'node_modules/kh-previous/node_modules/react-dom'],
  ])('rejects browser runtime %s installed at %s in the KH-only consumer', (name, path) => {
    const layout = validLayout()
    const packages = { ...layout.packages, [path]: { version: '18.3.1' } }
    expect(() => assertDualKhInstallLayout({ ...layout, packages })).toThrow(
      `${path}: ${name} is a browser build input`,
    )
  })

  it('rejects an internal edge that crosses release versions', () => {
    const layout = validLayout()
    const packages = { ...layout.packages }
    Reflect.deleteProperty(packages, 'node_modules/kh-previous/node_modules/@kinetick-labs/kh-leaf')

    expect(() => assertDualKhInstallLayout({ ...layout, packages })).toThrow(
      'node_modules/kh-previous/node_modules/@kinetick-labs/kh-child: dependencies '
      + '@kinetick-labs/kh-leaf resolves to node_modules/@kinetick-labs/kh-leaf@0.2.0, expected 0.1.0',
    )
  })

  it('rejects a second Cordis installation', () => {
    const layout = validLayout()
    const packages = {
      ...layout.packages,
      'node_modules/kh-previous/node_modules/@deepseek-ai/cordis': { version: '4.0.1' },
    }

    expect(() => assertDualKhInstallLayout({ ...layout, packages })).toThrow(
      'expected one shared @deepseek-ai/cordis',
    )
  })
})

describe('resolution work budget', () => {
  it('accepts the measured dual-release graph', () => {
    expect(assertResolutionWorkBudget({ khPackagesPerVersion: 277, checkedKhEdges: 2524 }))
      .toBe(699_148)
  })

  it('accepts a graph exactly at the budget and rejects one internal edge above it', () => {
    const packages = 350
    const edgesAtBudget = Math.floor(MAX_RESOLUTION_WORK_UNITS / packages)

    expect(packages * edgesAtBudget).toBe(MAX_RESOLUTION_WORK_UNITS)
    expect(assertResolutionWorkBudget({ khPackagesPerVersion: packages, checkedKhEdges: edgesAtBudget }))
      .toBe(MAX_RESOLUTION_WORK_UNITS)
    expect(() => assertResolutionWorkBudget({
      khPackagesPerVersion: packages,
      checkedKhEdges: edgesAtBudget + 1,
    })).toThrow(`= ${String(MAX_RESOLUTION_WORK_UNITS + packages)} unit(s), budget ${String(MAX_RESOLUTION_WORK_UNITS)} unit(s)`)
  })

  it('accepts the headroom and rejects a runaway graph with its own measured counts', () => {
    expect(assertResolutionWorkBudget({ khPackagesPerVersion: 300, checkedKhEdges: 2800 }))
      .toBe(840_000)
    expect(() => assertResolutionWorkBudget({ khPackagesPerVersion: 400, checkedKhEdges: 3000 }))
      .toThrow('400 package(s) per release x 3000 internal edge(s) = 1200000 unit(s), budget 875000 unit(s)')
  })
})
