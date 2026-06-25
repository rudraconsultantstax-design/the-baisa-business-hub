import { requireSession } from "@/lib/auth";
import { getOverview } from "@/lib/dataServer";
import { PageHead } from "@/components/PageHead";
import { inr, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

const SEV: Record<string, string> = { critical: "b-red", warning: "b-amber", info: "b-blue", good: "b-green" };
const SEV_ICON: Record<string, string> = { critical: "🔴", warning: "🟠", info: "🔵", good: "🟢" };

export default async function InsightsPage() {
  const session = await requireSession();
  const o = await getOverview(session.orgId);
  const bottom = [...o.skuPerf].sort((a, b) => a.margin - b.margin).slice(0, 6);

  return (
    <div className="page">
      <PageHead title="Intelligence" sub="What the numbers are telling you — ranked by urgency, each with a recommended action." />

      <div className="grid g2">
        {o.insights.map((i) => (
          <div className="card" key={i.id}>
            <div className="spread" style={{ alignItems: "flex-start" }}>
              <div className="row" style={{ gap: 8 }}>
                <span>{SEV_ICON[i.severity]}</span>
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className={`badge ${SEV[i.severity]}`}>{i.area}</span>
                    {i.value && <span className="badge b-grey">{i.value}</span>}
                  </div>
                  <h3 style={{ fontSize: "0.95rem", marginTop: 7 }}>{i.title}</h3>
                </div>
              </div>
            </div>
            <p className="muted" style={{ fontSize: "0.82rem", margin: "8px 0 8px" }}>
              {i.detail}
            </p>
            <div className="note" style={{ fontSize: "0.78rem" }}>
              👉 {i.action}
            </div>
          </div>
        ))}
      </div>

      <div className="grid g2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title">📦 Reorder recommendations</div>
          {o.reorders.length === 0 ? (
            <p className="muted">No SKUs below reorder level. 🎉</p>
          ) : (
            <div className="tablewrap" style={{ border: "none" }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Size</th>
                    <th className="r">On hand</th>
                    <th className="r">Suggest</th>
                  </tr>
                </thead>
                <tbody>
                  {o.reorders.slice(0, 10).map((r, idx) => (
                    <tr key={idx}>
                      <td>
                        <b>{r.skuCode}</b>
                      </td>
                      <td>{r.size}</td>
                      <td className="r mono">{r.onHand}</td>
                      <td className="r mono">
                        <span className="badge b-gold">+{r.suggestedQty}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">⚠️ Lowest-margin SKUs</div>
          <div className="tablewrap" style={{ border: "none" }}>
            <table className="data">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th className="r">Sell</th>
                  <th className="r">Margin</th>
                </tr>
              </thead>
              <tbody>
                {bottom.map((s) => (
                  <tr key={s.code}>
                    <td title={s.name}>
                      <b>{s.code}</b>
                    </td>
                    <td className="r mono">{inr(o.data.skus.find((x) => x.code === s.code)?.sell)}</td>
                    <td className="r">
                      <span className={`badge ${s.margin < 0.5 ? "b-red" : s.margin < 0.66 ? "b-amber" : "b-green"}`}>{pct(s.margin)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">🔗 Channel profitability</div>
        <div className="tablewrap" style={{ border: "none" }}>
          <table className="data">
            <thead>
              <tr>
                <th>Channel</th>
                <th className="r">Orders</th>
                <th className="r">Revenue</th>
                <th className="r">Est. COGS</th>
                <th className="r">Margin</th>
              </tr>
            </thead>
            <tbody>
              {o.channels.map((c) => (
                <tr key={c.channel}>
                  <td>{c.channel}</td>
                  <td className="r mono">{c.orders}</td>
                  <td className="r mono">{inr(c.revenue)}</td>
                  <td className="r mono">{inr(c.cogs)}</td>
                  <td className="r">
                    <span className={`badge ${c.margin >= 0.6 ? "b-green" : c.margin >= 0.4 ? "b-amber" : "b-red"}`}>{pct(c.margin)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
