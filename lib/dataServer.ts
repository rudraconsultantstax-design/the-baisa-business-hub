import { list, getOrg } from "./db/store";
import { computeKpis, buildInsights, reorderSuggestions, channelSales, skuPerformance } from "./intelligence";

// Load every collection for an org in one shot.
export async function loadAll(orgId: string) {
  const names = [
    "skus",
    "channels",
    "inventory",
    "orders",
    "customers",
    "styles",
    "fabric",
    "cutting",
    "jobwork",
    "workers",
    "wages",
    "production",
    "dispatch",
    "expenses",
    "purchases",
    "vendors",
    "content",
    "tasks"
  ] as const;
  const entries = await Promise.all(names.map(async (n) => [n, await list(orgId, n)] as const));
  const data = Object.fromEntries(entries) as Record<(typeof names)[number], any[]>;
  return data;
}

export async function getOverview(orgId: string) {
  const data = await loadAll(orgId);
  const org = await getOrg(orgId);
  const c = {
    skus: data.skus,
    inventory: data.inventory,
    orders: data.orders,
    jobwork: data.jobwork,
    wages: data.wages,
    production: data.production,
    expenses: data.expenses,
    purchases: data.purchases,
    cutting: data.cutting,
    dispatch: data.dispatch,
    customers: data.customers
  };
  return {
    org,
    data,
    kpis: computeKpis(c),
    insights: buildInsights(c),
    reorders: reorderSuggestions({ inventory: data.inventory, skus: data.skus }),
    channels: channelSales({ orders: data.orders, skus: data.skus }),
    skuPerf: skuPerformance({ orders: data.orders, skus: data.skus })
  };
}

// The daily brief — the one-screen "what to do today".
export async function getDailyBrief(orgId: string) {
  const o = await getOverview(orgId);
  const overdueJobwork = o.data.jobwork.filter(
    (j) => Number(j.pcsSent) > Number(j.pcsReceived) && j.dueDate && j.dueDate < new Date().toISOString().slice(0, 10)
  ).length;
  const newOrders = o.data.orders.filter((x) => x.status === "new").length;
  const mtoQueue = o.data.orders.filter((x) => x.mto && ["new", "confirmed", "in_production"].includes(x.status)).length;
  const topTasks = o.data.tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => (a.priority < b.priority ? -1 : 1))
    .slice(0, 3);
  return {
    date: new Date().toISOString().slice(0, 10),
    kpis: o.kpis,
    newOrders,
    mtoQueue,
    lowStock: o.kpis.lowStock,
    overdueJobwork,
    wagesPayable: o.kpis.wagesPayable,
    topInsights: o.insights.filter((i) => i.severity === "critical" || i.severity === "warning").slice(0, 4),
    topTasks
  };
}
