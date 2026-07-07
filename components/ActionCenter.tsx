"use client";

import { useEffect, useState } from "react";
import { inr } from "@/lib/format";

type Row = Record<string, any>;

// One-click actions that write straight back to the registers — so the insights
// on this page are things you *do*, not just read.
export function ActionCenter() {
  const [inventory, setInventory] = useState<Row[]>([]);
  const [skus, setSkus] = useState<Row[]>([]);
  const [wages, setWages] = useState<Row[]>([]);
  const [orders, setOrders] = useState<Row[]>([]);
  const [busy, setBusy] = useState<string>("");

  async function loadAll() {
    const [inv, sk, wg, or] = await Promise.all([
      fetch("/api/inventory").then((r) => r.json()),
      fetch("/api/skus").then((r) => r.json()),
      fetch("/api/wages").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json())
    ]);
    setInventory(inv.data || []);
    setSkus(sk.data || []);
    setWages(wg.data || []);
    setOrders(or.data || []);
  }
  useEffect(() => {
    loadAll();
  }, []);

  async function patch(coll: string, id: string, body: Row, key: string) {
    setBusy(key);
    await fetch(`/api/${coll}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await loadAll();
    setBusy("");
  }

  const reorders = inventory
    .filter((i) => i.policy !== "CONTINUE" && Number(i.onHand) <= Number(i.reorderLevel))
    .map((i): Row => {
      const sku = skus.find((s) => s.code === i.skuCode);
      const suggested = Math.max(Number(i.reorderLevel) * 3 - Number(i.onHand), Number(i.reorderLevel) * 2);
      return { ...i, name: sku?.name || i.skuCode, suggested };
    })
    .sort((a, b) => a.onHand - b.onHand)
    .slice(0, 6);

  const unpaidWages = wages.filter((w) => !w.paid).slice(0, 6);
  const pendingPay = orders.filter((o) => o.paymentStatus === "pending").slice(0, 6);

  const empty = reorders.length === 0 && unpaidWages.length === 0 && pendingPay.length === 0;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-title">
        ⚡ Action center <span className="hint">resolve it here — writes straight to your registers</span>
      </div>
      {empty && <p className="muted">Nothing pending — inventory, wages and payments are all clear. 🎉</p>}

      <div className="grid g3">
        {/* Reorder */}
        {reorders.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: 8 }}>📦 Restock</div>
            {reorders.map((r) => (
              <div key={r.id} className="spread" style={{ padding: "7px 0", borderTop: "1px solid var(--border)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem" }}>
                    <b>{r.skuCode}</b> · {r.size}
                  </div>
                  <div className="muted" style={{ fontSize: "0.72rem" }}>
                    {r.onHand} on hand
                  </div>
                </div>
                <button className="btn btn-sm" disabled={busy === r.id} onClick={() => patch("inventory", r.id, { onHand: Number(r.onHand) + r.suggested }, r.id)}>
                  {busy === r.id ? "…" : `+${r.suggested}`}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Wages */}
        {unpaidWages.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: 8 }}>💸 Pay wages</div>
            {unpaidWages.map((w) => (
              <div key={w.id} className="spread" style={{ padding: "7px 0", borderTop: "1px solid var(--border)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem" }}>{w.worker}</div>
                  <div className="muted mono" style={{ fontSize: "0.72rem" }}>
                    {inr(w.netPayable)}
                  </div>
                </div>
                <button className="btn btn-sm" disabled={busy === w.id} onClick={() => patch("wages", w.id, { paid: true }, w.id)}>
                  {busy === w.id ? "…" : "Mark paid"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Payments */}
        {pendingPay.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: 8 }}>✅ Confirm payment</div>
            {pendingPay.map((o) => (
              <div key={o.id} className="spread" style={{ padding: "7px 0", borderTop: "1px solid var(--border)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem" }}>
                    <b>{o.orderNo}</b>
                  </div>
                  <div className="muted mono" style={{ fontSize: "0.72rem" }}>
                    {inr(o.total)} · {o.customerName}
                  </div>
                </div>
                <button className="btn btn-sm" disabled={busy === o.id} onClick={() => patch("orders", o.id, { paymentStatus: "paid" }, o.id)}>
                  {busy === o.id ? "…" : "Paid"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
