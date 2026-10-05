---
kind: upgrade-guide
description: "kh 命令、@kinetick-labs/kh-* 包、KH_* 变量和 ~/.kh 取代 dsh 名称。"
---

# KinetickHarness 名称取代 dsh

[English](guide.md) | 中文

## 变更

下一个版本把产品名称从 DeepSeek Harness 改为 KinetickHarness。命令是 `kh`（源码检出中使用 `pnpm kh`）。已发布的包从 `@deepseek-ai/dsh` 和 `@deepseek-ai/dsh-*` 改为 `@kinetick-labs/kh` 和 `@kinetick-labs/kh-*`。环境变量使用 `KH_` 前缀。默认主目录是 `~/.kh`。Profile 和包清单把组合放在 `kh` 下（`kh.profile.bundles`、`kh.bundle`、`kh.client`），不再使用 `dsh`。DeepSeek 仍是可选的模型提供方。会话消息来源种类 `dsh-session-title-llm` 保持不变，以便已有日志仍然匹配。压缩请求头 `x-deepseek-harness-compact` 保持不变。同一版本移除了会话日志上传和产品遥测。

## 迁移

1. 用 `mv ~/.dsh ~/.kh` 移动已有主目录，或把 `KH_HOME` 指到旧目录。未设置 `KH_HOME` 时，非空的 `DSH_HOME` 仍会被读取。
2. 将其余 `DSH_*` 变量改名为 `KH_*`。`DSH_TELEMETRY_DISABLED`、`DSH_TELEMETRY_MODE`、`DSH_TELEMETRY_OTLP_URL` 和 `DSH_PRODUCT_ANALYTICS_OTLP_URL` 已删除，不要改名。
3. 在每个 profile 的 `package.json` 里，把顶层 `dsh` 对象改名为 `kh`。已安装的插件依赖必须使用 `@kinetick-labs/kh-*` 名称。
4. 用 `kh` 代替 `dsh` 启动。用 `kh --version` 确认，并检查 profile 的 `package.json` 含有 `kh.profile.bundles`。
