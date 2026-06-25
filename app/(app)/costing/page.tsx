"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/PageHead";
import { computeCogm, priceForChannels } from "@/lib/pricing";
import { inr, pct } from "@/lib/format";

export default function CostingPage() {
  const [fab, setFab] = useState(180);
  const [tri, setTri] = useState(30);
  const [lab, setLab] = useState(120);
  const [pkg, setPkg] = useState(25);
  const [channels, setChannels] = useState<{ name: string; multiplier: number; capPrice: number }[]>([]);
  const [cfg, setCfg] = useState({ overheadPct: 0.15, rejectPct: 0.03, floorMultiplier: 2.0 });

  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then((j) => setChannels((j.data || []).map((c: any) => ({ name: c.name, multiplier: c.multiplier, capPrice: c.capPrice }))));
    fetch("/api/org")
      .then((r) => r.json())
      .then((j) => j.data && setCfg({ overheadPct: j.data.overheadPct, rejectPct: j.data.rejectPct, floorMultiplier: j.data.floorMultiplier }));
  }, []);

  const b = computeCogm({ fabricCost: fab, trimsCost: tri, labourCost: lab, packagingCost: pkg }, cfg.overheadPct, cfg.rejectPct);
  const prices = priceForChannels(b.cogm, channels.length ? channels : [{ name: "D2C", multiplier: 4, capPrice: 0 }], cfg.floorMultiplier);

  const inputRow = (label: string, val: number, set: (n: number) => void) => (
    <div className="form-grid" style={{ gridTemplateColumns: "1fr 120px", margin: "0 0 10px", alignItems: "center" }}>
      <label className="field" style={{ margin: 0 }}>
        {label}
      </label>
      <input type="number" value={val} min={0} onChange={(e) => set(Number(e.target.value) || 0)} style={{ textAlign: "right" }} />
    </div>
  );

  return (
    <div className="page">
      <PageHead title="Costing & Price Engine" sub="Enter a product's real costs → get its COGM and the right price for every channel, with floor & cap guardrails." />

      <div className="grid g2">
        <div className="card">
          <div className="card-title">🧮 COGM builder</div>
          {inputRow("Fabric cost (₹)", fab, setFab)}
          {inputRow("Trims & accessories (₹)", tri, setTri)}
          {inputRow("Labour / CMT (₹)", lab, setLab)}
          {inputRow("Packaging (₹)", pkg, setPkg)}
          <div className="divider" />
          {[
            ["Subtotal (F+T+L)", inr(b.subtotal)],
            [`+ Overhead ${pct(cfg.overheadPct)}`, inr(b.overhead)],
            [`+ Reject ${pct(cfg.rejectPct)}`, inr(b.reject)],
            ["+ Packaging", inr(b.packaging)]
          ].map(([l, v]) => (
            <div className="spread" key={l} style={{ padding: "5px 0", fontSize: "0.83rem" }}>
              <span className="muted">{l}</span>
              <b className="mono">{v}</b>
            </div>
          ))}
          <div className="spread" style={{ padding: "10px 0 0", borderTop: "1px solid var(--border)", marginTop: 6 }}>
            <span style={{ fontWeight: 700 }}>COGM</span>
            <b className="mono" style={{ fontSize: "1.4rem", color: "var(--accent)" }}>
              {inr(b.cogm)}
            </b>
          </div>
        </div>

        <div className="card">
          <div className="card-title">💸 Suggested price by channel</div>
          <div className="tablewrap" style={{ border: "none" }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th className="r">×</th>
                  <th className="r">Price</th>
                  <th className="r">Margin</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p.name}>
                    <td style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</td>
                    <td className="r muted mono">
                      ×{p.multiplier}
                      {p.capped ? " ⚑" : ""}
                      {p.belowFloor ? " ⬆" : ""}
                    </td>
                    <td className="r mono">
                      <b>{inr(p.price)}</b>
                    </td>
                    <td className="r">
                      <span className={`badge ${p.margin >= 0.66 ? "b-green" : p.margin >= 0.5 ? "b-amber" : "b-red"}`}>{pct(p.margin)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="note" style={{ marginTop: 12, fontSize: "0.76rem" }}>
            ⬆ = lifted to the ×{cfg.floorMultiplier} floor · ⚑ = capped at the channel ceiling. Re-cost whenever fabric or labour moves &gt;10%.
          </div>
        </div>
      </div>
    </div>
  );
}
