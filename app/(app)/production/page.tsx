"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";

const columns: Column[] = [
  { key: "date", label: "Date", type: "date" },
  { key: "styleCode", label: "Style", render: (r) => <b>{r.styleCode}</b> },
  { key: "cut", label: "Cut", align: "r" },
  { key: "stitched", label: "Stitched", align: "r" },
  { key: "finished", label: "Finished", align: "r" },
  { key: "qcPass", label: "QC ✓", align: "r" },
  { key: "qcReject", label: "QC ✗", align: "r", render: (r) => <span className={Number(r.qcReject) > 0 ? "" : "muted"}>{r.qcReject}</span> },
  { key: "packed", label: "Packed", align: "r" },
  { key: "target", label: "Target", align: "r" },
  {
    key: "eff",
    label: "Efficiency",
    align: "r",
    render: (r) => {
      const e = Number(r.target) ? Number(r.packed) / Number(r.target) : 0;
      return <span className={`badge ${e >= 0.75 ? "b-green" : e >= 0.6 ? "b-amber" : "b-red"}`}>{Math.round(e * 100)}%</span>;
    }
  }
];

const fields: Field[] = [
  { key: "date", label: "Date", type: "date", required: true },
  { key: "styleCode", label: "Style", type: "ref", refFrom: "styles", refField: "styleCode", required: true },
  { key: "cut", label: "Cut", type: "number" },
  { key: "stitched", label: "Stitched", type: "number" },
  { key: "finished", label: "Finished", type: "number" },
  { key: "qcPass", label: "QC pass", type: "number" },
  { key: "qcReject", label: "QC reject", type: "number" },
  { key: "packed", label: "Packed", type: "number" },
  { key: "target", label: "Daily target", type: "number", default: 50 }
];

export default function ProductionPage() {
  return (
    <div className="page">
      <PageHead title="Daily Production Report (DPR)" sub="The daily pulse of the floor — cut/stitched/finished/QC/packed vs target, with efficiency per line." />
      <ResourceTable collection="production" title="DPR entry" columns={columns} fields={fields} searchKeys={["styleCode", "date"]} defaultSort="date" filterField="styleCode" filterLabel="All styles" />
    </div>
  );
}
