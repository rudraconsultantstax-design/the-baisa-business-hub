import { requireSession } from "@/lib/auth";
import { getOverview } from "@/lib/dataServer";
import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";
import { inr, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

const expenseColumns: Column[] = [
  { key: "date", label: "Date", type: "date" },
  { key: "category", label: "Category", render: (r) => <b>{r.category}</b> },
  { key: "amount", label: "Amount", align: "r", type: "currency" },
  { key: "gst", label: "GST", align: "r", type: "currency" },
  { key: "mode", label: "Mode" },
  { key: "notes", label: "Notes", render: (r) => <span className="muted">{r.notes}</span> }
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
  { key: "vendor", label: "Vendor" },
  { key: "item", label: "Item", full: true },
  { key: "amount", label: "Amount ₹", type: "number" },
  { key: "gst", label: "GST ₹", type: "number" },
  { key: "billNo", label: "Bill no" }
];

export default async function FinancePage() {
  const session = await requireSession();
  const o = await getOverview(session.orgId);
  const k = o.kpis;
  const gstInput = o.data.purchases.reduce((a, p) => a + Number(p.gst || 0), 0) + o.data.expenses.reduce((a, e) => a + Number(e.gst || 0), 0);

  const pl: [string, string, boolean?][] = [
    ["Revenue", inr(k.revenue)],
    ["− COGS (fabric + CMT)", inr(k.cogs)],
    ["= Gross profit", inr(k.grossProfit), true],
    ["− Operating expenses", inr(k.opex)],
    ["= Net profit", inr(k.netProfit), true],
    ["Net margin", pct(k.netMargin), true]
  ];

  return (
    <div className="page">
      <PageHead title="Finance & MIS" sub="The numbers, rolled up live from orders, COGM and your expense/purchase registers. Books current to T+1." />

      <div className="grid g2">
        <div className="card">
          <div className="card-title">📈 Profit &amp; Loss (period to date)</div>
          {pl.map(([l, v, strong]) => (
            <div className="spread" key={l} style={{ padding: "8px 0", borderTop: "1px solid var(--border)", fontWeight: strong ? 700 : 400 }}>
              <span className={strong ? "" : "muted"}>{l}</span>
              <b className="mono" style={{ color: strong && l.includes("Net") ? "var(--accent)" : undefined }}>
                {v}
              </b>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">💼 Payables & position</div>
          {[
            ["Wages payable", inr(k.wagesPayable)],
            ["Job-work pending", `${k.jobworkPending} pc`],
            ["Stock value (at COGM)", inr(k.stockValue)],
            ["Input GST credit (ITC)", inr(gstInput)],
            ["Avg order value", inr(k.aov)]
          ].map(([l, v]) => (
            <div className="spread" key={l} style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
              <span className="muted">{l}</span>
              <b className="mono">{v}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-title">🧾 Expense register</div>
        <ResourceTable collection="expenses" title="expense" columns={expenseColumns} fields={expenseFields} searchKeys={["category", "notes", "mode"]} defaultSort="date" />
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-title">📥 Purchase register (ITC)</div>
        <ResourceTable collection="purchases" title="purchase" columns={purchaseColumns} fields={purchaseFields} searchKeys={["vendor", "item", "billNo"]} defaultSort="date" />
      </div>
    </div>
  );
}
