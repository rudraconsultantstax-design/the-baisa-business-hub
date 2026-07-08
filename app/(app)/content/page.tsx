"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";

const PILLARS = ["Product", "Styling", "Craft/BTS", "UGC", "Offers", "Education"];
const FORMATS = ["Reel", "Carousel", "Static", "Story", "WA Broadcast", "Blog/SEO"];

const columns: Column[] = [
  { key: "date", label: "Date", type: "date" },
  { key: "title", label: "Title", render: (r) => <b>{r.title}</b> },
  { key: "format", label: "Format", type: "badge", badgeMap: { Reel: "b-gold", Carousel: "b-blue", Static: "b-grey", Story: "b-amber", "WA Broadcast": "b-green", "Blog/SEO": "b-blue" } },
  { key: "pillar", label: "Pillar" },
  { key: "hook", label: "Hook", render: (r) => <i className="muted" style={{ fontSize: "0.8rem" }}>{r.hook}</i> },
  { key: "status", label: "Status", type: "badge", badgeMap: { idea: "b-grey", scripted: "b-amber", shot: "b-blue", scheduled: "b-gold", posted: "b-green" } }
];

const fields: Field[] = [
  { key: "date", label: "Date", type: "date", required: true },
  { key: "title", label: "Title", full: true, required: true },
  { key: "format", label: "Format", type: "select", options: FORMATS, default: "Reel" },
  { key: "pillar", label: "Pillar", type: "select", options: PILLARS, default: "Product" },
  { key: "hook", label: "Hook line", full: true },
  { key: "channel", label: "Channel", default: "Instagram" },
  { key: "status", label: "Status", type: "select", options: ["idea", "scripted", "shot", "scheduled", "posted"], default: "idea" }
];

export default function ContentPage() {
  return (
    <div className="page">
      <PageHead title="Content Calendar" sub="A repeatable machine: 6 pillars · ≥7 posts/week · batch shoot weekly. Plan → script → shoot → schedule → post." />
      <ResourceTable collection="content" title="post" columns={columns} fields={fields} searchKeys={["title", "pillar", "format", "hook"]} defaultSort="date" />
    </div>
  );
}
