# Loadable Harness plugin packages

This file is GENERATED from workspace manifests (`scripts/gen-plugin-packages.ts`) and verified fresh by `pnpm run verify-plugin-packages` (part of `doc-sync`); do not edit it by hand.

Every package below exports a Cordis plugin that a bundle patch can name in a Loader row. `Config` marks packages whose row accepts a `config` mapping; query `Config.listConfigs` through `cordis_inspect_query` (filter by `name`, then query the `entry` id) for the mounted schema. Packages under `experimental` are pre-stable.

## acp

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-acp` | yes | Automation-only Agent Client Protocol server for driving KinetickHarness agents over JSON-RPC stdio |

## api

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-api-account-controller` | no | Expose safe account operations over authenticated Remote |
| `@kinetick-labs/kh-api-gateway` | yes | Typert Remote Host dispatcher and Client API endpoint |
| `@kinetick-labs/kh-api-job-controller` | yes | Job Remote observation stream and the reference-counted client job-output service |
| `@kinetick-labs/kh-api-remotes` | no | Remote BFF assembly for application-selected Host capabilities |
| `@kinetick-labs/kh-api-session-controller` | yes | Session Remote commands, cold reads, and live control transport |
| `@kinetick-labs/kh-api-settings-controller` | yes | Remote owner for the configuration surfaces over the settings-domain seams |
| `@kinetick-labs/kh-api-terminal-controller` | yes | Session-owned interactive terminals with shell discovery, screen recovery and typed Remote control |
| `@kinetick-labs/kh-api-workspace-controller` | yes | Workspace Remote commands and reconnect-safe state transport |
| `@kinetick-labs/kh-api-workspace-files` | yes | Workspace file service and Client resource provider: bounded reads, directory listing, and live metadata over the workspaceFiles Remote namespace |

## attachment

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-attachment-local` | yes | Private content-addressed KH_HOME attachment storage |

## boot

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-config-editor` | no | Persist plugin configuration through profile patches and Loader reconciliation |
| `@kinetick-labs/kh-hmr` | yes | Coordinated module and profile configuration hot reload |
| `@kinetick-labs/kh-plugin-manager` | yes | Current-profile plugin and bundle management shared by kh CLI, Web and agent tools |

## browser-use

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-browser-use` | no | Exclusive named browser-use provider registration |

## bundle

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-acp-app` | no | The kh ACP profile bundle: automation-only JSON-RPC stdio and process lifecycle over kh-base |
| `@kinetick-labs/kh-headless` | yes | The kh one-shot bundle: a direct core Agent/Session runner over kh-base with no Host, HTTP, or browser layer |
| `@kinetick-labs/kh-sdk-app` | yes | The kh SDK profile bundle: stdio JSON-RPC serving and process lifecycle over kh-base |
| `@kinetick-labs/kh-web-app` | yes | The kh browser-surface bundle: the web patch layer over kh-base plus the runtime glue plugin (frontend dist serving, web-surface prompt, bash runtime variables, URL line) |

