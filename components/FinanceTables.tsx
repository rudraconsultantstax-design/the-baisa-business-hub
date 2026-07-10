"use client";

import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";

const expenseColumns: Column[] = [
  { key: "date", label: "Date", type: "date" },
  { key: "category", label: "Category", render: (r) => <b>{r.category}</b> },
  { key: "amount", label: "Amount", align: "r", type: "currency" },
  { key: "gst", label: "GST", align: "r", type: "currency" },
  { key: "mode", label: "Mode" },
  { key: "notes", label: "Notes", render: (r) => <span className="muted">{r.notes}</span>, sortable: false }
];
const expenseFields: Field[] = [
  { key: "date", label: "Date", type: "date", required: true },
  { key: "category", label: "Category", type: "select", options: ["Rent", "Packaging", "Marketing", "Logistics", "Utilities", "Salaries", "Software", "Other"], default: "Other" },
  { key: "amount", label: "Amount ₹", type: "number" },
  { key: "gst", label: "GST ₹", type: "number" },
  { key: "mode", label: "Mode", type: "select", options: ["Bank", "UPI", "Card", "Cash"], default: "UPI" },
  { key: "notes", label: "Notes", full: true }
];

const purchaseColumns: Column[] = [
  { key: "date", label: "Date", type: "date" },
  { key: "vendor", label: "Vendor", render: (r) => <b>{r.vendor}</b> },
  { key: "item", label: "Item" },
  { key: "amount", label: "Amount", align: "r", type: "currency" },
  { key: "gst", label: "GST (ITC)", align: "r", type: "currency" },
  { key: "billNo", label: "Bill no" }
];
const purchaseFields: Field[] = [
  { key: "date", label: "Date", type: "date", required: true },
  { key: "vendor", label: "Vendor", type: "ref", refFrom: "vendors", refField: "name" },
  { key: "item", label: "Item", full: true },
  { key: "amount", label: "Amount ₹", type: "number" },
  { key: "gst", label: "GST ₹", type: "number" },
  { key: "billNo", label: "Bill no", auto: { prefix: "BILL-", pad: 3 } }
];

export function ExpenseTable() {
  return <ResourceTable collection="expenses" title="expense" columns={expenseColumns} fields={expenseFields} searchKeys={["category", "notes", "mode"]} defaultSort="date" filterField="category" filterLabel="All categories" />;
}

export function PurchaseTable() {
  return <ResourceTable collection="purchases" title="purchase" columns={purchaseColumns} fields={purchaseFields} searchKeys={["vendor", "item", "billNo"]} defaultSort="date" filterField="vendor" filterLabel="All vendors" />;
}
