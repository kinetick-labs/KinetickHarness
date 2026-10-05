---
kind: upgrade-guide
description: "The kh command, @kinetick-labs/kh-* packages, KH_* variables, and ~/.kh replace the dsh names."
---

# KinetickHarness names replace dsh

English | [中文](guide.zh.md)

## Change

The next release renames the product from DeepSeek Harness to KinetickHarness. The command is `kh` (`pnpm kh` from a source checkout). Published packages move from `@deepseek-ai/dsh` and `@deepseek-ai/dsh-*` to `@kinetick-labs/kh` and `@kinetick-labs/kh-*`. Environment variables use the `KH_` prefix. The default home directory is `~/.kh`. Profile and package manifests store composition under `kh` (`kh.profile.bundles`, `kh.bundle`, `kh.client`) instead of `dsh`. DeepSeek remains an optional model provider. The session message source kind `dsh-session-title-llm` stays so existing logs still match. The compaction header `x-deepseek-harness-compact` stays. Session-log upload and product telemetry are removed in this same version.

## Migration

1. Move an existing home with `mv ~/.dsh ~/.kh`, or set `KH_HOME` to the old directory. If `KH_HOME` is unset, a non-empty `DSH_HOME` is still read.
2. Rename other `DSH_*` variables to `KH_*`. `DSH_TELEMETRY_DISABLED`, `DSH_TELEMETRY_MODE`, `DSH_TELEMETRY_OTLP_URL`, and `DSH_PRODUCT_ANALYTICS_OTLP_URL` are removed, not renamed.
3. In each profile `package.json`, rename the top-level `dsh` object to `kh`. Installed plugin dependencies must use the `@kinetick-labs/kh-*` names.
4. Invoke `kh` instead of `dsh`. Confirm with `kh --version` and a profile whose `package.json` contains `kh.profile.bundles`.