## client

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-client-connection` | yes | Authenticated RPC transport and generation lifecycle |
| `@kinetick-labs/kh-client-file-upload` | no | Agent-scoped browser file upload, streaming intake, and staged receipt service |
| `@kinetick-labs/kh-client-hmr` | yes | Web client graph synchronization and rebuilt-bundle reload transport |
| `@kinetick-labs/kh-client-locale` | no | Locale plugin: Host-backed preference, extensible language catalog, browser fallback, and typed built-in dictionaries |
| `@kinetick-labs/kh-client-modules` | no | Client module system, dual-face: node half composes the __KH_BOOT__ entry graph (incremental kh.client scan, bundle route, index tap, webPlugins service); browser half is the lazy-CJS module table the vendored cordis Loader consumes as its internal seam |
| `@kinetick-labs/kh-client-resources` | no | Unified client resource model: protocol-registered providers turn URL addresses into live values, consumed through the useResource global standard hook |
| `@kinetick-labs/kh-client-shortcuts` | yes | Application keyboard command registry and physical-key routing |
| `@kinetick-labs/kh-client-ui-agent-preset` | no | Agent-preset surfaces: the default for later sessions, this session's seat, and the composition editor |
| `@kinetick-labs/kh-client-ui-approval` | no | Approval composer takeover over the scoped Remote Event waterfall |
| `@kinetick-labs/kh-client-ui-attachment` | no | Dynamic attachment presentation plugin for conversation input, message-image, and trajectory image slots |
| `@kinetick-labs/kh-client-ui-brand-official` | no | Official KinetickHarness brand occupants for the Web client's sidebar slots |
| `@kinetick-labs/kh-client-ui-chat` | no | Chat Conversation target, node definitions, renderers, and details surface |
| `@kinetick-labs/kh-client-ui-commands` | no | Client command surface: global directory cache, '/' source, three command UI kinds, popupSelect registry |
| `@kinetick-labs/kh-client-ui-conversation` | no | Target-neutral Conversation assembly, shell, composer, queue, and view navigation |
| `@kinetick-labs/kh-client-ui-deliverables` | no | Changed-files card with per-file comparison tabs, delivery cards, and clickable final-response file references for Web |
| `@kinetick-labs/kh-client-ui-directory-picker-browse` | no | In-app directory browsing surface: the workspace directory-flow owner rendering the host's listing and creation primitives |
| `@kinetick-labs/kh-client-ui-directory-picker-native` | no | Native directory-picker surface: the renderless workspace directory-flow occupant driving the local Desktop or Host OS chooser |
| `@kinetick-labs/kh-client-ui-goal` | no | Session goal surface: GoalBar docked above the composer, read from the goal session projection |
| `@kinetick-labs/kh-client-ui-input-trigger` | no | Input trigger pipeline: '/' and '@' detection, candidate menu, pick routing to registered sources |
| `@kinetick-labs/kh-client-ui-jobs` | no | Session-header background-job list with on-demand streaming record panels |
| `@kinetick-labs/kh-client-ui-layout` | no | Shell plugin: three-column AppFrame with drag handles, ctx.layout viewing-state service (navigation + panels) |
| `@kinetick-labs/kh-client-ui-message-feedback` | no | The Web feedback surface: per-message Like/Dislike in the assistant-message action strip and the feedback dialog behind both ratings and /feedback, backed by the messageFeedback and sessionFeedback Host Remotes |
| `@kinetick-labs/kh-client-ui-model-selection` | no | Model selection over the shared model catalog, Session projection, and session.selectModel |
| `@kinetick-labs/kh-client-ui-open-in-app` | no | Web "Open In..." controls: the Session-header split button opening the workspace directory in an installed application, and the document preview's default-application controls for one file |
| `@kinetick-labs/kh-client-ui-permission-presets` | no | Permission surfaces: a new-session default in General settings and a current-session /permission popup over the permissions projection |
| `@kinetick-labs/kh-client-ui-plan` | no | Plan mode controls, persistent transcript plan cards, and sidebar Markdown previews |
| `@kinetick-labs/kh-client-ui-plugin-manager` | yes | Plugin management for the kh web client: the sidebar Plugins panel installs, enables, disables, retries, and composes installed plugin packages |
| `@kinetick-labs/kh-client-ui-reference` | no | Unified Web @file and @session reference source |
| `@kinetick-labs/kh-client-ui-renderer` | no | Browser UI renderer: React slot bindings, ctx.uiRenderer, and the assembled application root |
| `@kinetick-labs/kh-client-ui-schedule` | no | Host task management page and Session reminder catalog |
| `@kinetick-labs/kh-client-ui-session` | no | Session Controller adapter for React and session-scoped slots |
| `@kinetick-labs/kh-client-ui-settings` | no | Settings domain base plugin: shared configuration forms and the canonical settings slot-type contract |
| `@kinetick-labs/kh-client-ui-settings-account` | yes | Manage DeepSeek login and open Platform billing pages |
| `@kinetick-labs/kh-client-ui-settings-agent-loop` | no | Settings page of the agent loop on the kh web client's Plugins page: the parallel tool-call cap of the agent-loop namespace |
| `@kinetick-labs/kh-client-ui-settings-general` | no | Settings ownerless-copy and product onboarding plugin: the General section, shell trigger/header chrome content, settings dictionaries, and the versioned welcome notice |
| `@kinetick-labs/kh-client-ui-settings-models` | yes | Models settings and shared product-onboarding dialogs over existing settings and credential joins |
| `@kinetick-labs/kh-client-ui-settings-plugin-inventory` | no | Read-only Cordis Loader inventory tab in Web Plugins settings |
| `@kinetick-labs/kh-client-ui-settings-plugins` | no | Built-in plugins settings section for the kh web client: the Settings navigation entry and the tab chrome feature-owned tabs register into |
| `@kinetick-labs/kh-client-ui-settings-shell` | no | Settings page of the shell executor on the kh web client's Plugins page: the command timeout and the per-stream output cap of the shell namespace |
| `@kinetick-labs/kh-client-ui-settings-subagent` | no | Settings page of Subagent delegation on the kh web client's Plugins page: recursion depth, parallel capacity, and the models agents may choose for subagents |
| `@kinetick-labs/kh-client-ui-settings-web-search` | no | Settings page of the DeepSeek web-search provider on the kh web client's Plugins page: its API key, endpoint, and per-request search budget |
| `@kinetick-labs/kh-client-ui-shortcuts` | no | Keyboard shortcut reference, recording, and local preference editing |
| `@kinetick-labs/kh-client-ui-sidebar` | no | Sidebar plugin: session multi-level tree, search, grouping, state dots |
| `@kinetick-labs/kh-client-ui-sidebar-browser` | no | Sandboxed Web browser tabs for the right Sidebar |
| `@kinetick-labs/kh-client-ui-sidebar-documentpreview` | yes | Extensible Sidebar previews for Office documents, spreadsheets, Markdown, code, images, PDF, HTML, and plain text |
| `@kinetick-labs/kh-client-ui-sidebar-files` | no | Workspace file tree tab type for the right Sidebar: lazy directory listing over the workspaceFiles Remote namespace, opening files into the Sidebar |
| `@kinetick-labs/kh-client-ui-sidebar-right` | no | Right Sidebar: the docking surface's session-bound state, its panel and header expand control, and the navigation service over it |
| `@kinetick-labs/kh-client-ui-sidebar-terminal` | no | Interactive shell tabs for the right Sidebar |
| `@kinetick-labs/kh-client-ui-skill` | no | Web skill references and the dedicated skill tool row |
| `@kinetick-labs/kh-client-ui-subagent` | no | Subagent conversation catalog, continuation routing UI, and '@' reference source |
| `@kinetick-labs/kh-client-ui-theme` | yes | Theme plugin: Host bootstrap for the pre-plugin palette; DOM-free ThemeRuntime for light/dark/system state; --dsw-* token styles and Appearance settings row |
| `@kinetick-labs/kh-client-ui-tool` | no | Client Tool call-tree renderer and keyed per-tool presentation slot |
| `@kinetick-labs/kh-client-ui-trajectory` | no | Trajectory event ledger with an interactive timing overview: pure-consumer plugin registering into the conversation ViewMap (no service) |
| `@kinetick-labs/kh-client-ui-user-questions` | no | Web ask_user_question composer takeover and plan-review presentation UI |
| `@kinetick-labs/kh-client-ui-workflow-run` | no | Durable workflow-run Conversation Node and nested member disclosure for kh web |
| `@kinetick-labs/kh-client-ui-workspace` | no | Workspace picker plugin: one WorkspacePicker registered into the sidebar and empty-state workspace slots |

## compaction

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-command-compact` | no | Human-facing slash command for explicit session compaction |
| `@kinetick-labs/kh-compaction-basic` | yes | Token-meter-driven compaction policy and LLM summarization backend for the KinetickHarness |
| `@kinetick-labs/kh-compaction-image-offload` | no | Durable image offload for image-capable routes: replace over-budget request images with placeholders and retry |
| `@kinetick-labs/kh-compaction-tool-result-pruner` | yes | Replay-safe model-free head/middle/tail pruning for tool-result surface nodes |

