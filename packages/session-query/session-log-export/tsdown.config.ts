import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@kinetick-labs/kh-session-log-export',
  ['lib/types/index.js'],
  { hostPhase: true },
)
