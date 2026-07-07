import { requireSession } from "@/lib/auth";
import { getOverview } from "@/lib/dataServer";
import { PageHead } from "@/components/PageHead";
import { Bars, AreaTrend, Donut, Legend } from "@/components/charts";
import { num } from "@/lib/intelligence";
import { inr, pct, dateShort } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_ORDER = ["new", "confirmed", "in_production", "packed", "shipped", "delivered"];

export default async function AnalyticsPage() {
  const session = await requireSession();
  const o = await getOverview(session.orgId);
  const k = o.kpis;

  // Revenue by day
  const byDay = new Map<string, number>();
  for (const ord of o.data.orders) byDay.set(ord.date, (byDay.get(ord.date) || 0) + num(ord.total));
  const trend = Array.from(byDay.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([d, v]) => ({ label: dateShort(d), value: v }));

  // Revenue by category (units × price via orders → sku category)
  const byCat = new Map<string, number>();
  for (const ord of o.data.orders) {
    for (const l of ord.items || []) {
      const sku = o.data.skus.find((s) => s.code === l.skuCode);
      const cat = sku?.category || "Other";
      byCat.set(cat, (byCat.get(cat) || 0) + num(l.qty) * num(l.price));
    }
  }
  const catItems = Array.from(byCat.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  // Channel revenue
  const channelItems = o.channels.map((c) => ({ label: c.channel, value: c.revenue }));

  // Order status funnel
  const statusCounts = STATUS_ORDER.map((s) => ({
    label: s.replace("_", " "),
    value: o.data.orders.filter((ord) => ord.status === s).length
  }));

  // Top SKUs by revenue
  const topSku = o.skuPerf
    .filter((s) => s.revenue > 0)
    .slice(0, 8)
    .map((s) => ({ label: s.code, value: s.revenue, hint: s.name }));

  // Production efficiency trend
  const effTrend = [...o.data.production]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((p) => ({ label: dateShort(p.date), value: num(p.target) ? Math.round((num(p.packed) / num(p.target)) * 100) : 0 }));

  const heroStats: [string, string, string][] = [
    ["Total revenue", inr(k.revenue), `${k.orderCount} orders`],
    ["Gross profit", inr(k.grossProfit), `after ${inr(k.cogs)} COGS`],
    ["Net margin", pct(k.netMargin), `net ${inr(k.netProfit)}`],
    ["Avg order value", inr(k.aov), "per order"]
  ];

  return (
    <div className="page">
      <PageHead title="Analytics" sub="The visual read on the business — trend, mix and where revenue and margin come from." />

      <div className="grid g4">
        {heroStats.map(([lab, val, meta]) => (
          <div className="stat" key={lab}>
            <div className="lab">{lab}</div>
            <div className="val">{val}</div>
            <div className="meta">{meta}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">📈 Revenue trend</div>
        <AreaTrend points={trend} />
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title">🔗 Revenue by channel</div>
          <Bars items={channelItems} colored labelWidth={160} />
        </div>
        <div className="card">
          <div className="card-title">🧩 Revenue by category</div>
          <div className="row" style={{ gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <Donut items={catItems} />
            <div style={{ flex: 1, minWidth: 160 }}>
              <Legend items={catItems} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title">🏆 Top SKUs by revenue</div>
          <Bars items={topSku} labelWidth={110} />
        </div>
        <div className="card">
          <div className="card-title">🚦 Orders by status</div>
          <Bars items={statusCounts} money={false} colored labelWidth={130} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">
          🏭 Production efficiency <span className="hint">packed ÷ target, % — target ≥ 60%</span>
        </div>
        <AreaTrend points={effTrend} height={130} format={(v) => `${v}%`} />
      </div>
    </div>
  );
}
