/** Filesystem ownership for the Electron-managed desktop installation. */

import { join } from 'node:path'
import { resolveKhHome } from '@kinetick-labs/kh-home-paths'

/** Stable desktop installation paths under the shared Harness home. */
export interface DesktopPaths {
  readonly profile: string
  readonly lock: string
}

/**
 * Resolve every Electron-owned path without changing the shared data roots.
 * @param khHome - Harness home shared with npm-installed kh.
 * @returns immutable desktop path set.
 */
export function resolveDesktopPaths(khHome: string = resolveKhHome()): DesktopPaths {
  return {
    profile: join(khHome, 'profiles', 'desktop'),
    lock: join(khHome, 'profiles', 'desktop', 'lock'),
  }
}
