"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";
import { inr } from "@/lib/format";

const columns: Column[] = [
  { key: "name", label: "Channel", render: (r) => <b>{r.name}</b> },
  { key: "multiplier", label: "× COGM", align: "r", render: (r) => <span className="mono">×{r.multiplier}</span> },
  { key: "capPrice", label: "Price cap", align: "r", render: (r) => (r.capPrice ? <span className="mono">{inr(r.capPrice)}</span> : <span className="muted">—</span>) },
  { key: "status", label: "Status", type: "badge", badgeMap: { Live: "b-green", Apply: "b-amber", Planned: "b-grey", Onboarding: "b-blue" } },
  { key: "notes", label: "Notes", render: (r) => <span className="muted" style={{ fontSize: "0.78rem" }}>{r.notes}</span> }
];

const fields: Field[] = [
  { key: "name", label: "Channel name", required: true, full: true },
  { key: "multiplier", label: "Price multiplier (× COGM)", type: "number", step: "0.05", default: 4 },
  { key: "capPrice", label: "Price cap ₹ (0 = none)", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["Live", "Apply", "Planned", "Onboarding"], default: "Apply" },
  { key: "notes", label: "Notes", full: true }
];

export default function ChannelsPage() {
  return (
    <div className="page">
      <PageHead title="Channels" sub="Win D2C economics first → marketplaces for reach → wholesale for volume. Multipliers feed the costing engine." />
      <ResourceTable collection="channels" title="channel" columns={columns} fields={fields} searchKeys={["name", "status", "notes"]} />
    </div>
  );
}
