# TCC Voice Agent — production middleware + reseller toolkit

The code that turns the [AI Voice Agent Blueprint](../) into a running, money-making service for **The Consulting Crew**. It sits between **Bolna** (the AI voice brain, Hindi via **Sarvam**), your **Indian carrier** (Exotel/Plivo), and your **Zoho + n8n + Interakt** stack — with TRAI/DPDP compliance and per-client billing built in.

```
   Caller ⇄ +91 line (Exotel/Plivo)
                 │
             Bolna agent  ── Sarvam Hindi voice + LLM
                 │  (webhook on call end)
                 ▼
      ┌──────────────────────────┐      ┌──────────────┐
      │  THIS MIDDLEWARE         │────▶ │ Zoho CRM      │  (lead upsert, score, log)
      │  webhook router          │────▶ │ Interakt WA   │  (follow-up template)
      │  compliance guardrails   │────▶ │ Team alert    │  (hot / needs-human)
      │  usage → billing         │      └──────────────┘
      └──────────────────────────┘
                 ▲
        n8n triggers (scheduled reminders, new-lead → call) → POST /calls/outbound
```

## Why these tools (developer + businessman)
- **Bolna** — India-native, cheapest (~₹5–6/min or self-host), inbound+outbound+campaigns, native Sarvam Hindi, Exotel/Plivo built in, agency sub-accounts for reselling.
- **Sarvam** — best Hindi/Hinglish (telephony-tuned), sovereign/DPDP-friendly, plugged in via Bolna BYOK (your key, lower cost).
- **Exotel/Plivo** — legal Indian +91 calling (Twilio can't do Indian mobiles). Plivo ₹0.60/min = cheapest; Exotel = Zoho-native + DLT hand-holding.
- **Node/Express** — tiny, runs next to your n8n; **n8n** stays your no-code trigger layer; **Zoho + Interakt** you already own.
- **Billing dashboard** — the profit cockpit (per-client GST invoices, portfolio margin).

## Quick start (dry-run, no keys needed)
```bash
npm install
npm test             # unit tests: idempotency, invoice math, compliance gates
npm run smoke        # end-to-end: token auth + idempotency + compliance + billing
npm run invoices     # generate monthly invoices (table + JSON + CSV)
```
Then follow **docs/DEPLOY.md** to go live.

## The 7 agents (`src/agents/agents.js`)
`receptionist` (inbound) · `payment_reminder` · `gst_reminder` · `appointment` · `feedback` (service) · `lead_qualify` · `reactivation` (promotional). Prompts in English, Hinglish welcome lines.

## What's enforced for you (see docs/COMPLIANCE.md)
9am–9pm IST window · opt-out → 90-day suppression · consent gate on promotional calls · AI + recording disclosure · consent log. **You** still do DLT registration, 140-series, and NCPR scrub.

## Map
```
src/server.js            HTTP API + Bolna webhook router
src/compliance.js        window / suppression / consent gates
src/billing.js           usage capture + GST invoice math
src/integrations/        bolna, zoho, interakt, notify (all DRY_RUN-aware)
src/agents/agents.js     the 7 agent prompts (your IP)
src/config/              tiers, clients, agent-ids
src/scripts/             create-bolna-agents, generate-invoices
n8n/                     2 importable trigger workflows
dashboard/               billing/profit cockpit (open in a browser)
db/schema.sql            Postgres/Supabase schema for scale
docs/                    DEPLOY, COMPLIANCE, CLIENT-ONBOARDING
test/                    node:test unit suite + smoke test
CHANGELOG.md             v1.1 audit fixes
.github/workflows/ci.yml CI: npm test + smoke on every push
```

## Money model
COGS ~₹5–6/min → sell tiers ₹6k/₹16k/₹40k + setup → **50–70% margin that widens per client**. One Growth client ≈ ₹2.2L/yr billings (~58% gross); ten ≈ ₹13L/yr gross on one platform. Full maths in the Blueprint + dashboard.

---
*The Consulting Crew · Run your business. Not your compliance.*
