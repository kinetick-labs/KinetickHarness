# 官方 DeepSeek LLM API 协议扩展

[English](deepseek-llm-api-wire-extensions.md) | 中文

本参考定义 [`@kinetick-labs/kh-llm-deepseek`](../packages/llm/llm-deepseek/README.zh.md) 在 `deepseek-official` Messages 请求上发送的每一个 KinetickHarness 专用 HTTP 标头。它不重新定义上游 DeepSeek API 拥有的字段。提供方无关的 LLM 接口和 `llm-pi-ai` 不实现这些附加内容。

适配器把附加内容发到解析后的 `baseURL`，包括已配置的网关。它们位于 `messages`、系统提示词和工具 schema 之外，因此不增加模型输入 token，也不改变模型可见前缀。随附 profile 不附加会话日志、插件清单、匿名用户 id 或会话 id。

## 协议命名空间与版本

| 位置 | 命名 | 示例 |
|---|---|---|
| HTTP 字段名 | 小写 kebab-case；HTTP 匹配仍不区分大小写 | `user-agent`、`x-deepseek-harness-compact` |

[`DeepSeekLlmApiExtensionRegistry`](../packages/llm/deepseek-llm-api-extensions/README.zh.md) 可以为每个顶层扩展名保留一个提供方。随附 profile 不注册提供方，因此官方请求只发送基础正文。空名称、仅含空白的名称、重复注册，以及与基础 DeepSeek 请求冲突的名称，都会在 HTTP 发送前失败。

## 请求标头

| 标头 | 出现时机 | 值 |
|---|---|---|
| `user-agent` | 每一次提供方 HTTP 请求，包括 Files API 操作 | `product/version (+url)` 形式的应用标识；默认产品是 `kinetick-harness` |
| `x-deepseek-harness-compact` | 用途为 `compaction` 的模型请求 | 字面字符串 `1` |

官方模型请求不发送 `x-deepseek-harness-user-id` 或 `x-deepseek-harness-session-id`，模型调用也不会创建 `$KH_HOME/.anonymous-user-id`。会话标题请求没有额外的用途标头。`x-deepseek-harness-compact` 标明这是一次压缩请求，不是使用情况上报。

## 正文扩展事务

适配器先序列化完整基础正文，包括确切的 `messages`，再请已注册的提供方准备字段。提供方收到这份不可变正文、请求取消信号，以及可选的 `sessionId` 和辅助调用 `purpose`。返回 `undefined` 会在该请求中省略该提供方的字段。

准备好的 JSON 值会脱离提供方自有状态，作为基础字段的顶层同级合并，并序列化进同一个 HTTP 正文。准备失败或字段冲突会阻止请求。合并后的正文无法序列化时，适配器发送不含任何扩展字段的基础正文，跳过接受事务以便贡献方在后续请求中重发状态，并记录被省略的字段名。随附 profile 挂载注册表但不注册贡献方，因此发送未扩展的基础正文。未挂载注册表的组合同样如此。

配置的端点返回 HTTP 2xx 后，适配器在读取 SSE 响应正文之前运行已准备的 `accept()` 事务。传输失败和非 2xx 响应不会接受任何贡献。接受失败会使模型请求失败，即使端点返回了 2xx。接受记录的是端点级 HTTP 成功；它不断言 SSE 流已完成，也不断言端点持久化了扩展。

## 暴露范围与接收方要求

请求标头暴露应用版本。压缩标头标明请求用途。官方请求不附加会话内容、反馈、包名或匿名安装 id。通过 `baseURL` 选择的网关收到与官方端点相同的标头和基础正文。
