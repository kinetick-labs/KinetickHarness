# Data and network

English | [中文](privacy.zh.md)

KinetickHarness keeps sessions, credentials, and settings on this machine. The default composition does not upload session logs, feedback, product analytics, or OpenTelemetry to DeepSeek or any other collector.

## What stays local

Session transcripts, attachments, and settings live under the harness home (`~/.dsh` unless `DSH_HOME` is set). Feedback you record is written to the session log and is not exported. When you use the optional DeepSeek model API, those requests do not include an anonymous installation id, a session id, the session log, or the active package inventory.

This fork does not process or store your sessions in China, or in any other place, on your behalf. A model provider you configure receives the prompts and tool results that provider's API requires, at the endpoint you set.

## What can use the network

Network use is limited to destinations you choose:

- The model API endpoint you configure, such as DeepSeek, OpenAI, OpenRouter, or a local OpenAI-compatible gateway.
- Optional tools you install, including MCP servers, and web search or fetch when those tools are enabled.
- Package installs you start yourself.

No collector URL is built in. Enabling OpenTelemetry session upload or product analytics requires an endpoint you supply, and both rows stay disabled until you do.