## computer-use

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-computer-use` | no | Exclusive named computer-use provider registration |

## context

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-agent-instructions` | yes | Workspace context loader for AGENTS.md/CLAUDE.md instruction files |
| `@kinetick-labs/kh-file-reference-local` | yes | Local-filesystem ctx.fileReferences provider with bounded fuzzy indexes |
| `@kinetick-labs/kh-session-reference` | yes | Cross-session snapshot references and durable untrusted model context (ctx.sessionReferenceResolver) |
| `@kinetick-labs/kh-time-context` | yes | Durable per-step context with the current time and elapsed time |
| `@kinetick-labs/kh-tmux-context` | yes | Opt-in durable per-step context with this agent's tmux pane and window location |

## core

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-agent` | no | Agent interface, registry, initiator scope, and event vocabulary for the KinetickHarness |
| `@kinetick-labs/kh-agent-default-model` | yes | Default model selection shared by Agent entry points |
| `@kinetick-labs/kh-agent-loop` | yes | The concrete agent loop plugin for the KinetickHarness |
| `@kinetick-labs/kh-agent-tool-presentation` | yes | Agent-plane presentation selector: composes one agent's tools as PTC mode, native, or both |
| `@kinetick-labs/kh-session` | no | Event-sourced session store for the KinetickHarness |
| `@kinetick-labs/kh-system-prompt` | yes | System prompt assembly registry for the KinetickHarness |
| `@kinetick-labs/kh-tools` | yes | Tool registry and execution pipeline for the KinetickHarness |

## credentials

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-authorization` | no | Authorization seam (ctx.authorization): plugin-owned flows that obtain a credential through a conversation with the human |
| `@kinetick-labs/kh-credentials-local` | yes | File-backed credentials provider ($KH_HOME/.env under the live process environment) for the KinetickHarness |
| `@kinetick-labs/kh-deepseek-account-platform` | yes | Authorize DeepSeek accounts through browser PKCE |

