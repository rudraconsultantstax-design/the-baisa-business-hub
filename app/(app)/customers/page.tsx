"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";

const columns: Column[] = [
  { key: "name", label: "Customer", render: (r) => <b>{r.name}</b> },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "segment", label: "Segment", type: "badge", badgeMap: { VIP: "b-gold", D2C: "b-green", Wholesale: "b-blue", Marketplace: "b-grey" } },
  { key: "orders", label: "Orders", align: "r" },
  { key: "totalSpent", label: "LTV", align: "r", type: "currency" },
  { key: "lastOrder", label: "Last order", align: "r", type: "date" }
];

const fields: Field[] = [
  { key: "name", label: "Name", required: true, full: true },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "segment", label: "Segment", type: "select", options: ["D2C", "Wholesale", "Marketplace", "VIP"], default: "D2C" },
  { key: "orders", label: "Orders count", type: "number" },
  { key: "totalSpent", label: "Total spent ₹", type: "number" },
  { key: "lastOrder", label: "Last order date", type: "date" }
];

export default function CustomersPage() {
  return (
    <div className="page">
      <PageHead title="Customers (CRM)" sub="Your buyer directory, segmented. Build repeat-rate with WhatsApp reorder nudges to VIPs." />
      <ResourceTable collection="customers" title="customer" columns={columns} fields={fields} searchKeys={["name", "phone", "city", "segment"]} defaultSort="totalSpent" filterField="segment" filterLabel="All segments" />
    </div>
  );
}
