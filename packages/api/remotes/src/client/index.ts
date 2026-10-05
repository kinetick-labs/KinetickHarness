/** Platform-neutral assembly of generated Host Remote contributions. */

import type { Context } from '@deepseek-ai/cordis'
import agentPresetsRemote from '@kinetick-labs/kh-agent-preset-registry/remote'
import userQuestionsRemote from '@kinetick-labs/kh-user-questions/remote'
import commandsRemote from '@kinetick-labs/kh-commands/remote'
import accountRemote from '@kinetick-labs/kh-api-account-controller/remote'
import settingsControllerRemote from '@kinetick-labs/kh-api-settings-controller/remote'
import officeToPdfRemote from '@kinetick-labs/kh-office-to-pdf/remote'
import goalsRemote from '@kinetick-labs/kh-goal/remote'
import scheduleRemote from '@kinetick-labs/kh-schedule/remote'
import llmRemote from '@kinetick-labs/kh-llm/remote'
import dynamicRemote from '@kinetick-labs/kh-cordis-host-runner/remote'
import pluginManagerRemote from '@kinetick-labs/kh-plugin-manager/remote'
import pluginRegistryProbeRemote from '@kinetick-labs/kh-client-ui-plugin-manager/remote'
import pluginInventoryRemote from '@kinetick-labs/kh-host-plugin-inventory/remote'
import messageFeedbackRemote from '@kinetick-labs/kh-message-feedback/remote'
import permissionPresetsRemote from '@kinetick-labs/kh-permission-presets/remote'
import sessionFeedbackRemote from '@kinetick-labs/kh-command-feedback/remote'
import fileUploadsRemote from '@kinetick-labs/kh-client-file-upload/remote'
import sessionReferencesRemote from '@kinetick-labs/kh-session-reference/remote'
import subagentsRemote from '@kinetick-labs/kh-subagent/remote'
import sessionRemote from '@kinetick-labs/kh-api-session-controller/remote'
import jobRemote from '@kinetick-labs/kh-api-job-controller/remote'
import workspaceRemote from '@kinetick-labs/kh-api-workspace-controller/remote'
import terminalRemote from '@kinetick-labs/kh-api-terminal-controller/remote'
import workspaceFilesRemote from '@kinetick-labs/kh-api-workspace-files/remote'
import type { ClientRemote } from '@kinetick-labs/kh-api-gateway/client'

export type { ClientRemote } from '@kinetick-labs/kh-api-gateway/client'
export type {
  BundleInfo, BundleRowInfo, ChangeResult, IncompatiblePlugin, InspectOptions, InstallBundleOptions, InstallSpecKind, ManagementError,
  PackageResult,
  PluginChange, PluginEntryId, PluginInfo, PluginInspectProblem, PluginInstallCancellation, PluginInstallFailureKind,
  PluginInstallLogChunk, PluginInstallProgress, PluginInstallRequestId, PluginRegistries, PluginSpecInspection, ReadOnlyReason, Registry,
} from '@kinetick-labs/kh-plugin-manager/types'
export type {} from '@kinetick-labs/kh-plugin-manager/remote'
export type {} from '@kinetick-labs/kh-client-ui-plugin-manager/remote'
export type { PluginInventorySnapshot } from '@kinetick-labs/kh-host-plugin-inventory/types'
export type {} from '@kinetick-labs/kh-agent-preset-registry/remote'
export type {} from '@kinetick-labs/kh-user-questions/remote'
export type {} from '@kinetick-labs/kh-commands/remote'
export type {} from '@kinetick-labs/kh-api-settings-controller/remote'
export type {} from '@kinetick-labs/kh-api-account-controller/remote'
export type {} from '@kinetick-labs/kh-goal/remote'
export type {} from '@kinetick-labs/kh-schedule/remote'
export type {} from '@kinetick-labs/kh-office-to-pdf/remote'
export type {} from '@kinetick-labs/kh-llm/remote'
export type {} from '@kinetick-labs/kh-host-plugin-inventory/remote'
export type {} from '@kinetick-labs/kh-message-feedback/remote'
export type {} from '@kinetick-labs/kh-permission-presets/remote'
export type {} from '@kinetick-labs/kh-command-feedback/remote'
export type {} from '@kinetick-labs/kh-client-file-upload/remote'
export type {} from '@kinetick-labs/kh-session-reference/remote'
export type {} from '@kinetick-labs/kh-subagent/remote'
export type * from '@kinetick-labs/kh-subagent/client'
export type {} from '@kinetick-labs/kh-api-session-controller/remote'
export type * from '@kinetick-labs/kh-api-session-controller/types'
export type {} from '@kinetick-labs/kh-api-job-controller/remote'
export type * from '@kinetick-labs/kh-api-job-controller/types'
export type {} from '@kinetick-labs/kh-api-workspace-controller/remote'
export type * from '@kinetick-labs/kh-api-workspace-controller/types'
export type {} from '@kinetick-labs/kh-api-workspace-files/remote'
export type * from '@kinetick-labs/kh-api-workspace-files/types'
export type {} from '@kinetick-labs/kh-api-terminal-controller/remote'
export type * from '@kinetick-labs/kh-api-terminal-controller/types'
// The forwarded-event allowlist's selection seat: without it in the consumer's
// compilation face `TypertRemoteEvent` is `never` and every `$on` call fails.
export type { ApiRemoteForwardedEvent } from '../types.ts'
// The owner packages' client-safe `./types` exports supply the `Events`
// signatures `$on` hands to a listener, so a consumer reads the very
// declaration the Host emits rather than a flattened restatement of it.
export type {} from '@kinetick-labs/kh-commands/types'
export type {} from '@kinetick-labs/kh-cordis-host-runner/types'
export type {} from '@kinetick-labs/kh-credentials/types'
export type {} from '@kinetick-labs/kh-llm/types'
export type {} from '@kinetick-labs/kh-agent-preset-registry/types'
export type {} from '@kinetick-labs/kh-permission-presets/types'
export type {} from '@kinetick-labs/kh-settings/types'
export type {} from '@kinetick-labs/kh-user-approval/types'
export type {} from '@kinetick-labs/kh-user-questions/types'
export type {} from '@kinetick-labs/kh-api-session-controller/types'

