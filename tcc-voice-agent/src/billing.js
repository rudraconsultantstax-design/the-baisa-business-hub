// Usage capture + per-client invoice computation. Mirrors the billing dashboard math.
import { append, readJSON } from './store.js';
import { TIERS, GST_RATE, COGS_PER_MIN, tierFor } from './config/tiers.js';
import { getClient } from './config/loaders.js';

// month key like "2026-07" — computed in IST so it aligns with Indian GST periods.
export function monthKey(d = new Date()) {
  const ist = new Date(d.getTime() + d.getTimezoneOffset() * 60000 + 5.5 * 3600000);
  return `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, '0')}`;
}

// Record one completed call's usage against a reseller client.
export function recordUsage({ clientId, executionId, seconds = 0, direction = 'outbound', agentKey = '', costEstimate = null }) {
  // Idempotency: Bolna can retry a webhook. Never double-count the same execution.
  if (executionId && executionId !== 'unknown') {
    const existing = readJSON('usage', []);
    if (existing.some((r) => r.executionId === executionId)) return { duplicate: true, executionId };
  }
  return append('usage', {
    clientId: clientId || 'tcc',
    executionId,
    seconds: Math.max(0, Math.round(seconds)),
    minutes: +(Math.max(0, seconds) / 60).toFixed(2),
    calls: 1,
    direction,
    agentKey,
    costEstimate,
    month: monthKey(),
    at: new Date().toISOString(),
  });
}

export function aggregate(clientId, month = monthKey()) {
  const rows = readJSON('usage', []).filter((r) => r.clientId === clientId && r.month === month);
  const seconds = rows.reduce((s, r) => s + (r.seconds || 0), 0);
  return { clientId, month, calls: rows.length, seconds, minutes: +(seconds / 60).toFixed(2) };
}

// Full GST invoice for a client for a month.
export function computeInvoice(clientId, month = monthKey()) {
  const client = getClient(clientId);
  if (!client) return { error: `unknown client ${clientId}` };
  const tier = tierFor(client.tier) || TIERS.reception;
  const usage = aggregate(clientId, month);

  const minutes = usage.minutes;
  const included = tier.includedMinutes;
  const overageMin = Math.max(0, minutes - included);
  const overageRate = client.overageOverride ?? tier.overagePerMin;
  const baseFee = client.monthlyOverride ?? tier.monthly;
  const overageFee = Math.round(overageMin * overageRate);
  const setupFee = client.setupBilledMonth === month ? tier.setup : 0;

  const subtotal = baseFee + overageFee + setupFee;
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;

  const cost = +(minutes * COGS_PER_MIN).toFixed(2);
  const revenueExGst = baseFee + overageFee; // recurring service revenue (setup treated as pass-through)
  const profit = +(revenueExGst - cost).toFixed(2);
  const marginPct = revenueExGst > 0 ? +((profit / revenueExGst) * 100).toFixed(1) : 0;

  return {
    clientId, client: client.name, tier: tier.name, month,
    minutes, includedMinutes: included, overageMinutes: +overageMin.toFixed(2), overageRate,
    lineItems: {
      base: baseFee,
      overage: overageFee,
      setup: setupFee,
    },
    subtotal, gstRate: GST_RATE, gst,
    cgst: Math.round(gst / 2), sgst: Math.round(gst / 2), // intra-state Rajasthan
    total,
    economics: { cogsPerMin: COGS_PER_MIN, cost, profit, marginPct, lowMargin: marginPct < 40 },
  };
}
