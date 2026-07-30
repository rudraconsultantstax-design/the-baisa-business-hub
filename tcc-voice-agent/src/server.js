import 'dotenv/config';
import express from 'express';
import { AGENTS } from './agents/agents.js';
import { getAgentId, getAgentKeyById, getClients } from './config/loaders.js';
import * as store from './store.js';
import * as compliance from './compliance.js';
import * as billing from './billing.js';
import * as bolna from './integrations/bolna.js';
import * as zoho from './integrations/zoho.js';
import { sendTemplate } from './integrations/interakt.js';
import { notifyTeam } from './integrations/notify.js';

const app = express();
app.use(express.json({ limit: '2mb' }));
// Malformed JSON -> ack 200 so Bolna doesn't hammer retries (and log it).
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') { console.error('[json] bad body on', req.path); return res.status(200).json({ ok: false, error: 'invalid json' }); }
  return next(err);
});
app.use((req, _res, next) => { console.log(`[req] ${req.method} ${req.path}`); next(); });

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.INTERNAL_API_KEY || '';
const WEBHOOK_TOKEN = process.env.BOLNA_WEBHOOK_TOKEN || '';
const FROM = process.env.BOLNA_FROM_NUMBER || '';
const PROD = process.env.NODE_ENV === 'production';

if (PROD && !API_KEY) console.warn('⚠️  INTERNAL_API_KEY not set in production — protected routes will refuse requests.');
if (PROD && !WEBHOOK_TOKEN) console.warn('⚠️  BOLNA_WEBHOOK_TOKEN not set — the Bolna webhook is unauthenticated.');

// ---- helpers ----
const tpl = (envName) => (envName ? process.env[envName] : null);

function requireKey(req, res, next) {
  if (!API_KEY) {
    if (PROD) return res.status(503).json({ ok: false, error: 'server missing INTERNAL_API_KEY' }); // fail-closed in prod
    return next(); // dev convenience only
  }
  if (req.header('x-api-key') === API_KEY) return next();
  return res.status(401).json({ ok: false, error: 'invalid x-api-key' });
}

// Bolna's extracted_data nests as Category -> Name -> { ... }. Dig out a human name; else fall back.
function pickName(extracted, fallback) {
  if (extracted && typeof extracted === 'object') {
    if (typeof extracted.name === 'string' && extracted.name.trim()) return extracted.name.trim();
    for (const v of Object.values(extracted)) {
      if (v && typeof v === 'object') {
        if (typeof v.name === 'string' && v.name.trim()) return v.name.trim();
        for (const inner of Object.values(v)) {
          if (inner && typeof inner === 'object' && typeof inner.name === 'string' && inner.name.trim()) return inner.name.trim();
        }
      }
    }
  }
  return fallback;
}

function scoreFromSignals(text) {
  const t = (text || '').toLowerCase();
  if (/(notice|scn|urgent|deadline|aaj|today|ready now|abhi)/.test(t)) return 80;
  if (/(interested|chahiye|baad me|later|next week|call me)/.test(t)) return 55;
  return 45;
}
const needsHuman = (text) => /(human|manager|baat karni|dispute|galat|angry|naraz|complain)/i.test(text || '');

// ---- health ----
app.get('/health', (_req, res) => res.json({
  ok: true, service: 'tcc-voice-agent', version: '1.1.0', dryRun: bolna.isDryRun,
  agents: Object.keys(AGENTS), time: new Date().toISOString(),
}));

