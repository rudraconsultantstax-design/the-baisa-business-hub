"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";

const fabricColumns: Column[] = [
  { key: "type", label: "Type", type: "badge", badgeMap: { inward: "b-green", issue: "b-amber" } },
  { key: "fabric", label: "Fabric", render: (r) => <b>{r.fabric}</b> },
  { key: "meters", label: "Meters", align: "r" },
  { key: "gsm", label: "GSM", align: "r" },
  { key: "color", label: "Colour" },
  { key: "supplier", label: "Supplier / To" },
  { key: "rate", label: "Rate/m", align: "r", type: "currency" },
  { key: "amount", label: "Amount", align: "r", type: "currency" },
  { key: "date", label: "Date", align: "r", type: "date" }
];

const fabricFields: Field[] = [
  { key: "type", label: "Type", type: "select", options: ["inward", "issue"], default: "inward" },
  { key: "fabric", label: "Fabric", required: true, full: true },
  { key: "meters", label: "Meters", type: "number" },
  { key: "gsm", label: "GSM", type: "number" },
  { key: "color", label: "Colour" },
  { key: "supplier", label: "Supplier / issued-to" },
  { key: "rate", label: "Rate / m ₹", type: "number" },
  { key: "styleCode", label: "Style (for issue)" },
  { key: "date", label: "Date", type: "date" }
];
function fabricTransform(payload: any) {
  payload.amount = (Number(payload.meters) || 0) * (Number(payload.rate) || 0);
  return payload;
}

const cuttingColumns: Column[] = [
  { key: "date", label: "Date", type: "date" },
  { key: "styleCode", label: "Style", render: (r) => <b>{r.styleCode}</b> },
  { key: "bundleNo", label: "Bundle" },
  { key: "fabricIssuedM", label: "Fabric (m)", align: "r" },
  { key: "pcsCut", label: "Pcs cut", align: "r" },
  { key: "wastagePct", label: "Wastage", align: "r", render: (r) => <span className={`badge ${Number(r.wastagePct) > 10 ? "b-red" : "b-green"}`}>{r.wastagePct}%</span> }
];
const cuttingFields: Field[] = [
  { key: "date", label: "Date", type: "date" },
  { key: "styleCode", label: "Style code", required: true },
  { key: "bundleNo", label: "Bundle no" },
  { key: "fabricIssuedM", label: "Fabric issued (m)", type: "number" },
  { key: "pcsCut", label: "Pcs cut", type: "number" },
  { key: "wastagePct", label: "Wastage %", type: "number" }
];

const styleColumns: Column[] = [
  { key: "styleCode", label: "Style", render: (r) => <b>{r.styleCode}</b> },
  { key: "fabric", label: "Fabric" },
  { key: "consumptionM", label: "Cons. (m)", align: "r" },
  { key: "fabricRate", label: "Rate/m", align: "r", type: "currency" },
  { key: "cmtStitching", label: "Stitch ₹", align: "r" },
  { key: "targetCogm", label: "Target COGM", align: "r", type: "currency" }
];
const styleFields: Field[] = [
  { key: "styleCode", label: "Style code", required: true },
  { key: "name", label: "Name", full: true },
  { key: "fabric", label: "Fabric" },
  { key: "consumptionM", label: "Consumption m/pc", type: "number", step: "0.1" },
  { key: "fabricRate", label: "Fabric rate ₹/m", type: "number" },
  { key: "trims", label: "Trims ₹", type: "number" },
  { key: "cmtCutting", label: "Cutting ₹", type: "number" },
  { key: "cmtStitching", label: "Stitching ₹", type: "number" },
  { key: "cmtFinishing", label: "Finishing ₹", type: "number" },
  { key: "targetCogm", label: "Target COGM ₹", type: "number" }
];

export default function FabricPage() {
  return (
    <div className="page">
      <PageHead title="Fabric, Cutting & Styles" sub="The factory backbone: fabric store (inward/issue), the cutting register, and the style tech-pack master." />
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">🧶 Fabric store register</div>
        <ResourceTable collection="fabric" title="entry" columns={fabricColumns} fields={fabricFields} searchKeys={["fabric", "color", "supplier"]} defaultSort="date" transform={fabricTransform} />
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-title">✂️ Cutting register</div>
        <ResourceTable collection="cutting" title="cut batch" columns={cuttingColumns} fields={cuttingFields} searchKeys={["styleCode", "bundleNo"]} defaultSort="date" />
      </div>
      <div className="card">
        <div className="card-title">📐 Style &amp; tech-pack master</div>
        <ResourceTable collection="styles" title="style" columns={styleColumns} fields={styleFields} searchKeys={["styleCode", "name", "fabric"]} />
      </div>
    </div>
  );
}
