import Link from "next/link";
import { currentSession } from "@/lib/auth";

export default async function Landing() {
  const session = await currentSession();
  const cta = session ? "/dashboard" : "/login";

  const features = [
    ["📊", "Live MIS & Dashboard", "Revenue, COGS, net margin, payables and an auto-computed daily brief — no manual compilation."],
    ["🧮", "Costing & Pricing Engine", "COGM from fabric + trims + CMT, then the right price for every channel with floor & cap guardrails."],
    ["🏭", "Manufacturing Registers", "Style tech-packs, fabric store, cutting, GST job-work challans, piece-rate wages and daily production (DPR)."],
    ["📦", "Inventory & Reorder AI", "SKU-size stock ledger with an engine that flags low stock and suggests replenishment quantities."],
    ["🛍️", "Orders & CRM", "Multi-channel orders, MTO queue, fulfilment status, dispatch tracking and a customer directory."],
    ["🧠", "Intelligence Layer", "Loss-making SKUs, overdue job-work, wastage spikes, RTO and cash — surfaced as ranked, actionable insights."]
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: "1.3rem", color: "var(--accent)", fontWeight: 800 }}>
            Baisa<span style={{ color: "var(--text)" }}> OS</span>
          </div>
          <Link href={cta} className="btn btn-accent btn-sm">
            {session ? "Open dashboard" : "Sign in"}
          </Link>
        </div>
      </header>

      <section style={{ maxWidth: 920, margin: "0 auto", padding: "72px 24px 40px", textAlign: "center" }}>
        <span className="badge b-gold" style={{ marginBottom: 18 }}>
          The Business Operating System for MSMEs
        </span>
        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.9rem", lineHeight: 1.1, margin: "8px 0 16px" }}>
          Run your whole business from one place — and know what to do today.
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "1.05rem", maxWidth: 640, margin: "0 auto 26px" }}>
          Baisa OS turns scattered registers, spreadsheets and gut-feel into one connected system: costing, manufacturing,
          inventory, orders and finance — with an intelligence layer that watches the numbers and tells you where the money
          and risk are.
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link href={cta} className="btn btn-accent">
            Get started →
          </Link>
          <Link href="/login" className="btn">
            Live demo
          </Link>
        </div>
        <p className="muted" style={{ marginTop: 14, fontSize: "0.78rem" }}>
          Demo login: <b>founder@baisajaipur.in</b> / <b>baisa123</b>
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 80px" }}>
        <div className="grid g3">
          {features.map(([ico, title, body]) => (
            <div key={title} className="card">
              <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{ico}</div>
              <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>{title}</h3>
              <p style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>{body}</p>
            </div>
          ))}
        </div>
        <div className="note" style={{ marginTop: 28 }}>
          Built from a real Jaipur ethnic-wear manufacturer&apos;s operating system. Multi-tenant by design — every record is
          org-scoped, so the same platform runs any MSME manufacturer or D2C brand.
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", textAlign: "center", color: "var(--text-3)", fontSize: "0.78rem" }}>
        Baisa OS · a Business Operating System for MSMEs · made for makers
      </footer>
    </div>
  );
}