// ---- Bolna call-completed webhook ----
// URL: {PUBLIC_BASE_URL}/webhooks/bolna?client_id=tcc&agent=receptionist&token=SECRET
app.post('/webhooks/bolna', async (req, res) => {
  try {
    if (WEBHOOK_TOKEN && req.query.token !== WEBHOOK_TOKEN) return res.status(401).json({ ok: false, error: 'bad token' });

    const b = req.body || {};
    const status = b.status || 'unknown';
    const executionId = b.id || b.execution_id || 'unknown';
    if (status !== 'completed') return res.json({ ok: true, ignored: status });

    const agentKey = req.query.agent || getAgentKeyById(b.agent_id) || 'receptionist';
    const clientId = req.query.client_id || 'tcc';
    const agent = AGENTS[agentKey] || AGENTS.receptionist;

    const td = b.telephony_data || {};
    const isInbound = agent.category === 'inbound' || td.call_type === 'inbound' || td.call_type === 'incoming';
    const direction = isInbound ? 'inbound' : 'outbound';
    const seconds = b.conversation_duration || td.duration || 0;
    // Bolna carries the customer number in telephony_data: from_number (inbound) / to_number (outbound).
    const customer = (isInbound ? td.from_number : td.to_number) || td.from_number || td.to_number || b.user_number || '';
    const recordingUrl = td.recording_url || null;
    const transcript = b.transcript || '';
    const extractedStr = JSON.stringify(b.extracted_data || {}) + ' ' + transcript;

    // 1) Usage — idempotent (Bolna may retry)
    const usage = billing.recordUsage({ clientId, executionId, seconds, direction, agentKey, costEstimate: b.total_cost ?? null });
    if (usage.duplicate) return res.json({ ok: true, duplicate: true, executionId });

    // 2) Persist the full call log (audit trail for DPDP / disputes)
    store.append('call_logs', {
      executionId, clientId, agentKey, direction, customer, seconds, recordingUrl,
      transcript, extracted: b.extracted_data || null, totalCost: b.total_cost ?? null,
      at: new Date().toISOString(),
    });

    // 3) Opt-out (DPDP/TRAI): suppress and stop
    if (compliance.detectOptOut({ transcript, extracted: b.extracted_data })) {
      if (customer) compliance.addSuppression(customer, 'opt_out_on_call');
      await notifyTeam(`Opt-out captured from ${customer || 'unknown number'}`, { executionId });
      return res.json({ ok: true, optOut: true, suppressed: !!customer });
    }

    const results = { billed: true, customerCaptured: !!customer };
    const name = pickName(b.extracted_data, customer);

    // 4) Lead capture (receptionist / lead_qualify / reactivation)
    if (agent.createsLead && customer) {
      const score = scoreFromSignals(extractedStr);
      try {
        const lead = await zoho.upsertLead({ name, phone: customer, intent: agentKey, source: `AI Voice (${agentKey})`, score, transcript, recordingUrl });
        results.lead = lead.id; results.score = score;
      } catch (e) { console.error('[webhook] zoho failed', e.message); results.leadError = e.message; }
    }

    // 5) WhatsApp follow-up
    const template = tpl(agent.whatsappTemplateEnv);
    if (template && customer) {
      try { await sendTemplate({ phone: customer, templateName: template, bodyValues: [name || 'ji'] }); results.whatsapp = template; }
      catch (e) { console.error('[webhook] interakt failed', e.message); results.whatsappError = e.message; }
    }

    // 6) Escalate hot / needs-human
    if (needsHuman(extractedStr) || (results.score ?? 0) >= 70) {
      await notifyTeam(`Callback needed: ${customer} (${agentKey}, score ${results.score ?? '-'})`, { executionId, recordingUrl });
      results.escalated = true;
    }

    return res.json({ ok: true, executionId, agentKey, clientId, ...results });
  } catch (e) {
    console.error('[webhook] error', e);
    return res.status(200).json({ ok: false, error: e.message }); // 200 so Bolna doesn't hammer retries
  }
});

// ---- Outbound call trigger (called by n8n / your app) ----
app.post('/calls/outbound', requireKey, async (req, res) => {
  const { client_id = 'tcc', agent, to_number, variables = {}, consent_ref, check_dnd = true } = req.body || {};
  if (!agent || !AGENTS[agent]) return res.status(400).json({ ok: false, error: `unknown agent "${agent}"`, valid: Object.keys(AGENTS) });
  if (!to_number || !/^\+?\d{7,15}$/.test(String(to_number))) return res.status(400).json({ ok: false, error: 'valid to_number required (E.164)' });

  const screen = compliance.screenOutbound({ agentKey: agent, toNumber: to_number, consentRef: consent_ref, checkDnd: check_dnd });
  if (!screen.ok) return res.json({ ok: false, blocked: true, code: screen.code, reason: screen.reason });

  if (consent_ref) compliance.logConsent({ number: to_number, purpose: agent, source: 'outbound_api', ref: consent_ref });

  const agentId = getAgentId(agent);
  if (!agentId && !bolna.isDryRun) return res.status(409).json({ ok: false, error: `Bolna agent "${agent}" not created yet — run npm run create-agents` });

  try {
    const r = await bolna.makeOutboundCall({ agentId: agentId || `dry-${agent}`, toNumber: to_number, fromNumber: FROM, userData: variables });
    return res.json({ ok: true, execution_id: r.execution_id, status: r.status, agent, client_id });
  } catch (e) {
    console.error('[outbound] error', e.message);
    return res.status(502).json({ ok: false, error: e.message });
  }
});

// ---- Manual opt-out ----
app.post('/optout', requireKey, (req, res) => {
  const { number, reason = 'manual' } = req.body || {};
  if (!number) return res.status(400).json({ ok: false, error: 'number required' });
  res.json({ ok: true, suppressed: compliance.addSuppression(number, reason) });
});

// ---- Billing ----
app.get('/billing/:clientId', requireKey, (req, res) => {
  res.json(billing.computeInvoice(req.params.clientId, req.query.month));
});
app.get('/billing', requireKey, (req, res) => {
  const month = req.query.month;
  const invoices = getClients().filter((c) => !c.internal).map((c) => billing.computeInvoice(c.id, month));
  const mrr = invoices.reduce((s, i) => s + (i.lineItems?.base || 0), 0);
  const profit = invoices.reduce((s, i) => s + (i.economics?.profit || 0), 0);
  res.json({ month: month || billing.monthKey(), clients: invoices.length, mrr, monthlyProfit: profit, invoices });
});

const server = app.listen(PORT, () => {
  console.log(`\n🚀 TCC Voice Agent middleware v1.1 on :${PORT}  (DRY_RUN=${bolna.isDryRun})`);
  console.log(`   Webhook:  POST /webhooks/bolna?client_id=tcc&agent=receptionist&token=…`);
  console.log(`   Outbound: POST /calls/outbound   Billing: GET /billing\n`);
});

// Graceful shutdown (Docker/PM2 send SIGTERM)
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => { console.log(`\n${sig} received — shutting down`); server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 5000).unref(); });
}

export default app;
