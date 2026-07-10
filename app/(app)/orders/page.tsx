"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";

const STATUS_MAP: Record<string, string> = {
  new: "b-amber",
  confirmed: "b-blue",
  in_production: "b-gold",
  packed: "b-blue",
  shipped: "b-blue",
  delivered: "b-green",
  rto: "b-red",
  cancelled: "b-grey"
};
const PAY_MAP: Record<string, string> = { paid: "b-green", cod: "b-blue", pending: "b-amber", refunded: "b-red" };

const columns: Column[] = [
  { key: "orderNo", label: "Order", render: (r) => <b>{r.orderNo}</b> },
  { key: "date", label: "Date", type: "date" },
  { key: "channel", label: "Channel" },
  { key: "customerName", label: "Customer" },
  { key: "items", label: "Items", render: (r) => <span className="muted">{(r.items || []).map((l: any) => `${l.qty}× ${l.skuCode}`).join(", ") || "—"}</span> },
  { key: "total", label: "Total", align: "r", type: "currency" },
  { key: "mto", label: "MTO", render: (r) => (r.mto ? <span className="badge b-gold">MTO</span> : <span className="muted">stock</span>) },
  { key: "status", label: "Status", type: "badge", badgeMap: STATUS_MAP },
  { key: "paymentStatus", label: "Payment", type: "badge", badgeMap: PAY_MAP }
];

const channels = ["D2C — Shopify", "WhatsApp", "Instagram", "Meesho", "Amazon", "Flipkart", "Wholesale / B2B"];

// Single-line-item form; transform wraps it into the items[] array and computes total.
const fields: Field[] = [
  { key: "orderNo", label: "Order no", required: true, auto: { prefix: "TB", pad: 4 } },
  { key: "date", label: "Date", type: "date", required: true },
  { key: "channel", label: "Channel", type: "select", options: channels, default: "D2C — Shopify" },
  { key: "customerName", label: "Customer", type: "ref", refFrom: "customers", refField: "name" },
  { key: "customerPhone", label: "Customer phone" },
  { key: "skuCode", label: "SKU", type: "ref", refFrom: "skus", refField: "code" },
  { key: "size", label: "Size", type: "select", options: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "Free"] },
  { key: "qty", label: "Qty", type: "number", default: 1 },
  { key: "price", label: "Unit price ₹", type: "number" },
  { key: "status", label: "Status", type: "select", options: Object.keys(STATUS_MAP), default: "new" },
  { key: "paymentStatus", label: "Payment", type: "select", options: Object.keys(PAY_MAP), default: "pending" },
  { key: "trackingNo", label: "Tracking no" },
  { key: "mto", label: "Made-to-order", type: "checkbox" }
];

const dispatchColumns: Column[] = [
  { key: "date", label: "Date", type: "date" },
  { key: "orderNo", label: "Order", render: (r) => <b>{r.orderNo}</b> },
  { key: "courier", label: "Courier" },
  { key: "awb", label: "AWB" },
  { key: "qty", label: "Qty", align: "r" },
  { key: "value", label: "Value", align: "r", type: "currency" },
  { key: "status", label: "Status", type: "badge", badgeMap: { Shipped: "b-blue", Delivered: "b-green", RTO: "b-red" } }
];
const dispatchFields: Field[] = [
  { key: "date", label: "Date", type: "date" },
  { key: "orderNo", label: "Order no", type: "ref", refFrom: "orders", refField: "orderNo", required: true },
  { key: "courier", label: "Courier", default: "Shiprocket" },
  { key: "awb", label: "AWB / tracking" },
  { key: "qty", label: "Qty", type: "number" },
  { key: "value", label: "Value ₹", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["Shipped", "Delivered", "RTO"], default: "Shipped" }
];

function transform(payload: any, editing: any) {
  const out = { ...payload };
  if (payload.skuCode) {
    const qty = Number(payload.qty) || 1;
    const price = Number(payload.price) || 0;
    out.items = [{ skuCode: payload.skuCode, name: editing.name || payload.skuCode, size: payload.size || "", qty, price }];
    out.total = qty * price;
  }
  delete out.skuCode;
  delete out.size;
  delete out.qty;
  delete out.price;
  return out;
}

export default function OrdersPage() {
  return (
    <div className="page">
      <PageHead title="Orders" sub="Multi-channel order book. MTO orders spin a production batch; in-stock orders go straight to pick-pack." />
      <ResourceTable collection="orders" title="order" columns={columns} fields={fields} searchKeys={["orderNo", "customerName", "channel", "status"]} defaultSort="date" transform={transform} filterField="status" filterLabel="All statuses" />

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-title">🚚 Dispatch register</div>
        <ResourceTable collection="dispatch" title="dispatch" columns={dispatchColumns} fields={dispatchFields} searchKeys={["orderNo", "awb", "courier", "status"]} defaultSort="date" filterField="status" filterLabel="All statuses" />
      </div>
    </div>
  );
}
