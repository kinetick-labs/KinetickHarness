---
kind: upgrade-guide
description: "Session upload, product analytics, and the anonymous user id are removed from shipped profiles."
---

# Session upload and product analytics removed

English | [中文](guide.zh.md)

## Change

Shipped profiles no longer include session telemetry, OpenTelemetry export, DeepSeek session-log upload, the plugin-package inventory request field, product analytics, or the anonymous user id. `DSH_TELEMETRY_DISABLED`, `DSH_TELEMETRY_MODE`, `DSH_TELEMETRY_OTLP_URL`, and `DSH_PRODUCT_ANALYTICS_OTLP_URL` are not read. `/feedback` acknowledges only the session id and does not create `$KH_HOME/.anonymous-user-id`.

Local JSONL sessions under the harness home stay on disk. Official model requests still send `user-agent` and, for compaction, `x-deepseek-harness-compact: 1`. They do not send `dsh_session_log`, `dsh_plugin_packages`, `x-deepseek-harness-user-id`, or `x-deepseek-harness-session-id`.

## Migration

1. Delete cordis rows and settings for `otel`, `session-telemetry-otel`, `session-log-deepseek`, `plugin-package-inventory-deepseek`, `desktop-product-telemetry`, `product-analytics`, and `ui-settings-session-log`. A patch that names a removed row is skipped.
2. Remove those packages from a profile `package.json` if you added them, and drop the telemetry environment variables from launch scripts.
3. Confirm: a model request body has no `dsh_session_log` or `dsh_plugin_packages`, and `/feedback` replies with one line, `Feedback recorded for session <id>.`
