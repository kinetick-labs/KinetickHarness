import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@kinetick-labs/kh-api-session-controller',
  ['lib/types/index.js'],
  { hostPhase: true },
)
