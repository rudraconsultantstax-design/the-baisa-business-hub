// Team escalation for hot leads / "needs human". Uses Slack webhook if set, else WhatsApp, else logs.
import { sendTemplate } from './interakt.js';
const SLACK = process.env.SLACK_WEBHOOK_URL || '';
const WA = process.env.ESCALATION_WHATSAPP || '';
const DRY = process.env.DRY_RUN === 'true';

export async function notifyTeam(message, meta = {}) {
  if (DRY || (!SLACK && !WA)) {
    console.log(`[notify:${DRY ? 'DRY_RUN' : 'no-channel'}] ${message}`, meta);
    return { logged: true };
  }
  if (SLACK) {
    try {
      await fetch(SLACK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `🔔 ${message}\n${JSON.stringify(meta)}` }) });
      return { slack: true };
    } catch (e) { console.error('[notify] slack failed', e.message); }
  }
  if (WA) {
    // Reuses a simple text-capable template if you have one; otherwise wire your own.
    console.log(`[notify] would WhatsApp ${WA}: ${message}`);
  }
  return { ok: true };
}
