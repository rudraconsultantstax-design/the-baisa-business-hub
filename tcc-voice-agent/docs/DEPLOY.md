# Deploy Guide — TCC Voice Agent

This runs the middleware next to your existing self-hosted n8n. Two ways: **Docker (recommended)** or **PM2**.

## 0. Prerequisites (one-time)
- A server you control (your Hostinger box that already runs n8n is perfect).
- A domain/subdomain for HTTPS webhooks, e.g. `voice.theconsultingcrew.in` → point it at the server.
- Accounts: **Bolna** (agent brain), **Sarvam** (Hindi voice — add the key inside Bolna's Providers vault, BYOK), **Exotel or Plivo** (Indian +91 number), Zoho CRM, Interakt.
- **DLT Principal-Entity registration** started (needed before any real outbound campaign — see COMPLIANCE.md).

## 1. Configure
```bash
cp .env.example .env
# edit .env — set INTERNAL_API_KEY, BOLNA_WEBHOOK_TOKEN, Bolna/Zoho/Interakt keys, BOLNA_FROM_NUMBER, PUBLIC_BASE_URL
# keep DRY_RUN=true until you've created agents and tested; then set DRY_RUN=false
```

## 2. Create the Bolna agents
```bash
npm install
npm run create-agents      # creates all 7 agents, writes src/config/agent-ids.json
```
Then in the Bolna dashboard, attach your +91 number to the **receptionist** agent for inbound. `create-agents` bakes `BOLNA_WEBHOOK_TOKEN` into each agent's webhook URL, so set it in `.env` **before** running this step.

## 3a. Run with Docker (recommended)
```bash
docker compose up -d --build
docker compose logs -f
```
Connect n8n so it can call this by hostname: add `networks: [tcc-net]` to your n8n compose service and `networks: { tcc-net: { external: true } }` at the file bottom, then `docker compose up -d` n8n. n8n now reaches the middleware at `http://tcc-voice-backend:3000`.

## 3b. Or run with PM2
```bash
npm install
npm i -g pm2
pm2 start src/server.js --name tcc-voice
pm2 save && pm2 startup
```

## 4. HTTPS (Bolna webhooks need a public https URL)
Put Caddy or nginx in front. Caddy example (`/etc/caddy/Caddyfile`):
```
voice.theconsultingcrew.in {
    reverse_proxy localhost:3000
}
```
Now your webhook base is `https://voice.theconsultingcrew.in`. The create-agents script already sets each agent's `webhook_url` to `.../webhooks/bolna?client_id=tcc&agent=<key>` using `PUBLIC_BASE_URL`.
Optional hardening: allowlist Bolna's source IP `13.203.39.153` at the proxy.

## 5. Import n8n workflows
In n8n → Import from File → import both files in `/n8n`. In n8n set two env vars: **`TCC_API_KEY`** = your `INTERNAL_API_KEY` (the workflows send it as the `x-api-key` header) and **`TCC_DUE_LIST_URL`** (Zoho COQL / Google Sheet returning due clients) for workflow 1. Point your website form / Zoho "lead created" automation at workflow 2's webhook — it now requires each lead to carry a `consent_ref` before a promotional call fires.

## 6. Go-live test
```bash
npm run smoke              # dry-run end-to-end (routing, compliance, billing)
# then with DRY_RUN=false, place a real test call to your own mobile:
curl -X POST https://voice.theconsultingcrew.in/calls/outbound \
  -H "x-api-key: $INTERNAL_API_KEY" -H "content-type: application/json" \
  -d '{"client_id":"tcc","agent":"gst_reminder","to_number":"+91YOURMOBILE","variables":{"customer_name":"Test","return_type":"GSTR-3B","due_date":"20 Aug"}}'
```

## 7. Monthly billing
```bash
npm run invoices 2026-07   # prints table + writes data/invoices-2026-07.{json,csv}
```
Or open the **billing dashboard** HTML for the visual cockpit + printable GST invoices.

## Endpoints
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /health | – | status |
| POST | /webhooks/bolna | token (`?token=`) + IP allowlist | Bolna call-completed → Zoho + WhatsApp + billing (idempotent) |
| POST | /calls/outbound | x-api-key | trigger an outbound call (compliance-gated) |
| POST | /optout | x-api-key | add a number to suppression |
| GET | /billing/:clientId?month= | x-api-key | one client invoice |
| GET | /billing?month= | x-api-key | portfolio + all invoices |
