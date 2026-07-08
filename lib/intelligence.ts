// The "intelligence" layer — turns raw registers into decisions.
// Pure functions over collection arrays; consumed by the dashboard, the
// /insights page and the /api/insights + /api/brief endpoints.

import { skuMargin } from "./pricing";

export type Severity = "critical" | "warning" | "info" | "good";

export interface Insight {
  id: string;
  severity: Severity;
  area: string;
  title: string;
  detail: string;
  action: string;
  value?: string;
}

interface Collections {
  skus: any[];
  inventory: any[];
  orders: any[];
  jobwork: any[];
  wages: any[];
  production: any[];
  expenses: any[];
  purchases: any[];
  cutting: any[];
  dispatch: any[];
  customers: any[];
}

export function num(n: any): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

// ---- Headline KPIs ----
export function computeKpis(c: Collections) {
  const revenue = c.orders.reduce((a, o) => a + num(o.total), 0);
  const cogs = c.orders.reduce(
    (a, o) =>
      a +
      (o.items || []).reduce((s: number, l: any) => {
        const sku = c.skus.find((k) => k.code === l.skuCode);
        return s + (sku ? num(sku.cogm) * num(l.qty) : 0);
      }, 0),
    0
  );
  const opex = c.expenses.reduce((a, e) => a + num(e.amount), 0);
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - opex;
  const netMargin = revenue ? netProfit / revenue : 0;

  const orderCount = c.orders.length;
  const aov = orderCount ? revenue / orderCount : 0;

  // payables
  const wagesPayable = c.wages.filter((w) => !w.paid).reduce((a, w) => a + num(w.netPayable), 0);

  // job-work pending (sent - received) on issue/receipt pairs by challan
  const jobworkPending = c.jobwork.reduce((a, j) => a + Math.max(0, num(j.pcsSent) - num(j.pcsReceived)), 0);

  // inventory value at cogm
  const stockValue = c.inventory.reduce((a, i) => {
    const sku = c.skus.find((k) => k.code === i.skuCode);
    return a + (sku ? num(sku.cogm) * num(i.onHand) : 0);
  }, 0);
  const stockUnits = c.inventory.reduce((a, i) => a + num(i.onHand), 0);

  const lowStock = c.inventory.filter((i) => i.policy !== "CONTINUE" && num(i.onHand) <= num(i.reorderLevel)).length;

  const openOrders = c.orders.filter((o) => !["delivered", "cancelled", "rto"].includes(o.status)).length;
  const rto = c.dispatch.filter((d) => d.status === "RTO").length;
  const rtoPct = c.dispatch.length ? rto / c.dispatch.length : 0;

  // production efficiency (avg packed/target)
  const eff =
    c.production.length
      ? c.production.reduce((a, p) => a + (num(p.target) ? num(p.packed) / num(p.target) : 0), 0) / c.production.length
      : 0;

  return {
    revenue,
    cogs,
    opex,
    grossProfit,
    netProfit,
    netMargin,
    orderCount,
    aov,
    wagesPayable,
    jobworkPending,
    stockValue,
    stockUnits,
    lowStock,
    openOrders,
    rtoPct,
    efficiency: eff
  };
}

// ---- Reorder engine ----
export function reorderSuggestions(c: Pick<Collections, "inventory" | "skus">) {
  return c.inventory
    .filter((i) => i.policy !== "CONTINUE" && num(i.onHand) <= num(i.reorderLevel))
    .map((i) => {
      const sku = c.skus.find((k) => k.code === i.skuCode);
      const suggested = Math.max(num(i.reorderLevel) * 3 - num(i.onHand), num(i.reorderLevel) * 2);
      return {
        skuCode: i.skuCode,
        name: sku?.name || i.skuCode,
        size: i.size,
        onHand: num(i.onHand),
        reorderLevel: num(i.reorderLevel),
        suggestedQty: suggested
      };
    })
    .sort((a, b) => a.onHand - b.onHand);
}

