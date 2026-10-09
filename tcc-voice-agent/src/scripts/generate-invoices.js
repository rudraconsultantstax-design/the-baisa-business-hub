// Generate monthly GST invoices for all reseller clients.
//   npm run invoices            (current month)
//   npm run invoices 2026-07
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getClients } from '../config/loaders.js';
import { computeInvoice, monthKey } from '../billing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const month = process.argv[2] || monthKey();
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const clients = getClients().filter((c) => !c.internal);
const invoices = clients.map((c) => computeInvoice(c.id, month));

console.log(`\n=== TCC AI Voice — Invoices for ${month} ===\n`);
let mrr = 0, profit = 0, minutes = 0;
for (const i of invoices) {
  if (i.error) { console.log(`  ! ${i.error}`); continue; }
  mrr += i.lineItems.base; profit += i.economics.profit; minutes += i.minutes;
  const flag = i.economics.lowMargin ? '  ⚠ LOW MARGIN' : '';
  console.log(`  ${i.client.padEnd(26)} ${i.tier.padEnd(10)} ${String(i.minutes).padStart(7)}min  bill ${inr(i.total).padEnd(10)} margin ${i.economics.marginPct}%${flag}`);
}
console.log(`\n  Portfolio: ${invoices.length} clients · MRR ${inr(mrr)} · minutes ${minutes} · monthly profit ${inr(profit)} · projected annual ${inr(mrr * 12)}\n`);

// Write JSON + CSV artifacts
const outJson = path.join(__dirname, '..', '..', 'data', `invoices-${month}.json`);
fs.writeFileSync(outJson, JSON.stringify({ month, invoices, totals: { mrr, profit, minutes } }, null, 2));

const rows = [['client', 'tier', 'month', 'minutes', 'base', 'overage', 'setup', 'subtotal', 'gst', 'total', 'cost', 'profit', 'margin_pct']];
for (const i of invoices) if (!i.error) rows.push([i.client, i.tier, i.month, i.minutes, i.lineItems.base, i.lineItems.overage, i.lineItems.setup, i.subtotal, i.gst, i.total, i.economics.cost, i.economics.profit, i.economics.marginPct]);
const outCsv = path.join(__dirname, '..', '..', 'data', `invoices-${month}.csv`);
fs.writeFileSync(outCsv, rows.map((r) => r.join(',')).join('\n'));
console.log(`Wrote ${outJson}\nWrote ${outCsv}\n`);
