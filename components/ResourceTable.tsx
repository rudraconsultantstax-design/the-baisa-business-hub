"use client";

import { useEffect, useMemo, useState } from "react";
import { inr, pct, dateShort } from "@/lib/format";

export type Column = {
  key: string;
  label: string;
  align?: "r";
  type?: "currency" | "pct" | "date" | "badge" | "text";
  badgeMap?: Record<string, string>;
  render?: (row: any) => React.ReactNode;
};

export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "checkbox";
  options?: string[];
  required?: boolean;
  default?: any;
  full?: boolean;
  step?: string;
};

function cellValue(col: Column, row: any) {
  if (col.render) return col.render(row);
  const v = row[col.key];
  if (col.type === "currency") return inr(v);
  if (col.type === "pct") return pct(v, 0);
  if (col.type === "date") return dateShort(v);
  if (col.type === "badge") {
    const cls = col.badgeMap?.[v] || "b-grey";
    return <span className={`badge ${cls}`}>{String(v ?? "—")}</span>;
  }
  return v ?? "—";
}

export function ResourceTable({
  collection,
  columns,
  fields,
  searchKeys,
  title,
  emptyHint,
  defaultSort,
  transform
}: {
  collection: string;
  columns: Column[];
  fields: Field[];
  searchKeys: string[];
  title?: string;
  emptyHint?: string;
  defaultSort?: string;
  transform?: (payload: any, editing: any) => any;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/${collection}`);
    const j = await res.json().catch(() => ({ data: [] }));
    let data = j.data || [];
    if (defaultSort) data = [...data].sort((a, b) => (a[defaultSort] < b[defaultSort] ? 1 : -1));
    setRows(data);
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return rows;
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(s)));
  }, [rows, q, searchKeys]);

  function startAdd() {
    const blank: any = {};
    for (const f of fields) blank[f.key] = f.default ?? (f.type === "number" ? 0 : f.type === "checkbox" ? false : "");
    setEditing(blank);
    setOpen(true);
  }
  function startEdit(row: any) {
    setEditing({ ...row });
    setOpen(true);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const payload: any = {};
    for (const f of fields) {
      let v = editing[f.key];
      if (f.type === "number") v = Number(v) || 0;
      if (f.type === "checkbox") v = !!v;
      payload[f.key] = v;
    }
    const finalPayload = transform ? transform(payload, editing) : payload;
    const isEdit = !!editing.id;
    const url = isEdit ? `/api/${collection}/${editing.id}` : `/api/${collection}`;
    await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload)
    });
    setSaving(false);
    setOpen(false);
    setEditing(null);
    load();
  }

  async function del(row: any) {
    if (!confirm("Delete this record?")) return;
    await fetch(`/api/${collection}/${row.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="toolbar">
        <input placeholder="🔍 Search…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 260 }} />
        <span className="muted" style={{ fontSize: "0.78rem" }}>
          {filtered.length} record{filtered.length === 1 ? "" : "s"}
        </span>
        <button className="btn btn-accent btn-sm" style={{ marginLeft: "auto" }} onClick={startAdd}>
          + Add {title || collection}
        </button>
      </div>

      <div className="tablewrap">
        <table className="data">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.align === "r" ? "r" : ""}>
                  {c.label}
                </th>
              ))}
              <th className="r">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="muted">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="muted">
                  {emptyHint || "No records yet. Click “Add” to create one."}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key} className={(c.align === "r" ? "r " : "") + (c.type === "currency" || c.type === "pct" ? "mono" : "")}>
                      {cellValue(c, row)}
                    </td>
                  ))}
                  <td className="r">
                    <button className="btn btn-sm" onClick={() => startEdit(row)} style={{ marginRight: 6 }}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => del(row)}>
                      Del
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && editing && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="card-title">{editing.id ? "Edit" : "Add"} {title || collection}</div>
            <div className="form-grid">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "full" : ""}>
                  <label className="field">{f.label}</label>
                  {f.type === "select" ? (
                    <select value={editing[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}>
                      <option value="">—</option>
                      {(f.options || []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "checkbox" ? (
                    <label className="row" style={{ gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!editing[f.key]}
                        onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })}
                        style={{ width: 18, height: 18 }}
                      />
                      <span className="muted">{f.label}</span>
                    </label>
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      step={f.step}
                      value={editing[f.key] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
