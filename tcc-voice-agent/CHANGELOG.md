# Changelog

## v1.1.0 — Production hardening (audit fixes)

A full senior-level review found and fixed the following before go-live.

### Fixed — blockers / compliance
- **Webhook double-billing (P0):** the Bolna webhook now dedupes by `executionId` (`billing.recordUsage`). Bolna retries no longer inflate client invoices. Added `unique(execution_id)` on `usage_events` in the SQL schema.
- **Wrong customer-phone field (P1, the "wrong file"):** `test/mock-webhook.json` and `server.js` used `user_number`/`agent_number`, which Bolna does **not** send. Bolna carries the number in `telephony_data.from_number` (inbound) / `to_number` (outbound). This bug meant the customer number resolved to empty in production, so **spoken opt-outs were never suppressed** (TRAI/DPDP risk) and lead/WhatsApp/escalation silently no-op'd. Fixed the mapping and the fixture.
- **Unauthenticated webhook (P1):** `/webhooks/bolna` now verifies a shared secret `?token=` (`BOLNA_WEBHOOK_TOKEN`), which `create-agents` bakes into every agent's webhook URL.
- **Call logs never persisted (P1):** every completed call is now written to a `call_logs` store (transcript, recording URL, extracted data) — the DPDP audit trail the docs promised.
- **n8n workflows would 401 (P1):** both HTTP nodes now send the `x-api-key` header (`{{$env.TCC_API_KEY}}`).
- **n8n consent bypass (P1):** workflow-2 no longer hardcodes `consent_ref` — it maps real per-lead consent and only proceeds when both phone **and** consent are present.
- **Secrets baked into image (P1):** added `.dockerignore` (excludes `.env`, `data/*.json`, `node_modules`, `.git`).

### Fixed — correctness / robustness
- Zoho endpoint bumped **v3 → v8** (`/crm/v8/Leads/upsert`).
- Billing month is now computed in **IST** (aligns with GST periods).
- `x-api-key` guard **fails closed** in `NODE_ENV=production` if unset (was fail-open); loud boot warnings for missing secrets.
- Robust name extraction from Bolna's nested `extracted_data` (`pickName`).
- Outbound `to_number` validated (E.164); malformed JSON bodies handled; Bolna calls get a 20s timeout.
- Graceful shutdown on SIGTERM/SIGINT; `Dockerfile` uses `npm ci`.
- Aligned billing-dashboard sample clients with `clients.sample.json`.

### Added — tests
- `npm test` — `node:test` unit suite (idempotency, invoice math, compliance gates, opt-out detection).
- Smoke test now isolates its data dir and asserts token auth + idempotency + `telephony_data` mapping.

## v1.0.0
Initial build: middleware, 7 agents, n8n workflows, billing dashboard, docs.
