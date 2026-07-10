import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getOverview, getDailyBrief } from "@/lib/dataServer";
import { PageHead } from "@/components/PageHead";
import { CopyBrief } from "@/components/CopyBrief";
import { formatWhatsAppBrief } from "@/lib/whatsapp";
import { inr, inrCompact, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

const SEV: Record<string, string> = { critical: "b-red", warning: "b-amber", info: "b-blue", good: "b-green" };

export default async function Dashboard() {
  const session = await requireSession();
  const o = await getOverview(session.orgId);
  const brief = await getDailyBrief(session.orgId);
  const k = o.kpis;
  const waText = formatWhatsAppBrief(brief, o.org?.name ?? "Workspace");

  const stats: [string, string, string, string][] = [
    ["Revenue (orders)", inr(k.revenue), `${k.orderCount} orders · AOV ${inr(k.aov)}`, "/analytics"],
    ["Net margin", pct(k.netMargin), `Net profit ${inr(k.netProfit)}`, "/finance"],
    ["Stock value", inr(k.stockValue), `${k.stockUnits} units on hand`, "/inventory"],
    ["Open orders", String(k.openOrders), `${brief.mtoQueue} in MTO queue`, "/orders"],
    ["Job-work pending", `${k.jobworkPending} pc`, `${brief.overdueJobwork} challan(s) overdue`, "/jobwork"],
    ["Wages payable", inr(k.wagesPayable), "unpaid piece-rate", "/jobwork"],
    ["Low stock alerts", String(k.lowStock), "size-SKUs at reorder", "/inventory"],
    ["Line efficiency", pct(k.efficiency), "packed vs target (DPR)", "/production"]
  ];

  const maxRev = Math.max(...o.channels.map((c) => c.revenue), 1);
  const topSkus = o.skuPerf.filter((s) => s.units > 0).slice(0, 6);
  const maxUnits = Math.max(...topSkus.map((s) => s.units), 1);

  return (
    <div className="page">
      <PageHead title={`Good day, ${session.user.name.split(" ")[0]}`} sub={`${o.org?.name} · ${brief.date} · your business at a glance`}>
        <Link href="/insights" className="btn btn-sm">
          🧠 All insights
        </Link>
        <Link href="/orders" className="btn btn-accent btn-sm">
          + New order
        </Link>
      </PageHead>

      <div className="grid g4">
        {stats.map(([lab, val, meta, href]) => (
          <Link className="stat tile-link" key={lab} href={href} style={{ display: "block" }}>
            <div className="lab">{lab}</div>
            <div className="val">{val}</div>
            <div className="meta">{meta}</div>
          </Link>
        ))}
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        {/* Daily brief / priority insights */}
        <div className="card">
          <div className="card-title">
            ☀️ Today&apos;s brief
            <CopyBrief text={waText} />
          </div>
          {brief.topInsights.length === 0 && <p className="muted">All clear — no critical or warning signals today. 🎉</p>}
          {brief.topInsights.map((i) => (
            <div key={i.id} className="spread" style={{ padding: "9px 0", borderTop: "1px solid var(--border)" }}>
              <div style={{ minWidth: 0 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className={`badge ${SEV[i.severity]}`}>{i.area}</span>
                  <b style={{ fontSize: "0.85rem" }}>{i.title}</b>
                </div>
                <div className="muted" style={{ fontSize: "0.76rem", marginTop: 3 }}>
                  {i.action}
                </div>
              </div>
            </div>
          ))}
          <div className="divider" />
          <div className="row" style={{ gap: 18, flexWrap: "wrap", fontSize: "0.8rem" }}>
            <span>🆕 <b>{brief.newOrders}</b> new orders</span>
            <span>🧵 <b>{brief.mtoQueue}</b> MTO to make</span>
            <span>📦 <b>{brief.lowStock}</b> low stock</span>
            <span>💸 <b>{inrCompact(brief.wagesPayable)}</b> wages</span>
          </div>
        </div>

        {/* Top priority tasks */}
        <div className="card">
          <div className="card-title">
            🔥 Priority tasks
            <Link href="/tasks" className="hint">
              View all →
            </Link>
          </div>
          {brief.topTasks.length === 0 && <p className="muted">No open tasks.</p>}
          {brief.topTasks.map((t) => (
            <div key={t.id} className="spread" style={{ padding: "9px 0", borderTop: "1px solid var(--border)" }}>
              <div className="row" style={{ gap: 9 }}>
                <span className={`badge ${t.priority === "P0" ? "b-red" : t.priority === "P1" ? "b-amber" : "b-grey"}`}>{t.priority}</span>
                <span style={{ fontSize: "0.84rem" }}>{t.title}</span>
              </div>
              <span className="muted" style={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                {t.fn}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        {/* Channel mix */}
        <div className="card">
          <div className="card-title">
            🔗 Revenue by channel
            <Link href="/channels" className="hint">
              Strategy →
            </Link>
          </div>
          {o.channels.map((c) => (
            <div className="bar-row" key={c.channel}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.channel}</span>
              <div className="progress">
                <i style={{ width: `${(c.revenue / maxRev) * 100}%` }} />
              </div>
              <span className="r mono" style={{ fontSize: "0.76rem" }}>
                {inrCompact(c.revenue)}
              </span>
            </div>
          ))}
        </div>

        {/* Top SKUs */}
        <div className="card">
          <div className="card-title">
            🏆 Top SKUs by units
            <Link href="/catalog" className="hint">
              Catalog →
            </Link>
          </div>
          {topSkus.length === 0 && <p className="muted">No sales data yet.</p>}
          {topSkus.map((s) => (
            <div className="bar-row" key={s.code}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.name}>
                {s.code}
              </span>
              <div className="progress">
                <i style={{ width: `${(s.units / maxUnits) * 100}%` }} />
              </div>
              <span className="r mono" style={{ fontSize: "0.76rem" }}>
                {s.units}u
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="note" style={{ marginTop: 16 }}>
        Every number on this page is computed live from your registers by the Baisa OS intelligence layer — orders, COGM, job-work
        challans, wages and production all roll up automatically. No manual MIS compilation.
      </div>
    </div>
  );
}
