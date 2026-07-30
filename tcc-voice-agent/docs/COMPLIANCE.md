# Compliance — TRAI / DLT / DPDP (what the code enforces vs what you must do)

India regulates an AI voice bot **exactly like a human telemarketer** (TRAI TCCCPR 2018, tightened Feb 2025; DLT now covers voice since Oct 2024). This is operational guidance, not legal advice — confirm 140/1600 eligibility with your telecom operator before promotional calling.

## What this software enforces automatically
- **9am–9pm IST calling window** (`CALL_WINDOW_START/END`) — outbound blocked outside it.
- **Opt-out / DND suppression** — a number that opts out (spoken/keypress detected from transcript/extracted data, or via `POST /optout`) is suppressed for **90 days** and cannot be called again.
- **Consent gate for promotional agents** (`lead_qualify`, `reactivation`) — the call is blocked unless a `consent_ref` is supplied or consent is already logged.
- **AI + recording disclosure** — built into every agent's opening line (`agent_welcome_message`).
- **Consent log** — every promotional call's consent is timestamped and stored.

## What YOU must do (cannot be done in code)
1. **Register as a DLT Principal Entity** (Airtel/Jio/Vi portal): PAN, GST, CIN/Udyam, authorised-signatory biometric. ~₹5,900 one-time, 5–10 working days.
2. **Use a 140-series number** for promotional outbound (lead_qualify / reactivation). TCC is not BFSI, so **1600-series is likely unavailable** — do not assume a "service" exemption for cold outreach.
3. **Register call-script templates** on DLT (voice template registration is increasingly enforced post-Oct-2024).
4. **NCPR/DND scrub** promotional lists before every campaign (wire your operator's scrub API into `compliance.screenOutbound`'s marked hook).
5. **DPDP hygiene** — privacy notice, keep data in India, ~90-day recording retention, grievance officer, honour erasure.

## Safe vs careful by agent
| Agent | Class | Consent/DND needed |
|---|---|---|
| receptionist | inbound | No (customer called you) |
| payment_reminder, gst_reminder, appointment, feedback | **service** (existing clients) | No DND scrub if genuinely service — never bolt on a sales pitch |
| lead_qualify, reactivation | **promotional** | **Yes** — consent + DND + 140-series (code blocks without consent) |

## When you RESELL to clients
- **Each client is their own DLT Principal Entity** with their own consent capture — you cannot legally share your registration for their campaigns.
- Contractually push TRAI + DPDP duties to the client (see CLIENT-ONBOARDING.md). Sign a **Data Processing Agreement**: client = Data Fiduciary, TCC = Processor.
- Keep per-client audit trails (consent logs, suppression, call logs). This software already segments usage/consent by number and client.

## Coming (build as if it's already law)
Draft TRAI Third Amendment (Mar 2026): explicit automated-call (A2P) regime + likely **mandatory AI-disclosure**. You already disclose — keep it.
