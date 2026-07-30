// Interakt (WhatsApp) — send an approved template message after a call.
const BASE = process.env.INTERAKT_BASE_URL || 'https://api.interakt.ai';
const KEY = process.env.INTERAKT_API_KEY || '';
const DRY = process.env.DRY_RUN === 'true' || !KEY;

// phone in E.164 (e.g. +919812300011). templateName = approved Interakt template.
export async function sendTemplate({ phone, templateName, bodyValues = [], languageCode = 'en' }) {
  if (!templateName) return { skipped: 'no template configured' };
  if (DRY) {
    console.log(`[interakt:DRY_RUN] template "${templateName}" -> ${phone}`, bodyValues);
    return { dry_run: true, result: true };
  }
  const digits = String(phone).replace(/^\+/, '');
  const countryCode = '+' + digits.slice(0, 2);
  const number = digits.slice(2);
  const res = await fetch(`${BASE}/v1/public/message/`, {
    method: 'POST',
    headers: { Authorization: `Basic ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countryCode, phoneNumber: number, fullPhoneNumber: '+' + digits,
      type: 'Template',
      template: { name: templateName, languageCode, bodyValues },
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Interakt error ${res.status}: ${JSON.stringify(j).slice(0, 200)}`);
  return j;
}

export const isDryRun = DRY;
