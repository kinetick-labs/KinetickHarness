# Agent Note: Canonical feedback log and request delivery

Status: implemented

## Problem

Editable message ratings need one durable authority that Session export and request delivery can retain. A separate feedback store makes those consumers incomplete and introduces a second commit relationship with the target message. Recording a human judgment must not change model input or imply that a collector accepted it.

## Decision

The canonical Session log owns feedback. Session-level remarks use `feedback/record`; material message edits and deletions use `feedback/message-put` and `feedback/message-delete`. All are log-only. The service folds current items from events matching the requested `sessionId`, so inherited parent events do not become a fork's current feedback. Deletion removes the current item, not earlier ratings or notes from the log.

Live message-feedback mutations append through the owning Session and await its durability checkpoint; cold mutations hold a persistence write handle across read, comparison, append, and flush without creating a Session or Agent. A matching no-op appends nothing but still awaits persistence. Failures propagate, and a failed live flush can leave an observable in-memory item for retry. Per-item versions prevent unrelated message edits from conflicting; strict stale-write rejection prevents ABA overwrites even when the desired value matches. Target validation binds a judgment to a sent assistant message, and forks keep independent judgments. These choices retain rationale recorded in the [archived sidecar decision](../../archived/architecture/2026-08-10-message-feedback-sidecar.md), whose storage and commit mechanism is superseded.

This fork does not upload Session events on model requests. Feedback stays in the canonical Session log and is not a model-input field. The [telemetry removal guide](../../../../docs/upgrade-guide/v0.2.1-alpha.1/remove-telemetry/guide.md) records the deleted upload and collector packages. The [explicit-feedback note](2026-09-05-nonofficial-feedback-otel.md) records the former independent upload path.

The command confirms recording with the Session and anonymous user ids. Its append remains unflushed. This supersedes the command-copy decision in the [archived sharing disclosure note](../../archived/feature/2026-08-07-feedback-acknowledgement-sharing-disclosure.md). This fork has no telemetry policy API.

## Alternatives considered

**Keep the sidecar.** It supports destructive local edits, but cannot make feedback part of ordinary canonical-log export and delivery without another join and durability relationship.

**Reuse `feedback/record` for message edits.** A free-text Session remark does not identify an item mutation. Distinct events preserve message identity and deletion semantics; upload policy remains consumer-owned.

**Add a dedicated feedback uploader or immediate LLM request.** The default-on log contribution carries canonical events on eligible requests. The existing OTel pipeline independently handles explicit-feedback uploads for all providers, without a custom feedback uploader or another model request.

## Consequences

Feedback survives ordinary log export and replay without consuming model-input tokens or changing KV Cache. Current-item deletion is not erasure. The DeepSeek request contribution can leave final feedback local until another eligible request; OTel sends an authorized batch independently under its own policy. The Web controller remains a unary Remote consumer and does not consume feedback log events for cross-tab updates.

[Message-feedback tests](../../../../packages/feedback/message-feedback/tests/message-feedback.spec.ts) cover material events, no-ops, strict versions, fork isolation, and persistence failures. The [command tests](../../../../packages/feedback/command-feedback/tests/command-feedback.spec.ts) pin the plain confirmation.
