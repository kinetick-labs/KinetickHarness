---
kind: upgrade-guide
description: "随附 profile 移除了会话上传、产品埋点和匿名用户 id。"
---

# 移除会话上传与产品埋点

[English](guide.md) | 中文

## 变更

随附 profile 不再包含会话遥测、OpenTelemetry 导出、DeepSeek 会话日志上传、插件包清单请求字段、产品埋点或匿名用户 id。程序不再读取 `DSH_TELEMETRY_DISABLED`、`DSH_TELEMETRY_MODE`、`DSH_TELEMETRY_OTLP_URL` 和 `DSH_PRODUCT_ANALYTICS_OTLP_URL`。`/feedback` 只确认会话 id，也不会创建 `$KH_HOME/.anonymous-user-id`。

harness home 下的本地 JSONL 会话仍留在磁盘上。官方模型请求仍发送 `user-agent`，压缩请求仍发送 `x-deepseek-harness-compact: 1`。它们不发送 `dsh_session_log`、`dsh_plugin_packages`、`x-deepseek-harness-user-id` 或 `x-deepseek-harness-session-id`。

## 迁移

1. 删除 `otel`、`session-telemetry-otel`、`session-log-deepseek`、`plugin-package-inventory-deepseek`、`desktop-product-telemetry`、`product-analytics` 和 `ui-settings-session-log` 的 cordis 行与设置。指向已删除行的 patch 会被跳过。
2. 如果 profile 的 `package.json` 自行加入了这些包，请移除它们，并从启动脚本中删除遥测环境变量。
3. 确认：模型请求正文没有 `dsh_session_log` 或 `dsh_plugin_packages`，并且 `/feedback` 只回复一行：`Feedback recorded for session <id>.`。
