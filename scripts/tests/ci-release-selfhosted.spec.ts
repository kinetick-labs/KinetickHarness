/** Release rehearsal routing and runner isolation, without executing release builds. */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')
const hosted = 'ubuntu-24.04'

interface Step {
  name?: string
  uses?: string
  run?: string
  if?: string
  with?: Record<string, unknown>
}
interface Workflow {
  on: Record<string, unknown>
  permissions: Record<string, string>
  concurrency?: Record<string, unknown>
  jobs: Record<string, { name: string; 'runs-on': string; steps: Step[] }>
}

function workflow(file: string): Workflow {
  return load(readFileSync(resolve(root, '.github/workflows', file), 'utf8')) as Workflow
}

// This canonical-case corpus has matching Actions/JavaScript comparison results.
// This is not an Actions interpreter: string case-folding and general coercion differ.
function evaluate(expression: string, context: Record<string, string | boolean>): unknown {
  const source = expression.trim().replace(/^\$\{\{|\}\}$/g, '')
    .replace(/\b(?:github|vars|runner)(?:\.[a-zA-Z_][a-zA-Z_0-9]*)+/g,
      key => JSON.stringify(context[key] ?? ''))
  return runInNewContext(source, { fromJSON: JSON.parse }, { timeout: 1000 })
}

for (const [file, jobIds] of [['release.yml', ['dependencies', 'pack']], ['release-vendor.yml', ['pack']]] as const) {
  describe(file, () => {
    const release = workflow(file)
    it('preserves the logical jobs, rehearsal events and read-only permission', () => {
      expect(Object.keys(release.jobs)).toEqual(jobIds)
      expect(release.on).toEqual({ pull_request: null, push: { branches: ['master'] }, workflow_dispatch: null })
      expect(release.permissions).toEqual({ contents: 'read' })
      expect(release.concurrency).toEqual({ group: '${{ github.workflow }}-${{ github.ref }}', 'cancel-in-progress': true })
    })
    for (const jobId of jobIds) {
      describe(jobId, () => {
        const job = release.jobs[jobId]!
        it('runs the rehearsal on a GitHub-hosted runner', () => {
          // The fork owns no self-hosted pool: the routing expression collapsed
          // to the hosted label it always fell back to.
          expect(job['runs-on']).toBe(hosted)
          const text = readFileSync(resolve(root, '.github/workflows', file), 'utf8')
          expect(text).not.toMatch(/KH_CI_FAILOVER|self-hosted|fromJSON/)
        })
        it('cleans stale checkout output and isolates setup before any pnpm invocation', () => {
          expect(job.steps[0]).toMatchObject({ uses: 'actions/checkout@v6', with: { clean: true, 'persist-credentials': false } })
          const cacheIndex = job.steps.findIndex(step => step.run?.includes('NODE_COMPILE_CACHE='))
          const pnpmIndex = job.steps.findIndex(step => step.uses?.startsWith('pnpm/') || /\bpnpm\b/.test(step.run ?? ''))
          expect(cacheIndex).toBeGreaterThan(0)
          expect(cacheIndex).toBeLessThan(pnpmIndex)
          expect(job.steps[cacheIndex]?.run).toContain('echo "NODE_COMPILE_CACHE=${{ runner.temp }}/node-compile-cache" >> "$GITHUB_ENV"')
          expect(job.steps[cacheIndex]?.run).toContain('echo "npm_config_devdir=${{ runner.temp }}/node-gyp" >> "$GITHUB_ENV"')
          expect(job.steps[cacheIndex]?.run).toContain('echo "TMPDIR=${{ runner.temp }}" >> "$GITHUB_ENV"')
          expect(job.steps.find(step => step.uses === 'pnpm/action-setup@v4')?.with?.dest)
            .toBe('${{ runner.temp }}/setup-pnpm-${{ github.run_id }}-${{ github.run_attempt }}-${{ github.job }}')
          expect(job.steps.find(step => step.name === 'Install (immutable)')?.run).toBe('pnpm install --frozen-lockfile')
        })
        it('retains the configured shared npm cache', () => {
          expect(JSON.stringify(release)).not.toMatch(/npm_config_cache/i)
        })
        it('probes the pnpm store path before the install', () => {
          const storeStep = job.steps.find(step => step.name === 'Configure pnpm store path')
          expect(storeStep?.run).toContain('pnpm store path --silent')
          expect(storeStep?.run).toContain('PNPM_CONFIG_STORE_DIR')
        })
        it('uses hosted package caching for the runner-scoped toolchain', () => {
          const caches = job.steps.filter(step => step.uses?.startsWith('actions/cache'))
          expect(caches.map(step => step.uses)).toEqual(['actions/cache/restore@v4'])
          for (const step of caches) {
            expect(evaluate(step.if!, { 'runner.environment': 'github-hosted' })).toBe(true)
          }
          const nodeSetup = job.steps.find(step => step.uses === 'actions/setup-node@v6')
          expect(nodeSetup?.with?.cache).toBeUndefined()
          expect(nodeSetup?.with?.['package-manager-cache']).toBe(false)
        })
        it('retains the dependency and pack verification commands', () => {
          const commands = job.steps.flatMap(step => step.run === undefined ? [] : [step.run])
          if (jobId === 'dependencies') {
            expect(commands).toContain('pnpm run verify-package-dependencies')
            expect(commands).toContain('pnpm run verify-npm-install-layout')
          } else {
            const family = file === 'release.yml' ? 'kh' : 'vendor'
            const output = family === 'kh' ? 'dist/npm' : 'dist/npm-vendor'
            expect(job.steps[0]?.with?.['fetch-depth']).toBe(0)
            expect(commands).toContain('pnpm run release:verify --family ' + family)
            expect(commands).toContain('pnpm run ' + (family === 'kh' ? 'build:official' : 'build:lib:host'))
            expect(commands).toContain('pnpm run release:pack --family ' + family + ' --out ' + output + ' --concurrency 8')
            expect(commands).toContain('pnpm run release:verify-packed-install --family ' + family + ' --from ' + output
              + (family === 'kh' ? ' --from dist/npm-vendor --from dist/npm-landlock' : ''))
            expect(job.steps.at(-1)).toMatchObject({ uses: 'actions/upload-artifact@v4', with: { path: output + '/*', 'retention-days': 7 } })
          }
          expect(JSON.stringify(job)).not.toMatch(/secrets\.|release:publish|npm-publish/)
        })
      })
    }
  })
}

it.each(['release-publish.yml', 'release-vendor-publish.yml'])('keeps %s manual and entirely hosted', (file) => {
  const publish = workflow(file)
  expect(Object.keys(publish.on)).toEqual(['workflow_dispatch'])
  for (const job of Object.values(publish.jobs)) expect(job['runs-on']).toBe(hosted)
})
