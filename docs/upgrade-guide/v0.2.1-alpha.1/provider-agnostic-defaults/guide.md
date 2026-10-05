---
kind: upgrade-guide
description: "Shipped profiles no longer select DeepSeek or enable DeepSeek web search until you configure a provider."
---

# Shipped profiles no longer default to DeepSeek

## Change

Profiles built on `kh-base` no longer set `agent-default-model` to `deepseek-official` / `deepseek-flash`. `currentSelection()` returns undefined until a provider and model are saved. The Web composer shows **Select model**, and `kh --profile headless` exits until a patch sets the default. `web-search-deepseek` is disabled, so `web_search` does not call DeepSeek until a patch enables that row. `ModelCatalog.default` is omitted when no default is configured. The DeepSeek chat plugin stays mounted. The ACP profile still names `deepseek-official` / `deepseek-v4-flash` on its `acp` row.

## Migration

1. In the Web UI, open **Settings → Models**, save OpenAI, OpenRouter, a custom OpenAI-compatible endpoint, or a DeepSeek key, then pick a model.
2. For headless or any profile that must start without that page, add a patch from `apps/cli/config/examples/providers/`. Example: `kh --profile headless --patch apps/cli/config/examples/providers/openai.cordis.yml "task"`.
3. To restore the previous chat default and DeepSeek web search, apply `apps/cli/config/examples/providers/deepseek.cordis.yml`.
4. Confirm with a new session: the composer names your model, or headless prints an answer instead of `no default model is configured`.
