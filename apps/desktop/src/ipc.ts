/** Typed preload operations exposed only by the Electron shell. */

import type { DesktopKeyboardApi, DesktopShortcutsApi } from '@kinetick-labs/kh-client-shortcuts/protocol'
import type { IpcMainInvokeEvent } from 'electron'
import type { DesktopBrowserBridge } from '@kinetick-labs/kh-client-ui-sidebar-browser/types'

/** IPC channel names kept private to the desktop application bundle. */
export const DESKTOP_IPC = {
  shortcutsInput: 'kh-desktop:shortcuts-input',
  shortcutsCloseWindow: 'kh-desktop:shortcuts-close-window',
  shortcutsGet: 'kh-desktop:shortcuts-get',
  shortcutsEdit: 'kh-desktop:shortcuts-edit',
  shortcutsChanged: 'kh-desktop:shortcuts-changed',
  shortcutsRecording: 'kh-desktop:shortcuts-recording',
  boot: 'kh-desktop:boot',
  enterWorkspace: 'kh-desktop:enter-workspace',
  onboardingActive: 'kh-desktop:onboarding-active',
  onboardingApiKey: 'kh-desktop:onboarding-api-key',
  bootFailed: 'kh-desktop:boot-failed',
  browserAcquire: 'kh-desktop:browser-acquire',
  browserRelease: 'kh-desktop:browser-release',
  browserOpenRequested: 'kh-desktop:browser-open-requested',
  directoryPick: 'kh-desktop:directory-pick',
  deviceInfo: 'kh-desktop:device-info',
  localeBootstrap: 'kh-desktop:locale-bootstrap',
  localeChanged: 'kh-desktop:locale-changed',
  updatesStatus: 'kh-desktop:updates-status',
  updatesOpen: 'kh-desktop:updates-open',
  updatesPresentation: 'kh-desktop:updates-presentation',
  nativeThemeSet: 'kh-desktop:native-theme-set',
  windowFullscreen: 'kh-desktop:window-fullscreen',
  windowsAppearance: 'kh-desktop:windows-appearance',
  windowsMenu: 'kh-desktop:windows-menu',
} as const

/** Desktop release update state rendered by desktop-owned UI. */
export type DesktopUpdatePreparationFailureKind = 'stop-failed' | 'tasks-changed' | 'tasks-unavailable'

export interface DesktopUpdateState {
  readonly phase: 'idle' | 'checking' | 'available' | 'downloading' | 'verifying' | 'installing' | 'ready' | 'error'
  readonly version?: string
  readonly message?: string
  /** Main-owned diagnostics without subprocess output or credentials; hidden until expanded. */
  readonly technicalDetails?: string
  readonly percent?: number
  readonly failedOperation?: 'check' | 'download' | 'install'
  /** Main-owned preparation cause; UI wording is selected by the active locale. */
  readonly preparationFailure?: DesktopUpdatePreparationFailureKind
}

/** Classified failure copy selected by the Web locale without exposing raw updater diagnostics. */
export type DesktopUpdateFailureKind =
  | 'check'
  | 'check-network'
  | 'download'
  | 'download-network'
  | 'install'
  | 'install-network'
  | 'stop-failed'
  | 'tasks-changed'
  | 'tasks-unavailable'

/** Semantic status content; actions open main-process confirmation dialogs only. */
export interface DesktopUpdatePresentation {
  readonly phase: DesktopUpdateState['phase']
  readonly version?: string
  readonly percent?: number
  readonly failure?: DesktopUpdateFailureKind
}

/** Product documents cannot supply update versions, package URLs, or installation authorization. */
export interface KhDesktopProductApi {
  readonly protocolVersion: 1
  readonly browser: DesktopBrowserBridge
  readonly keyboard: DesktopKeyboardApi
  readonly shortcuts: DesktopShortcutsApi
  /**
   * Local machine description for the feedback questionnaire.
   * @returns `name=value` fields separated by `; `, with no hostname, user name, or serial number.
   */
  deviceInfo(): Promise<string>
  readonly updates: {
    status(): Promise<DesktopUpdatePresentation>
    open(): Promise<void>
    subscribe(listener: (state: DesktopUpdatePresentation) => void): () => void
  }
}

/** Scheme of Desktop-owned application documents. */
export const SCHEME = 'kh-app'

/**
 * Reject IPC outside the allowed Desktop document origins.
 * @param event - IPC caller whose frame URL supplies the origin.
 * @param hostnames - Desktop document hosts allowed for this operation.
 */
export function assertDesktopSender(event: IpcMainInvokeEvent, hostnames: readonly string[]): void {
  const senderFrame = event.senderFrame
  if (senderFrame === null) throw new Error('kh desktop: rejected IPC without a sender frame')
  const url = new URL(senderFrame.url)
  if (url.protocol !== `${SCHEME}:` || !hostnames.includes(url.hostname)) {
    throw new Error('kh desktop: rejected IPC from an unowned renderer')
  }
}
