import { clientBundle } from '../tsdown.client.ts'

export default clientBundle(
  '@kinetick-labs/kh-client-shortcuts',
  ['lib/types/index.js', 'lib/types/protocol.js'],
  { hostPhase: true },
)
