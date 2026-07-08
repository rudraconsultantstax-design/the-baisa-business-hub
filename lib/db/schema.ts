// Baisa OS — data model
// Every record is multi-tenant: it carries an `orgId`, plus `id` and timestamps.
// The store is generic; these types document each collection's shape.

export type ID = string;

export interface BaseRecord {
  id: ID;
  orgId: ID;
  createdAt: string;
  updatedAt: string;
}

export type Plan = "free" | "growth" | "scale";

export interface Org {
  id: ID;
  name: string;
  slug: string;
  industry: string;
  plan: Plan;
  currency: string;
  createdAt: string;
  // pricing engine config (channel multipliers)
  overheadPct: number;
  rejectPct: number;
  floorMultiplier: number;
}

export interface User extends BaseRecord {
  name: string;
  email: string;
  role: "owner" | "manager" | "staff";
  password: string; // demo-grade; hashed in production
}

export interface Session {
  token: string;
  userId: ID;
  orgId: ID;
  createdAt: string;
}

// ---- Catalog & pricing ----
export interface Sku extends BaseRecord {
  code: string;
  name: string;
  category: string;
  fabricCost: number;
  trimsCost: number;
  labourCost: number;
  packagingCost: number;
  cogm: number; // computed/seeded
  sell: number; // D2C selling price
  mrp: number; // compare-at
  status: "active" | "draft" | "archived";
  hero: boolean;
}

export interface Channel extends BaseRecord {
  name: string;
  multiplier: number;
  capPrice: number; // 0 = none
  status: "Live" | "Apply" | "Planned" | "Onboarding";
  notes: string;
}

// ---- Inventory ----
export interface InventoryItem extends BaseRecord {
  skuCode: string;
  size: string;
  onHand: number;
  reorderLevel: number;
  location: string;
  policy: "DENY" | "CONTINUE"; // CONTINUE = made-to-order, never sold-out
}

// ---- Orders & CRM ----
export interface OrderLine {
  skuCode: string;
  name: string;
  size: string;
  qty: number;
  price: number;
}
export interface Order extends BaseRecord {
  orderNo: string;
  date: string;
  channel: string;
  customerName: string;
  customerPhone: string;
  items: OrderLine[];
  total: number;
  status: "new" | "confirmed" | "in_production" | "packed" | "shipped" | "delivered" | "rto" | "cancelled";
  paymentStatus: "pending" | "paid" | "cod" | "refunded";
  mto: boolean;
  trackingNo: string;
}

export interface Customer extends BaseRecord {
  name: string;
  phone: string;
  segment: "D2C" | "Wholesale" | "Marketplace" | "VIP";
  orders: number;
  totalSpent: number;
  lastOrder: string;
  city: string;
}

// ---- Manufacturing registers ----
export interface Style extends BaseRecord {
  styleCode: string;
  name: string;
  fabric: string;
  consumptionM: number; // metres / pc incl. wastage
  fabricRate: number; // ₹/m
  trims: number;
  cmtCutting: number;
  cmtStitching: number;
  cmtFinishing: number;
  targetCogm: number;
}

export interface FabricEntry extends BaseRecord {
  type: "inward" | "issue";
  fabric: string;
  meters: number;
  gsm: number;
  color: string;
  supplier: string;
  rate: number;
  amount: number;
  date: string;
  styleCode: string;
}

export interface CuttingEntry extends BaseRecord {
  date: string;
  styleCode: string;
  fabricIssuedM: number;
  pcsCut: number;
  wastagePct: number;
  bundleNo: string;
}

export interface JobWorkEntry extends BaseRecord {
  challanNo: string;
  type: "issue" | "receipt";
  worker: string;
  styleCode: string;
  operation: string;
  pcsSent: number;
  pcsReceived: number;
  pcsRejected: number;
  ratePerPc: number;
  date: string;
  dueDate: string;
}

export interface Worker extends BaseRecord {
  name: string;
  operation: string;
  ratePerPc: number;
  phone: string;
  rating: number;
  status: "active" | "inactive";
}

export interface WageEntry extends BaseRecord {
  worker: string;
  date: string;
  qtyOk: number;
  ratePerPc: number;
  advances: number;
  deductions: number;
  netPayable: number;
  paid: boolean;
}

export interface ProductionEntry extends BaseRecord {
  date: string;
  styleCode: string;
  cut: number;
  stitched: number;
  finished: number;
  qcPass: number;
  qcReject: number;
  packed: number;
  target: number;
}

export interface DispatchEntry extends BaseRecord {
  date: string;
  orderNo: string;
  courier: string;
  awb: string;
  qty: number;
  value: number;
  status: "Shipped" | "Delivered" | "RTO";
}

// ---- Finance ----
export interface Expense extends BaseRecord {
  date: string;
  category: string;
  amount: number;
  mode: string;
  gst: number;
  notes: string;
}
export interface Purchase extends BaseRecord {
  date: string;
  vendor: string;
  item: string;
  amount: number;
  gst: number;
  billNo: string;
}

// ---- Partners ----
export interface Vendor extends BaseRecord {
  name: string;
  type: string;
  contact: string;
  rate: string;
  leadTimeDays: number;
  rating: number;
  status: "Preferred" | "Active" | "Backup" | "Blacklisted";
}

// ---- Content & Tasks ----
export interface ContentItem extends BaseRecord {
  date: string;
  title: string;
  format: string;
  pillar: string;
  hook: string;
  status: "idea" | "scripted" | "shot" | "scheduled" | "posted";
  channel: string;
}

export interface Task extends BaseRecord {
  title: string;
  fn: string;
  priority: "P0" | "P1" | "P2";
  status: "open" | "doing" | "done";
  due: string;
  owner: string;
}

// Registry of collection names <-> record type
export const COLLECTIONS = [
  "users",
  "skus",
  "channels",
  "inventory",
  "orders",
  "customers",
  "styles",
  "fabric",
  "cutting",
  "jobwork",
  "workers",
  "wages",
  "production",
  "dispatch",
  "expenses",
  "purchases",
  "vendors",
  "content",
  "tasks"
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];
