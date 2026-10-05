/** Explicit exceptions and Host packages for the published dependency policy. */

/** Packages treated as Client/Host packages without declaring `kh.client`. */
const CLIENT_FACE_INCLUDE: readonly string[] = []

/** Packages exempted from automatic Client/Host treatment despite declaring `kh.client`. */
const CLIENT_FACE_EXCLUDE: readonly string[] = [
  '@kinetick-labs/kh-api-session-controller',
  '@kinetick-labs/kh-api-workspace-controller',
]

/** Host-only packages whose peer relays are deliberately flattened. */
const HOST_DEPENDENCY_PACKAGES: readonly string[] = [
  '@kinetick-labs/kh-llm',
  '@kinetick-labs/kh-session',
]

/** Required Cordis services whose Host imports are type-only. */
const REQUIRED_SERVICE_PEERS = {
  '@kinetick-labs/kh-api-terminal-controller': ['@kinetick-labs/kh-subprocess'],
} as const satisfies Readonly<Record<string, readonly string[]>>

/** Development-only package relationships not represented by source imports. */
const CONFIGURATION_ONLY_DEV_DEPENDENCIES = {
  '@kinetick-labs/kh-client-locale': ['@kinetick-labs/kh-api-remotes'],
  '@kinetick-labs/kh-client-ui-conversation': [
    '@kinetick-labs/kh-api-remotes',
    '@kinetick-labs/kh-client-ui-workspace',
  ],
  '@kinetick-labs/kh-client-ui-model-selection': ['@kinetick-labs/kh-client-ui-input-trigger'],
  '@kinetick-labs/kh-client-ui-sidebar': ['@kinetick-labs/kh-client-ui-workspace'],
  '@kinetick-labs/kh-client-ui-subagent': ['@kinetick-labs/kh-client-ui-input-trigger'],
  '@kinetick-labs/kh-client-ui-theme': ['@kinetick-labs/kh-api-remotes'],
  '@kinetick-labs/kh-client-ui-tool': ['@kinetick-labs/kh-api-remotes'],
} as const satisfies Readonly<Record<string, readonly string[]>>

/** Workspace packages whose complete runtime surface is safe across duplicate installations. */
const DUPLICATE_SAFE_PACKAGES: readonly string[] = [
  '@kinetick-labs/kh-brand',
  '@kinetick-labs/kh-lazy-require',
  '@kinetick-labs/kh-typert-protocol',
  '@kinetick-labs/kh-util-code-language',
  '@kinetick-labs/kh-util-crypto',
  '@kinetick-labs/kh-util-values',
]

/**
 * Runtime exports whose values remain valid when npm installs another package copy.
 * New entries are forbidden by default. Automated agents must not add an
 * exception; every addition requires explicit human review and a dedicated,
 * prominent heading in the pull request description.
 */
const SAFE_HOST_DEPENDENCY_EXPORTS = {
  '@kinetick-labs/kh-credentials': ['credentialKey'],
  '@kinetick-labs/kh-deque': ['Deque'],
  '@kinetick-labs/kh-llm': ['callConfigEquals'],
  '@kinetick-labs/kh-session-format': ['sessionFormatLogFilename'],
  '@kinetick-labs/kh-timeout': ['MAX_TIMER_DELAY_MS'],
  '@deepseek-ai/schemastery': ['default'],
} as const satisfies HostDependencyExports

/** Runtime exports that require every consumer to resolve the provider's shared peer instance. */
const PEER_REQUIRED_HOST_EXPORTS = {
  '@kinetick-labs/kh-client-connection': ['OperatorPeer'],
  '@kinetick-labs/kh-scope': ['carrierKeyOf', 'createScope', 'scopeOf', 'scopeTarget'],
  '@kinetick-labs/kh-session': ['SESSION_FORMAT_VERSION'],
  '@kinetick-labs/kh-session-persistence': ['SessionPersistenceNotFoundError'],
} as const satisfies HostDependencyExports

/** Exact import specifier to reviewed runtime exports. */
type HostDependencyExports = Readonly<Record<string, readonly string[]>>

/** Complete configurable input to package dependency classification. */
export interface PackageDependencyPolicy {
  readonly clientFaceInclude: readonly string[]
  readonly clientFaceExclude: readonly string[]
  readonly hostPackages: readonly string[]
  readonly requiredServicePeers?: Readonly<Record<string, readonly string[]>>
  readonly configurationOnlyDevDependencies: Readonly<Record<string, readonly string[]>>
  readonly duplicateSafePackages?: readonly string[]
  readonly safeHostDependencyExports: HostDependencyExports
  readonly peerRequiredHostExports: HostDependencyExports
}

/** Repository dependency policy consumed by verification and benchmarking. */
export const PACKAGE_DEPENDENCY_POLICY: PackageDependencyPolicy = {
  clientFaceInclude: CLIENT_FACE_INCLUDE,
  clientFaceExclude: CLIENT_FACE_EXCLUDE,
  hostPackages: HOST_DEPENDENCY_PACKAGES,
  requiredServicePeers: REQUIRED_SERVICE_PEERS,
  configurationOnlyDevDependencies: CONFIGURATION_ONLY_DEV_DEPENDENCIES,
  duplicateSafePackages: DUPLICATE_SAFE_PACKAGES,
  safeHostDependencyExports: SAFE_HOST_DEPENDENCY_EXPORTS,
  peerRequiredHostExports: PEER_REQUIRED_HOST_EXPORTS,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Whether a package manifest declares a dynamically loaded Client entry. */
export function hasClientDeclaration(khField: unknown): boolean {
  return isRecord(khField) && Object.hasOwn(khField, 'client')
}

/** Whether the repository policy flattens one package's non-Cordis peers. */
export function usesFlattenedPackageDependencies(
  manifestPath: string,
  packageName: string,
  khField: unknown,
  policy: PackageDependencyPolicy = PACKAGE_DEPENDENCY_POLICY,
): boolean {
  if (!manifestPath.startsWith('packages/') || manifestPath.startsWith('packages/experimental/')) return false
  if (policy.hostPackages.includes(packageName)) return true
  if (manifestPath.startsWith('packages/client/')) return true
  const included = hasClientDeclaration(khField) || policy.clientFaceInclude.includes(packageName)
  return included && !policy.clientFaceExclude.includes(packageName)
}
