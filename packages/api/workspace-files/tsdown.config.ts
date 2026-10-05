import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@kinetick-labs/kh-api-workspace-files',
  ['lib/types/index.js'],
  { hostPhase: true },
)
