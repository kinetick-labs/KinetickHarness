# 数据与网络

[English](privacy.md) | 中文

KinetickHarness 把会话、凭据和设置保存在本机。默认组合不会把会话日志、反馈、产品埋点或 OpenTelemetry 上传到 DeepSeek 或任何其他收集端。

## 留在本机的内容

会话记录、附件和设置位于 harness home（未设置 `DSH_HOME` 时为 `~/.dsh`）。你记录的反馈写入会话日志，并且不会被导出。使用可选的 DeepSeek 模型 API 时，这些请求不包含匿名安装 id、会话 id、会话日志或当前包清单。

本 fork 不会代你把会话处理或存储在中国，也不会代你存储到其他地方。你配置的模型提供方只会在你设置的端点上收到该 API 所需要的提示词和工具结果。

## 可以使用网络的情况

网络只用于你选择的目的地：

- 你配置的模型 API 端点，例如 DeepSeek、OpenAI、OpenRouter，或本地的 OpenAI 兼容网关。
- 你安装的可选工具，包括 MCP 服务器，以及在启用时的网页搜索或抓取。
- 你自己发起的包安装。

会话日志留在磁盘上。此构建没有 OpenTelemetry 导出器、产品埋点上报，也没有 DeepSeek 会话日志上传。
