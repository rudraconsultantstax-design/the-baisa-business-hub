import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getOverview } from "@/lib/dataServer";
import { PageHead } from "@/components/PageHead";
import { ExpenseTable, PurchaseTable } from "@/components/FinanceTables";
import { inr, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const session = await requireSession();
  const o = await getOverview(session.orgId);
  const k = o.kpis;
  const gstInput = o.data.purchases.reduce((a, p) => a + Number(p.gst || 0), 0) + o.data.expenses.reduce((a, e) => a + Number(e.gst || 0), 0);

  const pl: [string, string, boolean?][] = [
    ["Revenue", inr(k.revenue)],
    ["− COGS (fabric + CMT)", inr(k.cogs)],
    ["= Gross profit", inr(k.grossProfit), true],
    ["− Operating expenses", inr(k.opex)],
    ["= Net profit", inr(k.netProfit), true],
    ["Net margin", pct(k.netMargin), true]
  ];

  return (
    <div className="page">
      <PageHead title="Finance & MIS" sub="The numbers, rolled up live from orders, COGM and your expense/purchase registers. Books current to T+1.">
        <Link href="/insights" className="btn btn-sm">🧠 Insights</Link>
        <Link href="/analytics" className="btn btn-sm">📈 Analytics</Link>
      </PageHead>

      <div className="grid g2">
        <div className="card">
          <div className="card-title">📈 Profit &amp; Loss (period to date)</div>
          {pl.map(([l, v, strong]) => (
            <div className="spread" key={l} style={{ padding: "8px 0", borderTop: "1px solid var(--border)", fontWeight: strong ? 700 : 400 }}>
              <span className={strong ? "" : "muted"}>{l}</span>
              <b className="mono" style={{ color: strong && l.includes("Net") ? "var(--accent)" : undefined }}>
                {v}
              </b>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">💼 Payables &amp; position</div>
          {[
            ["Wages payable", inr(k.wagesPayable), "/jobwork"],
            ["Job-work pending", `${k.jobworkPending} pc`, "/jobwork"],
            ["Stock value (at COGM)", inr(k.stockValue), "/inventory"],
            ["Input GST credit (ITC)", inr(gstInput), ""],
            ["Avg order value", inr(k.aov), "/orders"]
          ].map(([l, v, href]) => (
            <div className="spread" key={l} style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
              {href ? (
                <Link href={href} className="muted" style={{ textDecoration: "none" }}>
                  {l} <span style={{ color: "var(--accent)", fontSize: "0.7rem" }}>→</span>
                </Link>
              ) : (
                <span className="muted">{l}</span>
              )}
              <b className="mono">{v}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-title">🧾 Expense register</div>
        <ExpenseTable />
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-title">📥 Purchase register (ITC)</div>
        <PurchaseTable />
      </div>
    </div>
  );
}