## deliverables

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-tool-present` | yes | Explicit workspace file delivery declarations for the KinetickHarness |
| `@kinetick-labs/kh-workspace-changes` | yes | Per-turn workspace file changes recorded from git working-tree snapshots and whole-file captures, with per-file comparisons, for the KinetickHarness |

## document

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-office-to-pdf` | yes | Shared Office-to-PDF conversion with bounded queues and caching |

## experimental

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-experimental-agent-team` | yes | Implicit-root Agent Teams roster, durable peer mailbox, and shared task DAG |
| `@kinetick-labs/kh-experimental-api-speech-to-text` | yes | Authenticated experimental speech transcription for browser clients |
| `@kinetick-labs/kh-experimental-auto-review` | no | Per-tool LLM authorization review for the KinetickHarness Auto permission preset |
| `@kinetick-labs/kh-experimental-browser-use-chrome-devtools-mcp` | yes | Experimental per-Session Chromium browser tools through chrome-devtools-mcp |
| `@kinetick-labs/kh-experimental-browser-use-playwright-mcp` | yes | Experimental per-Session Chromium browser tools through @playwright/mcp |
| `@kinetick-labs/kh-experimental-browser-use-stagehand-native` | yes | Experimental Stagehand browser tools with separately configured native models |
| `@kinetick-labs/kh-experimental-claude-code-mods` | yes | Experimental bridge: load Claude Code mods (hooks modules) and run their hook chains on KinetickHarness extension points |
| `@kinetick-labs/kh-experimental-client-ui-agent-team` | no | Web Agent Teams roster, task board, and teammate navigation |
| `@kinetick-labs/kh-experimental-client-ui-claude-code-mods` | no | Web band above the prompt for Claude Code mods: draws each session's mod tree and sends button presses back to the bridge |
| `@kinetick-labs/kh-experimental-client-ui-voice-input` | no | Record speech and insert editable text into the conversation draft |
| `@kinetick-labs/kh-experimental-computer-use-cua-driver-mcp` | yes | Experimental computer use through an installed Cua Driver MCP executable |
| `@kinetick-labs/kh-experimental-computer-use-cua-driver-native` | no | Experimental computer-use provider embedding the Cua Driver native npm SDK |
| `@kinetick-labs/kh-experimental-inspector` | yes | Experimental cross-realm CDP hub for Host debugging and Client Runtime inspection |
| `@kinetick-labs/kh-experimental-ptc-runtime-python` | yes | CPython subprocess implementation of the KinetickHarness PTC execution seam |
| `@kinetick-labs/kh-experimental-session-inspector` | no | Experimental virtualized Session log and live Chat group/node inspectors |
| `@kinetick-labs/kh-experimental-speech-to-text` | yes | Experimental speech recognition with independently selectable providers |
| `@kinetick-labs/kh-experimental-speech-to-text-sensevoice` | yes | Local SenseVoice ONNX transcription with a managed sherpa-onnx process |
| `@kinetick-labs/kh-experimental-tool-agent-team` | yes | Scoped model-facing Agent Teams tools over ctx.agentTeams |

## extensions

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-client-ui-cordis` | no | Cordis dynamic-plugin definition card: the keyed cordis_define tool row with its run/stop switch |
| `@kinetick-labs/kh-cordis-client-runner` | no | Browser half of dynamic dual-half plugin packages: event subscription, closure evaluation, guard facade, and loader entries |
| `@kinetick-labs/kh-cordis-host-runner` | yes | Dynamic package definition registry, host-half sandbox lifecycle, and invoke handler table for model-mounted dual-half packages |
| `@kinetick-labs/kh-tool-cordis` | no | Read-only runtime API inspection for Harness plugin development |

