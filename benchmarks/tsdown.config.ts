import { defineConfig } from 'tsdown'
import { typertPlugin } from '../packages/typert/generator/lib/types/tsdown-plugin.js'

// Benchmark workers bundle workspace `lib` products into a single file, so the
// typert decorator stripper that the root config installs must run here too:
// without it, `@Remote` metadata emitted by the package build survives into the
// worker bundle and Node rejects the module at import time.
//
// The vendored framework (@deepseek-ai/*) is bundled into the workers: its
// FiberState is a `const enum`, i.e. a type-only export once the framework
// lib is built, so importing it as an external demands a runtime named
// export that does not exist ("does not provide an export named
// 'FiberState'"). Rolldown inlines the enum members when the framework is
// part of the bundle graph. Workspace harness packages (@kinetick-labs/*)
// stay external and resolve through their built lib entrypoints.
const shared = {
  plugins: [typertPlugin({ mode: 'workspace', faces: ['host'] })],
  format: 'esm' as const,
  platform: 'node' as const,
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  deps: {
    neverBundle: [/^@kinetick-labs\//],
    onlyBundle: false as const,
  },
}

/** Compile measured benchmark workers while keeping workspace packages on their built `lib` entries. */
export default defineConfig([
  {
    ...shared,
    entry: { 'terminal-io.worker': 'terminal-io/terminal-io.worker.ts' },
    outDir: '.kh-build/terminal-io',
    clean: true,
    tsconfig: 'tsconfig.host.json',
  },
  {
    ...shared,
    entry: { 'reconnect.worker': 'active-stream-reconnect/reconnect.worker.client.ts' },
    outDir: '.kh-build/active-stream-reconnect',
    clean: true,
    tsconfig: 'tsconfig.client.json',
  },
  {
    ...shared,
    entry: {
      'agent-continuation.worker': 'agent-continuation/agent-continuation.worker.ts',
      'child-catalog.worker': 'agent-continuation/child-catalog.worker.ts',
      'profile-continuation.worker': 'agent-continuation/profile-continuation.worker.ts',
      'profile-adapter': 'agent-continuation/profile-adapter.ts',
    },
    outDir: '.kh-build/agent-continuation',
    clean: true,
    tsconfig: 'tsconfig.host.json',
  },
  {
    ...shared,
    entry: { 'session-open.worker': 'session-open/session-open.worker.ts' },
    outDir: '.kh-build/session-open',
    clean: true,
    tsconfig: 'tsconfig.host.json',
  },
  {
    ...shared,
    entry: {
      'session-corpus.worker': 'session-corpus/session-corpus.worker.ts',
      'projection-list.worker': 'session-corpus/projection-list.worker.ts',
    },
    outDir: '.kh-build/session-corpus',
    clean: true,
    tsconfig: 'tsconfig.host.json',
  },
  {
    ...shared,
    entry: {
      'conversation-fold.worker': 'conversation-fold/conversation-fold.worker.client.ts',
    },
    outDir: '.kh-build/conversation-fold',
    clean: true,
    tsconfig: 'tsconfig.client.json',
  },
])
