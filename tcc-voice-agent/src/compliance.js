// TRAI / DPDP compliance guardrails — enforced in code so neither you nor a client
// can accidentally break the law. See docs/COMPLIANCE.md for the legal mapping.
import { readJSON, writeJSON, append } from './store.js';

const WINDOW_START = Number(process.env.CALL_WINDOW_START || 9);   // 9am IST
const WINDOW_END   = Number(process.env.CALL_WINDOW_END   || 21);  // 9pm IST
const SUPPRESSION_DAYS = Number(process.env.OPTOUT_SUPPRESSION_DAYS || 90);

// Current hour in IST (UTC+5:30) regardless of server timezone.
export function istNow(now = new Date()) {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + 5.5 * 3600000);
}

export function isWithinCallingWindow(now = new Date()) {
  const h = istNow(now).getHours();
  return h >= WINDOW_START && h < WINDOW_END;
}

// ---- Opt-out / DND suppression list ----
function normalize(num) { return String(num || '').replace(/[^\d+]/g, ''); }

export function isSuppressed(num) {
  const list = readJSON('suppression', {});
  const rec = list[normalize(num)];
  if (!rec) return false;
  if (rec.until && new Date(rec.until) < new Date()) return false; // expired
  return true;
}

export function addSuppression(num, reason = 'opt_out') {
  const list = readJSON('suppression', {});
  const until = new Date(Date.now() + SUPPRESSION_DAYS * 86400000).toISOString();
  list[normalize(num)] = { reason, since: new Date().toISOString(), until };
  writeJSON('suppression', list);
  return list[normalize(num)];
}

// Detect an opt-out from Bolna's extracted data or the transcript.
const OPTOUT_RE = /(do ?not ?call|opt[\s-]?out|unsubscribe|stop calling|mat karo|band kar|मत करो|कॉल मत|बंद कर)/i;
export function detectOptOut({ transcript = '', extracted = {} } = {}) {
  const flat = JSON.stringify(extracted || {}).toLowerCase();
  if (flat.includes('"opt_out":true') || flat.includes('opt out') || flat.includes('do not call')) return true;
  return OPTOUT_RE.test(transcript || '');
}

// ---- Consent log (DPDP: explicit, timestamped, revocable) ----
export function logConsent({ number, purpose, source, ref }) {
  return append('consent', {
    number: normalize(number), purpose, source, ref,
    at: new Date().toISOString(),
  });
}
export function hasConsent(num) {
  const log = readJSON('consent', []);
  return log.some((c) => c.number === normalize(num));
}

// Categories that legally REQUIRE prior consent + DND scrub (promotional).
export const PROMOTIONAL = new Set(['lead_qualify', 'reactivation']);

// Gate an outbound call. Returns { ok:true } or { ok:false, code, reason }.
export function screenOutbound({ agentKey, toNumber, consentRef, checkDnd = true }) {
  if (!isWithinCallingWindow()) {
    return { ok: false, code: 'OUTSIDE_WINDOW', reason: `Outside TRAI calling window (${WINDOW_START}:00-${WINDOW_END}:00 IST).` };
  }
  if (isSuppressed(toNumber)) {
    return { ok: false, code: 'SUPPRESSED', reason: 'Number is on the opt-out/DND suppression list.' };
  }
  if (PROMOTIONAL.has(agentKey)) {
    if (!consentRef && !hasConsent(toNumber)) {
      return { ok: false, code: 'NO_CONSENT', reason: 'Promotional call needs a consent reference or logged consent (TRAI + DPDP).' };
    }
    // A real DND/NCPR scrub against the operator list would run here for promotional calls.
    if (checkDnd) { /* integrate NCPR/DLT scrub API before go-live */ }
  }
  return { ok: true };
}