## feedback

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-command-feedback` | no | Log-only session feedback: the record event, the sessionFeedback Host Remote, and the human-facing slash command |
| `@kinetick-labs/kh-message-feedback` | yes | Canonical Session-log ratings and notes for finalized assistant messages |

## fs

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-fs-local` | yes | Local-filesystem implementation of the KinetickHarness filesystem seam (ctx.fs) |
| `@kinetick-labs/kh-fs-observation-policy` | no | File-context policy plugin for the KinetickHarness — observed-state, read-before-edit, and version-guarded write/edit added over the ctx.fs provider seam through the fs/* event gate (no service API) |
| `@kinetick-labs/kh-fs-sandbox` | yes | Sandbox-enforcing implementation of the KinetickHarness filesystem seam: fences write/edit by the per-call sandbox mode (read-only denies mutation, workspace-write contains it to the workspace + temp roots) while reads pass through |
| `@kinetick-labs/kh-tool-fs` | yes | Model-facing filesystem tools (read, write, edit) over the KinetickHarness filesystem seam (ctx.fs) |
| `@kinetick-labs/kh-tool-fs-search` | yes | Model-facing filesystem discovery tools (glob, grep) backed by the packaged ripgrep binary (@vscode/ripgrep) |
| `@kinetick-labs/kh-tool-str-replace-editor` | yes | Model-facing view, create, literal replace, and line insert tool over the Harness filesystem service |

## goal

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-command-goal` | no | Human-facing slash command for persisted same-session goals |
| `@kinetick-labs/kh-goal` | yes | Event-sourced same-session goal state and lifecycle service for the KinetickHarness |
| `@kinetick-labs/kh-goal-round-driver` | no | Race-fenced same-session goal-round driver |
| `@kinetick-labs/kh-tool-goal` | yes | Model-facing same-session goal tools with execution-time authority checks |

## guard

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-repeat-tool-reminder` | yes | Repeat-tool-call guard plugin: advisory reminders when an agent loops on identical tool calls |
| `@kinetick-labs/kh-tool-call-timeout-policy` | no | Tool-call timeout policy: a tools/execute wrapper that arms a per-tool deadline on exec.signal and returns TOOL_TIMEOUT when it wins |

## hooks

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-hooks-claude-code` | yes | Bridge plugin: run a Claude Code hooks.json / settings hook config on the KinetickHarness interception seams |
| `@kinetick-labs/kh-hooks-codex` | yes | Bridge plugin: run a Codex hooks.json hook config on the KinetickHarness interception seams |

## host

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-host-directory-picker-auto` | no | Adaptive chooser of the directory-picker seam: resolves the host situation at boot and mounts the native or browse backend for the KinetickHarness web GUI host |
| `@kinetick-labs/kh-host-directory-picker-browse` | yes | In-app browsing backend of the directory-picker seam (listing/creation primitives over the host filesystem) |
| `@kinetick-labs/kh-host-directory-picker-native` | no | Native-OS-chooser backend of the directory-picker seam for the KinetickHarness web GUI host |
| `@kinetick-labs/kh-host-frontend-static` | yes | SPA dist server for the Web shell: owns the webserver fallback seat, serving explicit index entries and static assets with traversal rejection and 404 misses |
| `@kinetick-labs/kh-host-open-in-app` | yes | Host half of open-in-app: resolved application catalog, icons, and the launch endpoint as three webServer routes |
| `@kinetick-labs/kh-host-plugin-inventory` | no | Read-only Remote projection of current Cordis Loader plugin state |
| `@kinetick-labs/kh-host-webserver` | yes | Web route-registration plugin: HTTP and upgrade routes, index transform taps, and static dist fallback; knows no harness concepts |

## interaction

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-commands` | no | Plugin-owned human command registry for KinetickHarness UIs |
| `@kinetick-labs/kh-permission-presets` | yes | User-facing permission presets (ctx.permissionPresets) for the KinetickHarness: one product-level Permissions select bundling the sandbox-mode and approval-policy knobs, written through to their own session events |
| `@kinetick-labs/kh-tool-ask-user` | yes | Model-facing ask_user_question tool over the ctx.userQuestions seam |
| `@kinetick-labs/kh-user-approval` | yes | User-approval seam (ctx.approval) for the KinetickHarness: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default |
| `@kinetick-labs/kh-user-questions` | no | Abstract user-questions seam (ctx.userQuestions) for asking the human during agent runs |

## jobs

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-jobs-local` | yes | Process-local implementation of the KinetickHarness background job registry seam |
| `@kinetick-labs/kh-tool-jobs` | yes | Model-facing background job control tools (job_output, job_list, job_kill) over the ctx.jobs registry |

## llm

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-deepseek-llm-api-extensions` | no | Additive request-field registry for the official DeepSeek LLM API adapter |
| `@kinetick-labs/kh-llm` | no | Provider-neutral LLM service interface for the KinetickHarness |
| `@kinetick-labs/kh-llm-deepseek-account` | yes | DeepSeek account provider authentication and discovery |
| `@kinetick-labs/kh-llm-deepseek-api-key` | yes | DeepSeek api-key provider authentication and discovery |
| `@kinetick-labs/kh-llm-pi-ai` | yes | pi-ai-backed DeepSeek adapter for the KinetickHarness LLM seam (design-verification twin of kh-llm-deepseek) |
| `@kinetick-labs/kh-llm-retry` | yes | Provider-routed LLM request retry policy for the KinetickHarness |
| `@kinetick-labs/kh-token-meter` | yes | Replay-aware token measurement service (ctx.tokenMeter) for the KinetickHarness |

## lsp

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-lsp` | no | Abstract LSP capability seam (ctx.lsp) for the KinetickHarness — language-server provider registry keyed by branded id and extension mapping, order-independent per-query selection, normalized definition/references/implementation/hover requests and results, and the LspError taxonomy |
| `@kinetick-labs/kh-lsp-stdio` | yes | Generic stdio language-server provider for the KinetickHarness LSP capability seam (ctx.lsp) — spawns configured servers, translates JSON-RPC, and serves transient-open goToDefinition/findReferences/goToImplementation/hover queries in the host filesystem namespace |
| `@kinetick-labs/kh-tool-lsp` | yes | Model-facing lsp tool over the KinetickHarness LSP capability seam (ctx.lsp) — one read-only tool with goToDefinition/findReferences/goToImplementation/hover operations, one-based UTF-16 cursor coordinates, bounded location rendering, and hover normalization |

## mcp

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-mcp-client` | yes | MCP client bridge: connects to MCP servers and registers their tools on ctx.tools |
| `@kinetick-labs/kh-mcp-resources` | no | Scoped MCP resource discovery and reading through shared model tools |

## plan

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-plan-mode` | yes | Logged per-agent plan mode with deployment guidance, a direct slash command, and a user-reviewed exit |

## preset

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-agent-preset` | yes | Declare an Agent capability composition in Cordis YAML |
| `@kinetick-labs/kh-agent-preset-registry` | yes | Declarative Agent preset registry and profile-backed editing |
| `@kinetick-labs/kh-persona` | yes | Composition-authored deployment persona section for the KinetickHarness |

## ptc-runtime

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-ptc-runtime-node` | yes | Sandboxed Node process implementation of the KinetickHarness PTC execution capability |

## sandbox

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-sandbox-local` | yes | Local process-sandbox backends for the KinetickHarness sandbox seam: bwrap, the npm-distributed landlock-run launcher, macOS Seatbelt, or the Windows ACL restricted-token runner — functionally probed, fail-closed |
| `@kinetick-labs/kh-sandbox-policy` | yes | Per-call sandbox policy resolver and current model context: deployment fallbacks plus each session's mode and workspace root, shared by every enforcing capability family |

## schedule

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-schedule` | yes | Host-wide durable reminders with shared management and original-Session delivery |
| `@kinetick-labs/kh-tool-schedule` | no | Model-facing reminder management tools (schedule_create, schedule_list, schedule_update, schedule_delete) over the Host ctx.schedule service |

## sdk

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-sdk-jsonrpc-server` | yes | Stdio JSON-RPC server plugin for out-of-process KinetickHarness SDK clients |

## session

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-session-checkpoint-policy` | no | Semantic session durability checkpoints before model requests and tool side effects |
| `@kinetick-labs/kh-session-persistence-jsonl` | yes | JSONL durable session persistence backend for the KinetickHarness |
| `@kinetick-labs/kh-session-projection` | no | Session-projection seam: the merge-extensible projection type table, the provider contract, and the ctx.sessionProjections registry serving whole current values of log-derived per-session state |
| `@kinetick-labs/kh-session-projection-cache` | yes | Persisted projection cache (ctx.sessionProjectionCache): durable per-session checkpoint records on the session_projcache storage domain (per-record layout), throttled write-behind, and the cached listing read |
| `@kinetick-labs/kh-session-stats` | no | Whole-log conversation counts and wall times projection (sessionStats) for the KinetickHarness |
| `@kinetick-labs/kh-session-title` | yes | Log-backed session title service and provider registry for the KinetickHarness |
| `@kinetick-labs/kh-session-title-all-prompts-llm` | yes | All-user-messages LLM provider plugin for KinetickHarness session titles |
| `@kinetick-labs/kh-session-title-first-prompt-llm` | yes | First-message LLM provider plugin for KinetickHarness session titles |
| `@kinetick-labs/kh-session-turn-outline` | no | Whole-log turn outline projection (turnOutline) for the KinetickHarness |

## session-query

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-session-log-export` | yes | Web Session-log export command and shared download dialog |
| `@kinetick-labs/kh-session-query-sqlite` | yes | Concrete ctx.sessionQuery backend with SQLite FTS5 search |
| `@kinetick-labs/kh-tool-session-query` | yes | Workspace-authorized model-facing session history search, trace, and event read tools |

## settings

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-settings` | no | Abstract user-settings seam (ctx.settings) for the KinetickHarness |

## shell

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-bash-local` | yes | Local-subprocess implementation of the KinetickHarness bash executor seam |
| `@kinetick-labs/kh-bash-sandbox` | yes | Sandbox-consuming implementation of the KinetickHarness bash executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts) |
| `@kinetick-labs/kh-pwsh-local` | yes | Local PowerShell implementation of the KinetickHarness bash executor seam |
| `@kinetick-labs/kh-pwsh-sandbox` | yes | Sandbox-consuming implementation of the KinetickHarness PowerShell executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts) |
| `@kinetick-labs/kh-shell-env` | yes | Tool-independent managed KH_* shell environment registry |
| `@kinetick-labs/kh-tool-bash` | yes | Model-facing bash tool with optional generic background-job and sandbox-escalation support |
| `@kinetick-labs/kh-tool-bash-persistent` | yes | Model-facing owner-scoped persistent Bash tool backed by the Harness PTY service |
| `@kinetick-labs/kh-tool-pwsh` | yes | Model-facing pwsh tool over the bash executor seam |
| `@kinetick-labs/kh-tool-pwsh-persistent` | yes | Model-facing owner-scoped persistent PowerShell tool backed by the Harness PTY service |

## skill

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-skill` | yes | Agent skill provider registry for the KinetickHarness |
| `@kinetick-labs/kh-skill-badge` | no | Bundled kh badge skill provider for KinetickHarness |
| `@kinetick-labs/kh-skill-filesystem` | yes | Local filesystem skill provider for the KinetickHarness |
| `@kinetick-labs/kh-skill-office` | yes | Bundled Word, PowerPoint, and Excel workflows and structural checks |
| `@kinetick-labs/kh-tool-skill` | yes | Model-facing skill loading tool for the KinetickHarness |
| `@kinetick-labs/kh-tool-workspace-dependencies` | yes | The load_workspace_dependencies tool: absolute paths into a bundled Python, Node.js, and pnpm payload |

## spill

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-spill-local` | yes | Local-filesystem implementation of the KinetickHarness spill storage seam (private session-scoped files) |
| `@kinetick-labs/kh-spill-policy` | yes | Token-budgeted tool-result retention with recoverable text and image paths |

## ssh

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-fs-ssh` | no | Filesystem provider over the shared POSIX SSH helper |
| `@kinetick-labs/kh-sandbox-ssh` | no | Remote POSIX sandbox argv provider over the shared SSH helper |
| `@kinetick-labs/kh-ssh` | yes | Shared OpenSSH connection and versioned POSIX remote helper |
| `@kinetick-labs/kh-subprocess-ssh` | no | Subprocess and terminal provider over the shared POSIX SSH helper |

## storage

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-storage` | no | Storage hub (ctx.storage): named backend registry plus mounted data-form facilities for the KinetickHarness |
| `@kinetick-labs/kh-storage-domain` | yes | Domain data form (ctx.storage.domain): schema-validated, event-emitting KV domains over storage backends for the KinetickHarness |
| `@kinetick-labs/kh-storage-json` | yes | JSON file KV storage backend for the KinetickHarness storage hub |
| `@kinetick-labs/kh-storage-sqlite` | yes | SQLite storage backend (kv facet) for the KinetickHarness storage hub |

## subagent

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-subagent` | yes | Abstract subagent seam (ctx.subagents): named-provider registry for delegating to child agents |
| `@kinetick-labs/kh-subagent-acp` | yes | Out-of-process ACP subagent backend: drives a child agent in a spawned subprocess over the Agent Client Protocol |
| `@kinetick-labs/kh-subagent-claude-code` | yes | One-shot Claude Code subagent provider over the official Agent SDK |
| `@kinetick-labs/kh-subagent-codex` | yes | One-shot Codex subagent provider over the official app-server protocol |
| `@kinetick-labs/kh-subagent-kh-sdk` | yes | Out-of-process SDK subagent backend: drives a child KinetickHarness runtime subprocess over stdio JSON-RPC through the TypeScript SDK client |
| `@kinetick-labs/kh-subagent-fork-in-process` | yes | In-process fork subagent backend: runs a child agent seeded with a prefix of the parent's log |
| `@kinetick-labs/kh-subagent-spawn-in-process` | yes | In-process spawn subagent backend: runs a fresh child agent on ctx.agents |
| `@kinetick-labs/kh-tool-subagent` | yes | Model-facing subagent delegation tool over the ctx.subagents seam |
| `@kinetick-labs/kh-tool-subagent-control` | no | Globally named send_message, interrupt_agent, and list_agents tools over ctx.subagents continuations |

## subprocess

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-subprocess-local` | no | Local-subprocess implementation of the KinetickHarness subprocess seam |

## terminal

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-terminal` | no | Persistent PTY session seam for the KinetickHarness — owner-scoped ids, backend registry, interactive sends, reads, signals, and awaited cleanup |
| `@kinetick-labs/kh-terminal-bash` | yes | Persistent shell PTY backend over the KinetickHarness subprocess terminal primitive |
| `@kinetick-labs/kh-tool-terminal` | yes | Six model-facing persistent PTY tools with owner isolation and generic background-job integration |

## test-support

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-llm-replay` | yes | Replay LLM plugin: short-circuits llm/stream with model chunks reconstructed from a recorded session JSONL (keyless snapshot tests) |

## todo

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-tool-todo` | yes | Model-facing todo_write tool over the KinetickHarness event-sourced session log |

## typert

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-typert-loader` | yes | Loader integration for generated Typert package contributions |

## web

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-tool-web` | yes | Model-facing web tools (web_search, web_fetch) over the KinetickHarness web capability seam (ctx.web) |
| `@kinetick-labs/kh-web` | yes | Abstract web access capability seam (ctx.web) for the KinetickHarness — search/fetch provider registry, registration-order-independent selection, request/result vocabulary, and the WebError taxonomy |
| `@kinetick-labs/kh-web-fetch-http` | yes | Anonymous public HTTP(S) fetch provider for the KinetickHarness web capability seam (ctx.web) |
| `@kinetick-labs/kh-web-search-deepseek` | yes | DeepSeek-backed search provider (native web_search via the Anthropic-compatible API) for the KinetickHarness web capability seam (ctx.web) |
| `@kinetick-labs/kh-web-search-exa` | yes | Exa-backed search provider for the KinetickHarness web capability seam (ctx.web) |
| `@kinetick-labs/kh-web-search-perplexity` | yes | Perplexity-backed search provider for the KinetickHarness web capability seam (ctx.web) |

## webhook

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-webhook` | no | Fire-and-forget webhook rule runtime that creates Workspace-backed KinetickHarness Sessions |
| `@kinetick-labs/kh-webhook-github` | yes | Signed GitHub HTTP webhook adapter for the KinetickHarness webhook runtime |

## workflow

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-tool-ralph` | yes | Model-facing fresh-agent Ralph loop over the workflow and subagent seams |
| `@kinetick-labs/kh-tool-workflow` | yes | Model-facing workflow tool: run a JavaScript orchestration script over ctx.workflowEngine |
| `@kinetick-labs/kh-workflow-ptc` | yes | Workflow orchestration in the shared sandboxed Node PTC runtime |

## workspace

| Package | Config | Description |
|---|---|---|
| `@kinetick-labs/kh-workspace` | no | Workspace entity registry (ctx.workspaceRegistry): durable workspace records with validated session attachment over the domain data form for the KinetickHarness |
