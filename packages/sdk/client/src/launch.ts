/**
 * Resolve the public SDK launch configuration to one kh subprocess.
 * @module @kinetick-labs/kh-sdk-client/launch
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { HarnessClientOptions } from './types.ts'

/** Default bound for a profile to answer the SDK initialize handshake. */
export const DEFAULT_INITIALIZE_TIMEOUT_MS = 10_000

/** Internal generic process launch used by the transport and fake-runtime tests. */
export interface RuntimeProcessOptions {
  command: string
  args: string[]
  cwd?: string
  /** Materialize the complete child environment when the client starts its subprocess. */
  environment: () => NodeJS.ProcessEnv
  description: string
  initializeTimeoutMs: number
  requestTimeoutMs?: number
  shutdownTimeoutMs?: number
  disposeEofGraceMs?: number
  disposeGraceMs?: number
}

/** Node argv plus internal profile patches required by one resolved kh entry. */
export interface KhNodeLaunch {
  /** Arguments before the profile selector. */
  nodeArgs: string[]
  /** Internal patches applied below caller-supplied patches. */
  patches: string[]
  /** Environment values required by the resolved entry mode. */
  environment: NodeJS.ProcessEnv
}

interface PackageManifest {
  version?: unknown
  bin?: unknown
}

/** Read a package manifest from one resolved package.json URL. */
function manifest(url: string): PackageManifest {
  return JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as PackageManifest
}

/**
 * Resolve and version-check a kh executable from package manifests.
 * @param khManifestUrl - resolved URL of the kh package manifest.
 * @param clientManifestUrl - resolved URL of the SDK client manifest.
 * @returns the absolute kh executable path.
 */
export function resolveKhBinFromManifests(khManifestUrl: string, clientManifestUrl: string): string {
  const khManifest = manifest(khManifestUrl)
  const clientManifest = manifest(clientManifestUrl)
  if (typeof khManifest.version !== 'string' || khManifest.version !== clientManifest.version) {
    throw new Error(`kh SDK client ${String(clientManifest.version)} requires the same kh version, got ${String(khManifest.version)}`)
  }
  const bin = typeof khManifest.bin === 'object' && khManifest.bin !== null
    ? (khManifest.bin as Record<string, unknown>).kh
    : khManifest.bin
  if (typeof bin !== 'string' || bin === '') throw new Error('@kinetick-labs/kh declares no kh executable')
  return resolve(dirname(fileURLToPath(khManifestUrl)), bin)
}

/**
 * Resolve and version-check the built kh executable installed with this SDK.
 * @returns the absolute built executable path, whether or not it exists in a source checkout.
 */
export function installedKhBin(): string {
  return resolveKhBinFromManifests(
    import.meta.resolve('@kinetick-labs/kh/package.json'),
    new URL('../package.json', import.meta.url).href,
  )
}

/**
 * Resolve the Node launch for one same-version kh package.
 * @param khManifestUrl - resolved URL of the kh package manifest.
 * @param clientManifestUrl - resolved URL of the SDK client manifest.
 * @param sourceLoaderUrl - optional absolute tsx loader URL for deterministic tests.
 * @returns built output, or the source entry plus its compatibility patch and tsx environment.
 */
export function resolveKhNodeLaunchFromManifests(
  khManifestUrl: string,
  clientManifestUrl: string,
  sourceLoaderUrl?: string,
): KhNodeLaunch {
  const bin = resolveKhBinFromManifests(khManifestUrl, clientManifestUrl)
  if (existsSync(bin)) return { nodeArgs: [bin], patches: [], environment: {} }

  const packageDir = dirname(fileURLToPath(khManifestUrl))
  const sourceBin = resolve(packageDir, 'src/bin.ts')
  const sourcePatch = resolve(packageDir, 'src/sdk-source.cordis.patch.yml')
  const sourceTsconfig = resolve(packageDir, 'tsconfig.json')
  if (!existsSync(sourceBin) || !existsSync(sourcePatch) || !existsSync(sourceTsconfig)) {
    throw new Error(
      `@kinetick-labs/kh is missing its built executable ${bin} and complete source launch files ${sourceBin}, ${sourcePatch}, ${sourceTsconfig}`,
    )
  }
  const loader = sourceLoaderUrl ?? import.meta.resolve('tsx/esm')
  return {
    nodeArgs: ['--import', loader, sourceBin],
    patches: [sourcePatch],
    environment: { TSX_TSCONFIG_PATH: sourceTsconfig },
  }
}

/**
 * Resolve the installed kh package to a built or source Node launch.
 * @returns the launch descriptor for the current checkout or installed package.
 */
function installedKhNodeLaunch(): KhNodeLaunch {
  return resolveKhNodeLaunchFromManifests(
    import.meta.resolve('@kinetick-labs/kh/package.json'),
    new URL('../package.json', import.meta.url).href,
  )
}

/**
 * Resolve caller-relative filesystem inputs and construct canonical kh argv.
 * @param options - public SDK launch options.
 * @param callerCwd - parent-process directory used for lexical resolution.
 * @returns one generic subprocess spec for the JSON-RPC transport.
 */
export function resolveKhLaunch(
  options: HarnessClientOptions = {},
  callerCwd: string = process.cwd(),
): RuntimeProcessOptions {
  const profile = options.profile ?? 'sdk'
  const khLaunch = options.khBin === undefined
    ? installedKhNodeLaunch()
    : { nodeArgs: [resolve(callerCwd, options.khBin)], patches: [], environment: {} }
  const patches = [
    ...khLaunch.patches,
    ...(options.patches ?? []).map(path => resolve(callerCwd, path)),
  ]
  const khHome = options.khHome === undefined ? undefined : resolve(callerCwd, options.khHome)
  return {
    command: process.execPath,
    args: [...khLaunch.nodeArgs, '--profile', profile, ...patches.flatMap(path => ['--patch', path])],
    ...options.processCwd === undefined ? {} : { cwd: resolve(callerCwd, options.processCwd) },
    environment: () => ({
      ...(options.env ?? process.env),
      ...khLaunch.environment,
      ...khHome === undefined ? {} : { KH_HOME: khHome },
    }),
    description: `kh profile ${JSON.stringify(profile)}`,
    initializeTimeoutMs: options.initializeTimeoutMs ?? DEFAULT_INITIALIZE_TIMEOUT_MS,
    ...options.requestTimeoutMs === undefined ? {} : { requestTimeoutMs: options.requestTimeoutMs },
    ...options.shutdownTimeoutMs === undefined ? {} : { shutdownTimeoutMs: options.shutdownTimeoutMs },
    ...options.disposeEofGraceMs === undefined ? {} : { disposeEofGraceMs: options.disposeEofGraceMs },
    ...options.disposeGraceMs === undefined ? {} : { disposeGraceMs: options.disposeGraceMs },
  }
}
