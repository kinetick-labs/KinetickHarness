import type { TurnBoundaryProjection } from './types.ts'
import type {} from '@kinetick-labs/kh-session-projection'

declare module '@kinetick-labs/kh-session-projection/types' {
  interface SessionProjectionStateMap {
    /** The agent session's open/last turn and step boundary facts (whole value). */
    turnBoundary: TurnBoundaryProjection
  }
}

export {}