/**
 * The carrier's Client-facing types, re-exported so a business package names one
 * assembly package instead of both this facade and the Connection plugin. Type-only:
 * the carrier's runtime values stay behind their own module edge.
 */
export type {
  ConnectionHandle, ConnectionSinks, ContentBlock,
  MessageId,
  RpcId, RpcRequest, RpcResponse, RpcResult, SessionId,
  StreamChunk,
} from '@kinetick-labs/kh-client-connection/client'
export type {} from '@kinetick-labs/kh-api-gateway/client'
export type {} from '@kinetick-labs/kh-cordis-host-runner/remote'

// The payload vocabulary of the selected namespaces, re-exported so a Client
// contribution can name what it sends and receives without importing a Host
// package: this assembly is the one place both planes legitimately meet.
export type {
  ApprovalRequestId,
  CordisHalfState,
  CordisDynamicPackageId,
  CordisDynamicPluginId,
  CordisDynamicPluginRunId,
  CordisDynamicRunMode,
  CordisInspectMethodManifest,
  CordisInspectPlatform,
  CordisInspectProviderManifest,
  CordisInspectProviderView,
  CordisInspectQueryRequest,
  CordisInspectQueryResolution,
  CordisInspectQueryResolved,
  CordisInspectRequestId,
  CordisInspectResolveAck,
  CordisRunDiagnostic,
  CordisRunStatus,
  DynamicCordisClientSource,
  DynamicCordisHostHalfResult,
  DynamicCordisInventoryRow,
  DynamicCordisInvokeResult,
  DynamicCordisPackage,
  DynamicCordisRequestResolved,
  DynamicCordisResolveAck,
  DynamicCordisRetracted,
  DynamicCordisRunRequest,
  DynamicCordisRunResolution,
  DynamicCordisRunAttempt,
  DynamicCordisRunResponse,
  DynamicCordisStopResponse,
  DynamicCordisUndefineReceipt,
  RequestRunOutcome,
} from '@kinetick-labs/kh-cordis-host-runner/types'
// Credential state vocabulary for the credentials namespace (values never ride it).
export type { CredentialInfo } from '@kinetick-labs/kh-credentials/types'
// Redacted namespace vocabulary for the settings namespace (secrets never ride
// it). It travels with its seam, whose `./types` the Client face already reads.
export type {
  SettingsDescribeValue, SettingsNamespaceView, SettingsPathOpView, SettingsSecretView,
} from '@kinetick-labs/kh-settings/types'
// Provider registry and discovery vocabulary for the llm namespace.
export type {
  LlmConfigurableProvider, LlmDiscoveredModel,
  LlmModelDiscoveryRequest, LlmProviderInfo,
} from '@kinetick-labs/kh-llm/types'
// Reference-discovery result vocabulary for the fileReferences and
// sessionReferenceResolver namespaces.
export type { FileReferenceCandidate } from '@kinetick-labs/kh-file-reference/types'
export type { SessionReferenceMentionCandidate } from '@kinetick-labs/kh-session-reference/types'

// The Remote failure vocabulary, re-exported so business packages keep naming
// this assembly alone. Types only: a value export would make spec imports load
// this module's owner /remote artifacts; specs take RemoteError from
// kh-client-test-runtime instead.
export type {
  RemoteErrorCode, RemoteErrorDetailsMap, RemoteFailure, RemoteResult,
} from '@kinetick-labs/kh-typert-protocol'
export type { RemoteHostFacts } from '@kinetick-labs/kh-api-gateway/client'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Generated Remote namespaces selected by this Client assembly. */
    remote: ClientRemote
  }
}

/** Required service: the typed Client Remote contribution mount. */
export const inject = ['remote']

/**
 * Mount the Host capabilities explicitly selected for this Client assembly.
 * @param ctx - Client Cordis root carrying the typed API service.
 * @returns disposer after every selected Remote namespace is ready.
 */
export async function apply(ctx: Context): Promise<() => Promise<void>> {
  const disposers: Array<() => Promise<void>> = []
  try {
    for (const contribution of [
      agentPresetsRemote, commandsRemote, settingsControllerRemote, accountRemote,
      goalsRemote, llmRemote, dynamicRemote, scheduleRemote,
      pluginInventoryRemote, pluginManagerRemote, pluginRegistryProbeRemote, messageFeedbackRemote, sessionFeedbackRemote,
      fileUploadsRemote, sessionReferencesRemote,
      permissionPresetsRemote, subagentsRemote, sessionRemote, jobRemote, workspaceRemote, workspaceFilesRemote, terminalRemote,
      officeToPdfRemote, userQuestionsRemote,
    ]) {
      disposers.push(await ctx.remote.$mount(contribution))
    }
  } catch (error) {
    for (const dispose of disposers.reverse()) await dispose()
    throw error
  }
  // Unwound in reverse mount order, so a namespace never outlives one mounted
  // after it.
  return async () => {
    for (const dispose of disposers.reverse()) await dispose()
  }
}
