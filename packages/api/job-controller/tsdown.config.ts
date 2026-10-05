import { clientBundle } from '../../client/tsdown.client.ts'

export default clientBundle(
  '@kinetick-labs/kh-api-job-controller',
  ['lib/types/index.js'],
  { hostPhase: true },
)
