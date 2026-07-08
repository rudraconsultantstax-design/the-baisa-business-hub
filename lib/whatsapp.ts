import { inr } from "./format";

interface BriefLike {
  date: string;
  kpis: { revenue: number; netMargin: number; openOrders: number };
  newOrders: number;
  mtoQueue: number;
  lowStock: number;
  overdueJobwork: number;
  wagesPayable: number;
  topInsights: { area: string; title: string; action: string }[];
  topTasks: { priority: string; title: string }[];
}

// A copy-ready WhatsApp message — the daily brief from the Automation guide,
// formatted to paste straight into WhatsApp Business.
export function formatWhatsAppBrief(b: BriefLike, orgName: string): string {
  const lines: string[] = [];
  lines.push(`*${orgName} — Daily Brief*`);
  lines.push(`_${b.date}_`);
  lines.push("");
  lines.push(`📊 Revenue: *${inr(b.kpis.revenue)}*  ·  Net margin: *${Math.round(b.kpis.netMargin * 100)}%*`);
  lines.push(`🆕 New orders: ${b.newOrders}  ·  🧵 MTO to make: ${b.mtoQueue}  ·  📦 Low stock: ${b.lowStock}`);
  lines.push(`🧶 Overdue job-work: ${b.overdueJobwork}  ·  💸 Wages payable: ${inr(b.wagesPayable)}`);
  if (b.topInsights.length) {
    lines.push("");
    lines.push("*Needs attention:*");
    b.topInsights.forEach((i) => lines.push(`• [${i.area}] ${i.title} — ${i.action}`));
  }
  if (b.topTasks.length) {
    lines.push("");
    lines.push("*Top 3 today:*");
    b.topTasks.forEach((t) => lines.push(`• (${t.priority}) ${t.title}`));
  }
  lines.push("");
  lines.push("— sent from Baisa OS");
  return lines.join("\n");
}
