// Unit tests — run with: npm test   (sets an isolated DATA_DIR + open calling window)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as billing from '../src/billing.js';
import * as compliance from '../src/compliance.js';

const M = billing.monthKey();

test('recordUsage is idempotent by executionId (no double-billing on retry)', () => {
  billing.recordUsage({ clientId: 'tcc', executionId: 'dup1', seconds: 600 });
  const second = billing.recordUsage({ clientId: 'tcc', executionId: 'dup1', seconds: 600 });
  assert.equal(second.duplicate, true);
  assert.equal(billing.aggregate('tcc', M).minutes, 10); // counted once, not 20
});

test('growth invoice: base only when under included minutes, +18% GST', () => {
  billing.recordUsage({ clientId: 'manglam-realtors', executionId: 'u-mg-1', seconds: 6000 }); // 100 min
  const inv = billing.computeInvoice('manglam-realtors', M);
  assert.equal(inv.lineItems.base, 16000);
  assert.equal(inv.lineItems.overage, 0);
  assert.equal(inv.total, 18880);
});

test('scale invoice: overage honours per-client override (₹8/min)', () => {
  billing.recordUsage({ clientId: 'marudhar-finance', executionId: 'u-mf-1', seconds: 246000 }); // 4100 min
  const inv = billing.computeInvoice('marudhar-finance', M);
  assert.equal(inv.overageMinutes, 100);
  assert.equal(inv.lineItems.overage, 800); // 100 * 8
});

test('compliance blocks promotional without consent, allows with consent', () => {
  const blocked = compliance.screenOutbound({ agentKey: 'lead_qualify', toNumber: '+919800000001' });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.code, 'NO_CONSENT');
  const ok = compliance.screenOutbound({ agentKey: 'lead_qualify', toNumber: '+919800000001', consentRef: 'ref1' });
  assert.equal(ok.ok, true);
});

test('compliance blocks suppressed numbers', () => {
  compliance.addSuppression('+919800000002', 'test');
  const r = compliance.screenOutbound({ agentKey: 'gst_reminder', toNumber: '+919800000002' });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'SUPPRESSED');
});

test('service agent passes when in window and not suppressed', () => {
  const r = compliance.screenOutbound({ agentKey: 'gst_reminder', toNumber: '+919800000003' });
  assert.equal(r.ok, true);
});

test('opt-out is detected from a Hinglish transcript', () => {
  assert.equal(compliance.detectOptOut({ transcript: 'mujhe call mat karo, band karo' }), true);
  assert.equal(compliance.detectOptOut({ transcript: 'haan GST karwana hai' }), false);
});
