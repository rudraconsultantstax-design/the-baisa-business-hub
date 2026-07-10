"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHead } from "@/components/PageHead";

export default function SettingsPage() {
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [storage, setStorage] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/org")
      .then((r) => r.json())
      .then((j) => {
        setOrg(j.data);
        setStorage(j.storage || "");
      });
  }, []);

  async function save() {
    setBusy(true);
    await fetch("/api/org", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: org.name,
        industry: org.industry,
        plan: org.plan,
        overheadPct: Number(org.overheadPct),
        rejectPct: Number(org.rejectPct),
        floorMultiplier: Number(org.floorMultiplier)
      })
    });
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function reset() {
    if (!confirm("Reset all data back to the seeded demo? This cannot be undone.")) return;
    setBusy(true);
    await fetch("/api/org", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reset" }) });
    setBusy(false);
    router.refresh();
    alert("Demo data restored.");
  }

  if (!org) return <div className="page"><p className="muted">Loading…</p></div>;

  return (
    <div className="page">
      <PageHead title="Settings" sub="Your workspace profile and the pricing-engine constants used across costing and margins." />

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="spread">
          <div>
            <div className="card-title" style={{ marginBottom: 4 }}>🗄️ Data storage</div>
            <p className="muted" style={{ fontSize: "0.82rem" }}>
              {storage === "supabase"
                ? "Durable Supabase Postgres — data persists across devices and restarts. Launch-ready."
                : "In-memory (ephemeral). Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in your host to persist data durably."}
            </p>
          </div>
          <span className={`badge ${storage === "supabase" ? "b-green" : "b-amber"}`} style={{ whiteSpace: "nowrap" }}>
            {storage === "supabase" ? "● Connected" : "○ Ephemeral"}
          </span>
        </div>
      </div>

      <div className="grid g2">
        <div className="card">
          <div className="card-title">🏢 Workspace</div>
          <label className="field">Business name</label>
          <input value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="field">Industry</label>
          <input value={org.industry} onChange={(e) => setOrg({ ...org, industry: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="field">Plan</label>
          <select value={org.plan} onChange={(e) => setOrg({ ...org, plan: e.target.value })}>
            <option value="free">Free</option>
            <option value="growth">Growth</option>
            <option value="scale">Scale</option>
          </select>
        </div>

        <div className="card">
          <div className="card-title">🧮 Pricing engine</div>
          <label className="field">Overhead % (e.g. 0.15 = 15%)</label>
          <input type="number" step="0.01" value={org.overheadPct} onChange={(e) => setOrg({ ...org, overheadPct: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="field">Reject % (e.g. 0.03 = 3%)</label>
          <input type="number" step="0.01" value={org.rejectPct} onChange={(e) => setOrg({ ...org, rejectPct: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="field">Price floor multiplier (× COGM)</label>
          <input type="number" step="0.1" value={org.floorMultiplier} onChange={(e) => setOrg({ ...org, floorMultiplier: e.target.value })} />
          <div className="note" style={{ marginTop: 12, fontSize: "0.76rem" }}>
            COGM = (Fabric + Trims + Labour) × (1 + overhead) × (1 + reject) + Packaging. Never price below COGM × floor.
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn btn-accent" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="badge b-green">Saved ✓</span>}
        <button className="btn btn-danger" style={{ marginLeft: "auto" }} onClick={reset} disabled={busy}>
          Reset demo data
        </button>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-title">🔌 Integrations (roadmap)</div>
        <p className="muted" style={{ fontSize: "0.82rem" }}>
          Baisa OS is built to connect: Shopify orders, Razorpay settlements, marketplace seller APIs (Amazon/Meesho/Myntra),
          Shiprocket shipments and WhatsApp Business for the daily brief. The data layer is multi-tenant and org-scoped, so the
          same backend powers any MSME workspace.
        </p>
      </div>
    </div>
  );
}
