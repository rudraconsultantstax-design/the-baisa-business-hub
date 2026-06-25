"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";

const columns: Column[] = [
  { key: "skuCode", label: "SKU", render: (r) => <b>{r.skuCode}</b> },
  { key: "size", label: "Size" },
  { key: "onHand", label: "On hand", align: "r", render: (r) => {
    const low = r.policy !== "CONTINUE" && Number(r.onHand) <= Number(r.reorderLevel);
    return <span className={`badge ${low ? "b-red" : "b-green"}`}>{r.onHand}</span>;
  } },
  { key: "reorderLevel", label: "Reorder", align: "r" },
  { key: "location", label: "Location" },
  { key: "policy", label: "Policy", type: "badge", badgeMap: { CONTINUE: "b-blue", DENY: "b-grey" } }
];

const fields: Field[] = [
  { key: "skuCode", label: "SKU code", required: true },
  { key: "size", label: "Size", type: "select", options: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "Free"] },
  { key: "onHand", label: "On hand", type: "number" },
  { key: "reorderLevel", label: "Reorder level", type: "number", default: 6 },
  { key: "location", label: "Location", default: "Sanganer Store" },
  { key: "policy", label: "Stock policy", type: "select", options: ["DENY", "CONTINUE"], default: "DENY" }
];

export default function InventoryPage() {
  return (
    <div className="page">
      <PageHead title="Inventory" sub="SKU-size stock ledger. CONTINUE = made-to-order (never sold-out). Low stock is flagged in red." />
      <ResourceTable collection="inventory" title="stock line" columns={columns} fields={fields} searchKeys={["skuCode", "size", "location"]} />
    </div>
  );
}
