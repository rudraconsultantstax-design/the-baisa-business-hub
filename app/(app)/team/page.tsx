"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/PageHead";

const ROLES = ["owner", "manager", "staff"];
const ROLE_BADGE: Record<string, string> = { owner: "b-gold", manager: "b-blue", staff: "b-grey" };

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [me, setMe] = useState<string>("");
  const [myRole, setMyRole] = useState<string>("staff");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "staff", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [t, org] = await Promise.all([fetch("/api/team").then((r) => r.json()), fetch("/api/org").then((r) => r.json())]);
    setUsers(t.data || []);
    setMe(t.me || "");
    const mine = (t.data || []).find((u: any) => u.id === t.me);
    setMyRole(mine?.role || "staff");
  }
  useEffect(() => {
    load();
  }, []);

  const canManage = myRole === "owner" || myRole === "manager";

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (res.ok) {
      setOpen(false);
      setForm({ name: "", email: "", role: "staff", password: "" });
      load();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Failed to add");
    }
  }

  async function changeRole(id: string, role: string) {
    await fetch(`/api/team/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    load();
  }
  async function removeUser(id: string) {
    if (!confirm("Remove this teammate?")) return;
    const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Could not remove");
    }
    load();
  }

  return (
    <div className="page">
      <PageHead title="Team" sub="Invite your staff and set what they can do. Owners & managers can edit; staff have read-only access.">
        {canManage && (
          <button className="btn btn-accent btn-sm" onClick={() => setOpen(true)}>
            + Invite teammate
          </button>
        )}
      </PageHead>

      <div className="tablewrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th className="r">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <b>{u.name}</b> {u.id === me && <span className="muted">(you)</span>}
                </td>
                <td className="muted">{u.email}</td>
                <td>
                  {canManage && u.id !== me ? (
                    <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} style={{ width: 120, padding: "5px 8px" }}>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                  )}
                </td>
                <td className="r">
                  {canManage && u.id !== me ? (
                    <button className="btn btn-sm btn-danger" onClick={() => removeUser(u.id)}>
                      Remove
                    </button>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!canManage && <div className="note" style={{ marginTop: 14 }}>You have read-only access. Ask an owner or manager to change your role.</div>}

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="card-title">Invite teammate</div>
            <form onSubmit={invite}>
              <div className="form-grid">
                <div className="full">
                  <label className="field">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="full">
                  <label className="field">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label className="field">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field">Temp password</label>
                  <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="min 6 chars" required />
                </div>
              </div>
              {error && <div className="badge b-red" style={{ marginBottom: 12, display: "block", padding: "8px 12px" }}>{error}</div>}
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-accent" disabled={busy}>
                  {busy ? "Adding…" : "Add teammate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
