import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@kinetick-labs/kh-api-remotes',
  ['lib/types/index.js'],
  { hostPhase: true },
)
