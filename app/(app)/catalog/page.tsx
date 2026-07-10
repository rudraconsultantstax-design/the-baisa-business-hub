"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";
import { computeCogm, skuMargin } from "@/lib/pricing";
import { inr } from "@/lib/format";

const CATS = ["Dress", "Kurta Set", "Co-ord Set", "Sharara Set", "Maternity", "Kurta", "Kurti", "Top", "Gown"];

function liveCogm(r: any) {
  return computeCogm({
    fabricCost: Number(r.fabricCost) || 0,
    trimsCost: Number(r.trimsCost) || 0,
    labourCost: Number(r.labourCost) || 0,
    packagingCost: Number(r.packagingCost) || 0
  }).cogm;
}

const columns: Column[] = [
  { key: "code", label: "SKU", render: (r) => <b>{r.code}</b> },
  { key: "name", label: "Product", render: (r) => <span title={r.name}>{r.name.length > 38 ? r.name.slice(0, 38) + "…" : r.name}</span> },
  { key: "category", label: "Category" },
  { key: "cogm", label: "COGM", align: "r", render: (r) => <span className="mono">{inr(liveCogm(r))}</span> },
  { key: "sell", label: "Sell", align: "r", type: "currency" },
  { key: "mrp", label: "MRP", align: "r", render: (r) => <span className="mono muted">{inr(r.mrp)}</span> },
  {
    key: "margin",
    label: "Margin",
    align: "r",
    render: (r) => {
      const m = skuMargin(Number(r.sell), liveCogm(r));
      const cls = m >= 0.66 ? "b-green" : m >= 0.5 ? "b-amber" : "b-red";
      return <span className={`badge ${cls}`}>{Math.round(m * 100)}%</span>;
    }
  },
  { key: "status", label: "Status", type: "badge", badgeMap: { active: "b-green", draft: "b-amber", archived: "b-grey" } }
];

const fields: Field[] = [
  { key: "code", label: "SKU code", required: true },
  { key: "category", label: "Category", type: "select", options: CATS },
  { key: "name", label: "Product name", full: true, required: true },
  { key: "fabricCost", label: "Fabric ₹", type: "number" },
  { key: "trimsCost", label: "Trims ₹", type: "number" },
  { key: "labourCost", label: "Labour ₹", type: "number" },
  { key: "packagingCost", label: "Packaging ₹", type: "number", default: 25 },
  { key: "sell", label: "Sell price ₹", type: "number" },
  { key: "mrp", label: "MRP ₹", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["active", "draft", "archived"], default: "active" },
  { key: "hero", label: "Hero / MTO product", type: "checkbox" }
];

export default function CatalogPage() {
  return (
    <div className="page">
      <PageHead title="Catalog & Pricing" sub="Every SKU with live COGM (from its cost components) and gross margin at the D2C price." />
      <ResourceTable collection="skus" title="SKU" columns={columns} fields={fields} searchKeys={["code", "name", "category"]} defaultSort="sell" filterField="category" filterLabel="All categories" />
      <div className="note" style={{ marginTop: 14 }}>
        COGM is recomputed from each SKU&apos;s fabric + trims + labour + packaging using your overhead/reject settings — edit a cost
        and the margin updates. Use the <b>Costing Engine</b> to price a brand-new product across all channels.
      </div>
    </div>
  );
}
