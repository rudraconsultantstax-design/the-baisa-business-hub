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
  sortable?: boolean;
};

export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "checkbox" | "ref";
  options?: string[];
  required?: boolean;
  default?: any;
  full?: boolean;
  step?: string;
  // "ref": prefill options from another collection's field (selectable cell)
  refFrom?: string;
  refField?: string;
  // auto-number: prefill the next value like "TB2601", "JC-268"
  auto?: { prefix: string; pad: number };
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

function nextAutoNumber(rows: any[], key: string, prefix: string, pad: number) {
  let max = 0;
  for (const r of rows) {
    const s = String(r[key] ?? "");
    if (prefix && !s.startsWith(prefix)) continue;
    const digits = s.slice(prefix.length).replace(/\D/g, "");
    const n = parseInt(digits || "0", 10);
    if (n > max) max = n;
  }
  return prefix + String(max + 1).padStart(pad, "0");
}

export function ResourceTable({
  collection,
  columns,
  fields,
  searchKeys,
  title,
  emptyHint,
  defaultSort,
  transform,
  filterField,
  filterLabel
}: {
  collection: string;
  columns: Column[];
  fields: Field[];
  searchKeys: string[];
  title?: string;
  emptyHint?: string;
  defaultSort?: string;
  transform?: (payload: any, editing: any) => any;
  filterField?: string;
  filterLabel?: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filterVal, setFilterVal] = useState("");
  const [sortKey, setSortKey] = useState<string>(defaultSort || "");
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSort ? "desc" : "asc");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refOptions, setRefOptions] = useState<Record<string, string[]>>({});

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/${collection}`);
    const j = await res.json().catch(() => ({ data: [] }));
    setRows(j.data || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  // Load reference options (prefilled selectable cells) once.
  useEffect(() => {
    const refs = fields.filter((f) => f.type === "ref" && f.refFrom && f.refField);
    if (refs.length === 0) return;
    const uniqueCollections = Array.from(new Set(refs.map((f) => f.refFrom!)));
    Promise.all(uniqueCollections.map((c) => fetch(`/api/${c}`).then((r) => r.json()).then((j) => [c, j.data || []] as const))).then((pairs) => {
      const byColl = Object.fromEntries(pairs);
      const opts: Record<string, string[]> = {};
      for (const f of refs) {
        const data = byColl[f.refFrom!] || [];
        opts[f.key] = Array.from(new Set(data.map((r: any) => r[f.refField!]).filter(Boolean))).sort() as string[];
      }
      setRefOptions(opts);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  const filterOptions = useMemo(() => {
    if (!filterField) return [];
    return Array.from(new Set(rows.map((r) => r[filterField]).filter((v) => v != null && v !== ""))).sort() as string[];
  }, [rows, filterField]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    let out = rows.filter((r) => {
      const matchesSearch = !s || searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(s));
      const matchesFilter = !filterField || !filterVal || String(r[filterField]) === filterVal;
      return matchesSearch && matchesFilter;
    });
    if (sortKey) {
      out = [...out].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const an = Number(av);
        const bn = Number(bv);
        let cmp: number;
        if (!Number.isNaN(an) && !Number.isNaN(bn) && av !== "" && bv !== "") cmp = an - bn;
        else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, q, searchKeys, filterField, filterVal, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function startAdd() {
    const blank: any = {};
    for (const f of fields) {
      if (f.auto) blank[f.key] = nextAutoNumber(rows, f.key, f.auto.prefix, f.auto.pad);
      else blank[f.key] = f.default ?? (f.type === "number" ? 0 : f.type === "checkbox" ? false : "");
    }
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

  function exportCsv() {
    const keys = ["id", ...fields.map((f) => f.key)];
    const esc = (v: any) => {
      const s = v == null ? "" : Array.isArray(v) || typeof v === "object" ? JSON.stringify(v) : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const head = keys.join(",");
    const body = filtered.map((r) => keys.map((k) => esc(r[k])).join(",")).join("\n");
    const blob = new Blob([head + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${collection}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const inputForField = (f: Field) => {
    if (f.type === "select" || f.type === "ref") {
      const opts = f.type === "ref" ? refOptions[f.key] || [] : f.options || [];
      return (
        <select value={editing[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}>
          <option value="">—</option>
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    if (f.type === "checkbox") {
      return (
        <label className="row" style={{ gap: 8 }}>
          <input type="checkbox" checked={!!editing[f.key]} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })} style={{ width: 18, height: 18 }} />
          <span className="muted">{f.label}</span>
        </label>
      );
    }
    return (
      <input
        type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
        step={f.step}
        value={editing[f.key] ?? ""}
        onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
      />
    );
  };

  return (
    <div>
      <div className="toolbar">
        <input placeholder="🔍 Search…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 220 }} />
        {filterField && (
          <select value={filterVal} onChange={(e) => setFilterVal(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">{filterLabel || "All"}</option>
            {filterOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}
        <span className="muted" style={{ fontSize: "0.78rem" }}>
          {filtered.length} record{filtered.length === 1 ? "" : "s"}
        </span>
        <button className="btn btn-sm" style={{ marginLeft: "auto" }} onClick={load} title="Refresh">
          ↻
        </button>
        <button className="btn btn-sm" onClick={exportCsv} title="Export visible rows to CSV">
          ⬇ CSV
        </button>
        <button className="btn btn-accent btn-sm" onClick={startAdd}>
          + Add {title || collection}
        </button>
      </div>

      <div className="tablewrap">
        <table className="data">
          <thead>
            <tr>
              {columns.map((c) => {
                const sortable = c.sortable !== false;
                const active = sortKey === c.key;
                return (
                  <th
                    key={c.key}
                    className={c.align === "r" ? "r" : ""}
                    onClick={sortable ? () => toggleSort(c.key) : undefined}
                    style={sortable ? { cursor: "pointer", userSelect: "none" } : undefined}
                    title={sortable ? "Sort" : undefined}
                  >
                    {c.label}
                    {active && <span style={{ color: "var(--accent)", marginLeft: 4 }}>{sortDir === "asc" ? "▲" : "▼"}</span>}
                  </th>
                );
              })}
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
                  <td className="r" style={{ whiteSpace: "nowrap" }}>
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
            <div className="card-title">
              {editing.id ? "Edit" : "Add"} {title || collection}
            </div>
            <div className="form-grid">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "full" : ""}>
                  <label className="field">{f.label}</label>
                  {inputForField(f)}
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
