"use client";

import { PageHead } from "@/components/PageHead";
import { ResourceTable, type Column, type Field } from "@/components/ResourceTable";

const TYPES = ["Fabric", "Stitching jobworker", "Printer", "Embroidery", "Trims", "Packaging", "Logistics", "Photographer", "Wholesale buyer", "Marketplace"];

const columns: Column[] = [
  { key: "name", label: "Partner", render: (r) => <b>{r.name}</b> },
  { key: "type", label: "Type" },
  { key: "contact", label: "Contact" },
  { key: "rate", label: "Rate" },
  { key: "leadTimeDays", label: "Lead (d)", align: "r" },
  { key: "rating", label: "Rating", align: "r", render: (r) => <span className="badge b-gold">★ {r.rating}</span> },
  { key: "status", label: "Status", type: "badge", badgeMap: { Preferred: "b-green", Active: "b-blue", Backup: "b-grey", Blacklisted: "b-red" } }
];

const fields: Field[] = [
  { key: "name", label: "Name", full: true, required: true },
  { key: "type", label: "Type", type: "select", options: TYPES, default: "Fabric" },
  { key: "contact", label: "Contact" },
  { key: "rate", label: "Rate (e.g. ₹118/m)" },
  { key: "leadTimeDays", label: "Lead time (days)", type: "number" },
  { key: "rating", label: "Rating (0-5)", type: "number", step: "0.1", default: 4 },
  { key: "status", label: "Status", type: "select", options: ["Preferred", "Active", "Backup", "Blacklisted"], default: "Active" }
];

export default function PartnersPage() {
  return (
    <div className="page">
      <PageHead title="Partners & Vendors" sub="Fabric, job-work, trims, logistics and buyers. Keep 2+ backups per critical operation; star-rate quarterly." />
      <ResourceTable collection="vendors" title="partner" columns={columns} fields={fields} searchKeys={["name", "type", "status"]} filterField="type" filterLabel="All types" />
    </div>
  );
}
