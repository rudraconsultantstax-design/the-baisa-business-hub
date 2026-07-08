"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";
import { inr } from "@/lib/format";

const jobColumns: Column[] = [
  { key: "challanNo", label: "Challan", render: (r) => <b>{r.challanNo}</b> },
  { key: "type", label: "Type", type: "badge", badgeMap: { issue: "b-amber", receipt: "b-green" } },
  { key: "worker", label: "Worker / Unit" },
  { key: "styleCode", label: "Style" },
  { key: "operation", label: "Operation" },
  { key: "pcsSent", label: "Sent", align: "r" },
  { key: "pcsReceived", label: "Recd", align: "r" },
  { key: "pending", label: "Pending", align: "r", render: (r) => {
    const p = Math.max(0, Number(r.pcsSent) - Number(r.pcsReceived));
    return <span className={`badge ${p > 0 ? "b-amber" : "b-green"}`}>{p}</span>;
  } },
  { key: "pcsRejected", label: "Rej", align: "r" },
  { key: "dueDate", label: "Due", align: "r", type: "date" }
];

const jobFields: Field[] = [
  { key: "challanNo", label: "Challan no", required: true },
  { key: "type", label: "Type", type: "select", options: ["issue", "receipt"], default: "issue" },
  { key: "worker", label: "Worker / Unit" },
  { key: "styleCode", label: "Style code" },
  { key: "operation", label: "Operation", type: "select", options: ["Cutting", "Stitching", "Printing", "Embroidery", "Finishing & Press"], default: "Stitching" },
  { key: "pcsSent", label: "Pcs sent", type: "number" },
  { key: "pcsReceived", label: "Pcs received", type: "number" },
  { key: "pcsRejected", label: "Pcs rejected", type: "number" },
  { key: "ratePerPc", label: "Rate / pc ₹", type: "number" },
  { key: "date", label: "Issue date", type: "date" },
  { key: "dueDate", label: "Due date", type: "date" }
];

const wageColumns: Column[] = [
  { key: "worker", label: "Worker", render: (r) => <b>{r.worker}</b> },
  { key: "date", label: "Date", type: "date" },
  { key: "qtyOk", label: "Qty OK", align: "r" },
  { key: "ratePerPc", label: "Rate/pc", align: "r", type: "currency" },
  { key: "advances", label: "Advances", align: "r", type: "currency" },
  { key: "netPayable", label: "Net payable", align: "r", render: (r) => <b className="mono">{inr(r.netPayable)}</b> },
  { key: "paid", label: "Paid", render: (r) => (r.paid ? <span className="badge b-green">Paid</span> : <span className="badge b-amber">Due</span>) }
];

const wageFields: Field[] = [
  { key: "worker", label: "Worker", required: true },
  { key: "date", label: "Date", type: "date" },
  { key: "qtyOk", label: "Qty OK (passed)", type: "number" },
  { key: "ratePerPc", label: "Rate / pc ₹", type: "number" },
  { key: "advances", label: "Advances ₹", type: "number" },
  { key: "deductions", label: "Deductions ₹", type: "number" },
  { key: "paid", label: "Paid", type: "checkbox" }
];

// Net payable = qtyOk*rate - advances - deductions
function wageTransform(payload: any) {
  payload.netPayable = (Number(payload.qtyOk) || 0) * (Number(payload.ratePerPc) || 0) - (Number(payload.advances) || 0) - (Number(payload.deductions) || 0);
  return payload;
}

export default function JobWorkPage() {
  return (
    <div className="page">
      <PageHead title="Job-Work & Wages" sub="GST-compliant challans (issue/receipt) and piece-rate wages. Pending = sent − received. Pay only on QC-passed pieces." />
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">🧵 Job-work challan register</div>
        <ResourceTable collection="jobwork" title="challan" columns={jobColumns} fields={jobFields} searchKeys={["challanNo", "worker", "styleCode", "operation"]} defaultSort="date" />
      </div>
      <div className="card">
        <div className="card-title">💸 Wage register (piece-rate)</div>
        <ResourceTable collection="wages" title="wage" columns={wageColumns} fields={wageFields} searchKeys={["worker"]} defaultSort="date" transform={wageTransform} />
      </div>
    </div>
  );
}