// ---- Insights ----
export function buildInsights(c: Collections): Insight[] {
  const out: Insight[] = [];
  const k = computeKpis(c);

  // Loss-making / thin-margin SKUs at current sell price
  const thin = c.skus
    .map((s) => ({ s, m: skuMargin(num(s.sell), num(s.cogm)) }))
    .filter((x) => x.m < 0.5)
    .sort((a, b) => a.m - b.m);
  if (thin.length) {
    const worst = thin[0];
    out.push({
      id: "margin-thin",
      severity: worst.m < 0.35 ? "critical" : "warning",
      area: "Pricing",
      title: `${thin.length} SKU(s) below 50% margin`,
      detail: `Worst: ${worst.s.code} ${worst.s.name} at ${Math.round(worst.m * 100)}% margin (sell ₹${worst.s.sell}, COGM ₹${worst.s.cogm}).`,
      action: "Re-cost, lift price, cut fabric consumption, or renegotiate CMT.",
      value: `${thin.length}`
    });
  }

  // Reorder / stockouts
  const reorders = reorderSuggestions(c);
  if (reorders.length) {
    out.push({
      id: "reorder",
      severity: reorders.length > 6 ? "critical" : "warning",
      area: "Inventory",
      title: `${reorders.length} size(s) at/below reorder level`,
      detail: `Lowest: ${reorders[0].skuCode} (${reorders[0].size}) at ${reorders[0].onHand} units.`,
      action: "Raise replenishment batches for heroes; never let a hero SKU stock out.",
      value: `${reorders.length}`
    });
  }

  // Job-work pending
  if (k.jobworkPending > 0) {
    const overdue = c.jobwork.filter((j) => num(j.pcsSent) > num(j.pcsReceived) && j.dueDate && j.dueDate < new Date().toISOString().slice(0, 10));
    out.push({
      id: "jobwork",
      severity: overdue.length ? "warning" : "info",
      area: "Production",
      title: `${k.jobworkPending} pcs pending at karigars`,
      detail: overdue.length ? `${overdue.length} challan(s) past due date.` : "Open challans awaiting return.",
      action: "Reconcile open challans weekly (sent − received). Chase overdue returns.",
      value: `${k.jobworkPending}`
    });
  }

  // Wages payable
  if (k.wagesPayable > 0) {
    out.push({
      id: "wages",
      severity: k.wagesPayable > 8000 ? "warning" : "info",
      area: "Finance",
      title: `₹${Math.round(k.wagesPayable).toLocaleString("en-IN")} wages payable`,
      detail: "Unpaid piece-rate wages across workers.",
      action: "Clear quality-passed wages; rejects reworked at vendor cost.",
      value: `₹${Math.round(k.wagesPayable).toLocaleString("en-IN")}`
    });
  }

  // Cutting wastage
  const highWaste = c.cutting.filter((x) => num(x.wastagePct) > 10);
  if (highWaste.length) {
    out.push({
      id: "wastage",
      severity: "warning",
      area: "Production",
      title: `${highWaste.length} cutting batch(es) over 10% wastage`,
      detail: `Highest: ${highWaste[0].styleCode} at ${highWaste[0].wastagePct}%.`,
      action: "Improve lay/marker efficiency; target ≤ 8–10% wastage.",
      value: `${highWaste[0].wastagePct}%`
    });
  }

  // Production efficiency
  if (c.production.length && k.efficiency < 0.6) {
    out.push({
      id: "efficiency",
      severity: "warning",
      area: "Production",
      title: `Line efficiency ${Math.round(k.efficiency * 100)}% (target ≥ 60%)`,
      detail: "Packed vs target is trailing the floor benchmark.",
      action: "Find the bottleneck stage in the DPR; rebalance the line.",
      value: `${Math.round(k.efficiency * 100)}%`
    });
  }

  // RTO
  if (k.rtoPct > 0.15) {
    out.push({
      id: "rto",
      severity: "warning",
      area: "Fulfilment",
      title: `RTO at ${Math.round(k.rtoPct * 100)}% (target < 15%)`,
      detail: "Return-to-origin is eating margin and freight.",
      action: "Confirm COD on WhatsApp before dispatch; verify addresses.",
      value: `${Math.round(k.rtoPct * 100)}%`
    });
  }

  // Pending payments
  const pendingPay = c.orders.filter((o) => o.paymentStatus === "pending");
  if (pendingPay.length) {
    out.push({
      id: "payments",
      severity: "info",
      area: "Sales / CRM",
      title: `${pendingPay.length} order(s) awaiting payment`,
      detail: "Unconfirmed payment links / COD.",
      action: "Send payment link follow-up (Day 1 / 3 / 7).",
      value: `${pendingPay.length}`
    });
  }

  // Net margin health (good news)
  if (k.netMargin >= 0.3) {
    out.push({
      id: "margin-good",
      severity: "good",
      area: "Finance",
      title: `Net margin ${Math.round(k.netMargin * 100)}% — above target`,
      detail: `Revenue ₹${Math.round(k.revenue).toLocaleString("en-IN")} · net profit ₹${Math.round(k.netProfit).toLocaleString("en-IN")}.`,
      action: "Reinvest into D2C demand and hero replenishment.",
      value: `${Math.round(k.netMargin * 100)}%`
    });
  }

  const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2, good: 3 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}

// ---- Channel performance ----
export function channelSales(c: Pick<Collections, "orders" | "skus">) {
  const map = new Map<string, { channel: string; orders: number; revenue: number; cogs: number }>();
  for (const o of c.orders) {
    const row = map.get(o.channel) || { channel: o.channel, orders: 0, revenue: 0, cogs: 0 };
    row.orders += 1;
    row.revenue += num(o.total);
    row.cogs += (o.items || []).reduce((s: number, l: any) => {
      const sku = c.skus.find((k) => k.code === l.skuCode);
      return s + (sku ? num(sku.cogm) * num(l.qty) : 0);
    }, 0);
    map.set(o.channel, row);
  }
  return Array.from(map.values())
    .map((r) => ({ ...r, margin: r.revenue ? (r.revenue - r.cogs) / r.revenue : 0 }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ---- Top / bottom SKUs by units sold ----
export function skuPerformance(c: Pick<Collections, "orders" | "skus">) {
  const units = new Map<string, number>();
  const rev = new Map<string, number>();
  for (const o of c.orders) {
    for (const l of o.items || []) {
      units.set(l.skuCode, (units.get(l.skuCode) || 0) + num(l.qty));
      rev.set(l.skuCode, (rev.get(l.skuCode) || 0) + num(l.qty) * num(l.price));
    }
  }
  return c.skus
    .map((s) => ({
      code: s.code,
      name: s.name,
      units: units.get(s.code) || 0,
      revenue: rev.get(s.code) || 0,
      margin: skuMargin(num(s.sell), num(s.cogm))
    }))
    .sort((a, b) => b.units - a.units);
}
