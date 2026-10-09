// Reseller pricing tiers — MUST stay in sync with the billing dashboard.
// All amounts in INR.
export const TIERS = {
  reception: { key: 'reception', name: 'Reception', monthly: 6000,  includedMinutes: 500,  overagePerMin: 15, setup: 15000 },
  growth:    { key: 'growth',    name: 'Growth',    monthly: 16000, includedMinutes: 1500, overagePerMin: 12, setup: 30000 },
  scale:     { key: 'scale',     name: 'Scale',     monthly: 40000, includedMinutes: 4000, overagePerMin: 10, setup: 60000 },
};

export const GST_RATE = 0.18;              // 18% GST on the reseller invoice
export const COGS_PER_MIN = Number(process.env.COGS_PER_MIN || 5.5); // your platform cost/min

export function tierFor(key) {
  return TIERS[String(key || '').toLowerCase()] || null;
}
