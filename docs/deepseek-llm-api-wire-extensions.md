# Official DeepSeek LLM API wire extensions

English | [中文](deepseek-llm-api-wire-extensions.zh.md)

This reference defines every DeepSeek Harness-specific HTTP header sent by [`@deepseek-ai/dsh-llm-deepseek`](../packages/llm/llm-deepseek/README.md) on `deepseek-official` Messages requests. It does not redefine fields owned by the upstream DeepSeek API. The provider-neutral LLM interface and `llm-pi-ai` do not implement these additions.

The adapter sends the additions to its resolved `baseURL`, including a configured gateway. They remain outside `messages`, system prompts, and tool schemas, so they do not add model-input tokens or alter the model-visible prefix. Shipped profiles attach no session log, plugin inventory, anonymous user id, or session id.

## Wire namespaces and versioning

| Location | Naming | Examples |
|---|---|---|
| HTTP field names | Lowercase kebab-case; HTTP matching remains case-insensitive | `user-agent`, `x-deepseek-harness-compact` |

The [`DeepSeekLlmApiExtensionRegistry`](../packages/llm/deepseek-llm-api-extensions/README.md) can reserve one provider per top-level extension name. Shipped profiles register no providers, so official requests send the base body only. Empty or whitespace-padded names, duplicate registrations, and collisions with the base DeepSeek request fail before HTTP dispatch.

## Request headers

| Header | Presence | Value |
|---|---|---|
| `user-agent` | Every provider HTTP request, including Files API operations | Application identity in `product/version (+url)` form; the default product is `deepseek-harness` |
| `x-deepseek-harness-compact` | Model requests whose purpose is `compaction` | The literal string `1` |

Official model requests do not send `x-deepseek-harness-user-id` or `x-deepseek-harness-session-id`, and a model call does not create `$DSH_HOME/.anonymous-user-id`. Session-title requests have no additional purpose header. `x-deepseek-harness-compact` names a compaction request; it is not a usage report.

## Body-extension transaction

The adapter serializes the complete base body, including the exact `messages`, before it asks registered providers to prepare fields. A provider receives that immutable body, the request cancellation signal, and optional `sessionId` and auxiliary-call `purpose`. Returning `undefined` omits that provider's field for the request.

Prepared JSON values are detached from provider-owned state, merged as top-level siblings of the base fields, and serialized in the same HTTP body. Preparation or collision failure prevents the request. If the merged body fails to serialize, the adapter sends the base body without any extension field, skips the acceptance transaction so contributors resend their state on a later request, and logs the omitted field names. Shipped profiles mount the registry and register no contributors, so they send the unextended base body. A composition without the registry does the same.

After the configured endpoint returns HTTP 2xx, the adapter runs the prepared `accept()` transaction before reading the SSE response body. Transport failures and non-2xx responses do not accept any contribution. An acceptance failure fails the model request even though the endpoint returned 2xx. Acceptance records endpoint-level HTTP success; it does not assert that an SSE stream completed or that the endpoint persisted an extension.

## Exposure and receiver requirements

Request headers expose the application version. The compaction header names the request purpose. Official requests do not attach session content, feedback, package names, or an anonymous installation id. A gateway selected through `baseURL` receives the same headers and base body as the official endpoint.
