"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";

const FUNCTIONS = ["R&D / Design", "Sourcing", "Production", "QC", "Inventory", "E-commerce", "Marketing", "Sales / CRM", "Fulfilment", "Finance", "Admin", "Tech / Web"];

const columns: Column[] = [
  { key: "priority", label: "Pri", type: "badge", badgeMap: { P0: "b-red", P1: "b-amber", P2: "b-grey" } },
  { key: "title", label: "Task", render: (r) => <b>{r.title}</b> },
  { key: "fn", label: "Function" },
  { key: "owner", label: "Owner" },
  { key: "due", label: "Due", align: "r", type: "date" },
  { key: "status", label: "Status", type: "badge", badgeMap: { open: "b-amber", doing: "b-blue", done: "b-green" } }
];

const fields: Field[] = [
  { key: "title", label: "Task", full: true, required: true },
  { key: "fn", label: "Function", type: "select", options: FUNCTIONS, default: "Admin" },
  { key: "priority", label: "Priority", type: "select", options: ["P0", "P1", "P2"], default: "P1" },
  { key: "owner", label: "Owner", default: "Founder" },
  { key: "due", label: "Due date", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["open", "doing", "done"], default: "open" }
];

export default function TasksPage() {
  return (
    <div className="page">
      <PageHead title="Tasks" sub="The action tracker. Sort by priority, clear the top 3 daily, update status at EOD." />
      <ResourceTable collection="tasks" title="task" columns={columns} fields={fields} searchKeys={["title", "fn", "owner"]} defaultSort="priority" />
    </div>
  );
}
