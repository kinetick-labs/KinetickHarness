import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@kinetick-labs/kh-api-terminal-controller',
  ['lib/types/index.js'],
  { hostPhase: true },
)
