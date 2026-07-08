// Seed data — the real Baisa business, plus generated operational records so every
// dashboard, register and report is populated out of the box. Records are stamped
// with id/orgId/timestamps by the store at seed time.

import type { Org } from "./schema";

export const SEED_ORG: Org = {
  id: "org_baisa",
  name: "The Baisa (Pushpraj Fashion)",
  slug: "the-baisa",
  industry: "Apparel manufacturing & D2C",
  plan: "growth",
  currency: "INR",
  createdAt: "2026-01-01T00:00:00.000Z",
  overheadPct: 0.15,
  rejectPct: 0.03,
  floorMultiplier: 2.0
};

// [code, name, category, cogm, sell, mrp, hero]
const RAW_SKUS: [string, string, string, number, number, number, boolean?][] = [
  ["TB-DRS-001", "Gaj-Rani Elephant Motif Cotton Shirt Dress", "Dress", 750, 2499, 3749],
  ["TB-KST-001", "Royal Velvet Pathani Suit Set", "Kurta Set", 600, 2249, 2999],
  ["TB-CRD-001", "Blossom Breeze Embroidered Cotton Co-ord Set", "Co-ord Set", 800, 1999, 3999],
  ["TB-SHR-001", "Shreeji Peach Gota Floral Sharara Set", "Sharara Set", 500, 1999, 2499],
  ["TB-CRD-002", "Pocket-Chic Abstract Floral Cotton Co-ord", "Co-ord Set", 500, 1899, 2499],
  ["TB-KST-002", "Floral Heritage Cotton 3-Piece Kurta Set", "Kurta Set", 550, 1899, 2749],
  ["TB-DRS-002", "Rose Garden Floral Georgette Tiered Gown", "Dress", 500, 1799, 2499],
  ["TB-KST-003", "Raani Red Buta Sleeveless Cotton Kurta Set", "Kurta Set", 550, 1649, 2749],
  ["TB-KST-004", "A-Line Floral V-Neck Lace Kurta Set", "Kurta Set", 500, 1499, 2499],
  ["TB-MTR-001", "MomCare Morpankh Nursing Maternity Gown", "Maternity", 400, 1499, 1999],
  ["TB-CRD-006", "Morpankh Ikat Sleeveless Cotton Co-ord", "Co-ord Set", 320, 1499, 1599],
  ["TB-CRD-003", "Sunshine Floral Pure Cotton Co-ord Set", "Co-ord Set", 450, 1349, 2249],
  ["TB-KRT-001", "Heritage Morpankh Gold-Print Plus-Size Kurta", "Kurta", 290, 1149, 1449],
  ["TB-MTR-002", "MomCare Checkered Nursing Maternity Gown", "Maternity", 370, 1099, 1849],
  ["TB-CRD-004", "Azure Bloom Floral Cotton Co-ord", "Co-ord Set", 350, 1099, 1749],
  ["TB-TOP-004", "Baisa Signature Backless Cotton Tunic", "Top", 270, 999, 1349],
  ["TB-TOP-002", "Ikat Print Backless Cotton Top", "Top", 270, 999, 1349],
  ["TB-CRD-005", "Ornate Indigo Rama Green Cotton Co-ord", "Co-ord Set", 340, 999, 1699],
  ["TB-KRT-006", "Pretty Woman Kantha-Style Short Kurti", "Kurti", 250, 899, 1249],
  ["TB-TOP-001", "Bloom Floral Peplum Cotton Top", "Top", 200, 699, 999],
  ["TB-KRT-002", "Morpankh Ikat Sleeveless Straight Kurti", "Kurti", 210, 699, 1049],
  ["TB-TOP-003", "Pankhuri Back-Tie Cotton Tunic Top", "Top", 200, 599, 999],
  ["TB-KRT-003", "Pom-Pom Trim Cotton Straight Kurti", "Kurti", 200, 599, 999],
  ["TB-TOP-005", "Elephant Print Criss-Cross Backless Top", "Top", 200, 599, 999],
  ["TB-GWN-BOX", "Anarkali Box Gown - Cotton Checkered Maxi Dress", "Gown", 200, 599, 999, true],
  ["TB-TOP-006", "Mayra Front-Knot Cotton Short Top", "Top", 190, 569, 949],
  ["TB-TOP-007", "Krimson Boho-Chic Cotton Short Top", "Top", 190, 569, 949],
  ["TB-KRT-005", "Ruby Diamond-Leaf Print Short Cotton Kurti", "Kurti", 190, 569, 949],
  ["TB-KRT-004", "Kamdhenu Print Short Cotton Kurti", "Kurti", 190, 569, 949]
];

// Back-derive cost components from COGM so the costing engine has real inputs.
function splitCogm(cogm: number) {
  const pkg = 25;
  const base = (cogm - pkg) / (1.15 * 1.03);
  const fabricCost = Math.round(base * 0.5);
  const labourCost = Math.round(base * 0.35);
  const trimsCost = Math.max(0, Math.round(base - fabricCost - labourCost));
  return { fabricCost, trimsCost, labourCost, packagingCost: pkg };
}

export const SEED_SKUS = RAW_SKUS.map(([code, name, category, cogm, sell, mrp, hero]) => ({
  code,
  name,
  category,
  cogm,
  sell,
  mrp,
  hero: !!hero,
  status: "active" as const,
  ...splitCogm(cogm)
}));

export const SEED_CHANNELS = [
  { name: "D2C — Shopify (baisajaipur.in)", multiplier: 4.0, capPrice: 0, status: "Live", notes: "Best margin. Push all traffic here. Payments live." },
  { name: "WhatsApp", multiplier: 4.0, capPrice: 0, status: "Live", notes: "Fastest, highest-margin conversion for warm leads." },
  { name: "Instagram", multiplier: 4.0, capPrice: 0, status: "Live", notes: "Brand-building + DM sales. Feeds .in & WhatsApp." },
  { name: "baisajaipur.com", multiplier: 4.0, capPrice: 0, status: "Live", notes: "Static brand site → routes Buy Now to .in." },
  { name: "Meesho", multiplier: 3.75, capPrice: 999, status: "Apply", notes: "Mass volume, entry SKUs. Cap ₹999. Watch returns." },
  { name: "Myntra", multiplier: 6.0, capPrice: 0, status: "Apply", notes: "Premium hero SKUs. ~35% commission — price high." },
  { name: "Amazon", multiplier: 4.5, capPrice: 0, status: "Apply", notes: "Discovery + trust. FBA for bestsellers." },
  { name: "Flipkart", multiplier: 4.0, capPrice: 0, status: "Apply", notes: "Tier 2/3 reach." },
  { name: "AJIO", multiplier: 5.5, capPrice: 0, status: "Planned", notes: "Premium fashion. After Myntra stabilises." },
  { name: "Wholesale / B2B", multiplier: 2.25, capPrice: 0, status: "Onboarding", notes: "MOQ bulk to boutiques. Floor ×2.0." }
];

const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
export const SEED_INVENTORY = (() => {
  const items: any[] = [];
  // Stock the 14 best sellers across sizes, with some deliberately low.
  SEED_SKUS.slice(8, 24).forEach((s, si) => {
    SIZES.forEach((size, idx) => {
      const base = (si * 3 + idx * 5) % 24;
      const onHand = s.hero ? base % 4 : base; // heroes run lean (MTO)
      items.push({
        skuCode: s.code,
        size,
        onHand,
        reorderLevel: 6,
        location: "Sanganer Store",
        policy: s.hero ? "CONTINUE" : "DENY"
      });
    });
  });
  return items;
})();

export const SEED_CUSTOMERS = [
  { name: "Pooja Rathore", phone: "+91 98290 11111", segment: "VIP", orders: 5, totalSpent: 8945, lastOrder: "2026-06-20", city: "Jaipur" },
  { name: "Anjali Mehta", phone: "+91 99820 22222", segment: "D2C", orders: 2, totalSpent: 3398, lastOrder: "2026-06-22", city: "Mumbai" },
  { name: "Sunita Boutique", phone: "+91 94140 33333", segment: "Wholesale", orders: 9, totalSpent: 142000, lastOrder: "2026-06-18", city: "Jodhpur" },
  { name: "Ritika Sharma", phone: "+91 97720 44444", segment: "D2C", orders: 1, totalSpent: 1499, lastOrder: "2026-06-24", city: "Delhi" },
  { name: "Meena Agarwal", phone: "+91 90010 55555", segment: "Marketplace", orders: 3, totalSpent: 2697, lastOrder: "2026-06-19", city: "Pune" },
  { name: "Kavita Singh", phone: "+91 93510 66666", segment: "D2C", orders: 4, totalSpent: 6580, lastOrder: "2026-06-23", city: "Lucknow" },
  { name: "Farida Khan", phone: "+91 88260 77777", segment: "VIP", orders: 7, totalSpent: 12340, lastOrder: "2026-06-21", city: "Hyderabad" },
  { name: "Divya Nair", phone: "+91 75500 88888", segment: "D2C", orders: 1, totalSpent: 999, lastOrder: "2026-06-24", city: "Kochi" }
];

export const SEED_ORDERS = (() => {
  const ch = ["D2C — Shopify", "WhatsApp", "Instagram", "Meesho", "Wholesale / B2B"];
  const statuses = ["new", "confirmed", "in_production", "packed", "shipped", "delivered"];
  const pay = ["paid", "paid", "cod", "pending", "paid"];
  const orders: any[] = [];
  for (let i = 0; i < 60; i++) {
    const s = SEED_SKUS[(i * 5 + 3) % SEED_SKUS.length];
    const qty = (i % 3) + 1;
    const size = SIZES[i % SIZES.length];
    const cust = SEED_CUSTOMERS[i % SEED_CUSTOMERS.length];
    const mto = s.hero || i % 4 === 0;
    const day = 24 - (i % 8);
    orders.push({
      orderNo: `TB${2600 + i}`,
      date: `2026-06-${String(day).padStart(2, "0")}`,
      channel: ch[i % ch.length],
      customerName: cust.name,
      customerPhone: cust.phone,
      items: [{ skuCode: s.code, name: s.name, size, qty, price: s.sell }],
      total: s.sell * qty,
      status: statuses[i % statuses.length],
      paymentStatus: pay[i % pay.length],
      mto,
      trackingNo: i % statuses.length >= 4 ? `SR${100200 + i}` : ""
    });
  }
  return orders;
})();

export const SEED_STYLES = SEED_SKUS.slice(0, 10).map((s) => ({
  styleCode: s.code,
  name: s.name,
  fabric: s.category === "Top" || s.category === "Kurti" ? "Cotton Cambric" : "Cotton Mulmul",
  consumptionM: s.category === "Gown" || s.category === "Dress" ? 3.2 : s.category === "Co-ord Set" ? 2.6 : 2.2,
  fabricRate: 120,
  trims: s.trimsCost,
  cmtCutting: 12,
  cmtStitching: s.labourCost - 30,
  cmtFinishing: 18,
  targetCogm: s.cogm
}));

export const SEED_WORKERS = [
  { name: "Ramesh Tailor", operation: "Stitching", ratePerPc: 85, phone: "+91 99280 10001", rating: 4.6, status: "active" },
  { name: "Lakshmi Devi", operation: "Stitching", ratePerPc: 80, phone: "+91 99280 10002", rating: 4.8, status: "active" },
  { name: "Imran Bhai", operation: "Cutting", ratePerPc: 14, phone: "+91 99280 10003", rating: 4.4, status: "active" },
  { name: "Sanganer Prints Co.", operation: "Printing", ratePerPc: 22, phone: "+91 99280 10004", rating: 4.2, status: "active" },
  { name: "Geeta Embroidery", operation: "Embroidery", ratePerPc: 45, phone: "+91 99280 10005", rating: 4.5, status: "active" },
  { name: "Mohan Finishing", operation: "Finishing & Press", ratePerPc: 16, phone: "+91 99280 10006", rating: 4.3, status: "active" }
];

export const SEED_JOBWORK = (() => {
  const rows: any[] = [];
  const ops = ["Stitching", "Printing", "Embroidery", "Finishing & Press"];
  for (let i = 0; i < 8; i++) {
    const style = SEED_STYLES[i % SEED_STYLES.length];
    const worker = SEED_WORKERS[(i + 1) % SEED_WORKERS.length];
    const sent = 40 + (i % 4) * 10;
    const received = i % 3 === 0 ? 0 : sent - (i % 5); // some fully pending
    const rejected = received ? i % 3 : 0;
    rows.push({
      challanNo: `JC-${260 + i}`,
      type: received ? "receipt" : "issue",
      worker: worker.name,
      styleCode: style.styleCode,
      operation: ops[i % ops.length],
      pcsSent: sent,
      pcsReceived: received,
      pcsRejected: rejected,
      ratePerPc: worker.ratePerPc,
      date: `2026-06-${String(15 + (i % 8)).padStart(2, "0")}`,
      dueDate: `2026-06-${String(22 + (i % 6)).padStart(2, "0")}`
    });
  }
  return rows;
})();

export const SEED_WAGES = SEED_WORKERS.slice(0, 4).map((w, i) => {
  const qtyOk = 35 + i * 8;
  const advances = i % 2 ? 500 : 0;
  const net = qtyOk * w.ratePerPc - advances;
  return {
    worker: w.name,
    date: `2026-06-${String(20 + i).padStart(2, "0")}`,
    qtyOk,
    ratePerPc: w.ratePerPc,
    advances,
    deductions: 0,
    netPayable: net,
    paid: i % 2 === 0
  };
});

export const SEED_PRODUCTION = (() => {
  const rows: any[] = [];
  for (let d = 0; d < 7; d++) {
    const style = SEED_STYLES[d % 3];
    const target = 50;
    const cut = 48 - d;
    const stitched = 44 - d;
    const finished = 40 - d;
    rows.push({
      date: `2026-06-${String(18 + d).padStart(2, "0")}`,
      styleCode: style.styleCode,
      cut,
      stitched,
      finished,
      qcPass: finished - (d % 3),
      qcReject: d % 3,
      packed: finished - (d % 3) - 2,
      target
    });
  }
  return rows;
})();

export const SEED_FABRIC = [
  { type: "inward", fabric: "Cotton Mulmul - Indigo", meters: 320, gsm: 110, color: "Indigo", supplier: "Bagru Textiles", rate: 118, amount: 37760, date: "2026-06-10", styleCode: "" },
  { type: "inward", fabric: "Cotton Cambric - White", meters: 500, gsm: 120, color: "White", supplier: "Sanganer Mills", rate: 95, amount: 47500, date: "2026-06-12", styleCode: "" },
  { type: "issue", fabric: "Cotton Mulmul - Indigo", meters: 90, gsm: 110, color: "Indigo", supplier: "", rate: 118, amount: 10620, date: "2026-06-16", styleCode: "TB-CRD-005" },
  { type: "issue", fabric: "Cotton Cambric - White", meters: 120, gsm: 120, color: "White", supplier: "", rate: 95, amount: 11400, date: "2026-06-17", styleCode: "TB-GWN-BOX" }
];

export const SEED_CUTTING = [
  { date: "2026-06-16", styleCode: "TB-CRD-005", fabricIssuedM: 90, pcsCut: 38, wastagePct: 9, bundleNo: "BND-101" },
  { date: "2026-06-17", styleCode: "TB-GWN-BOX", fabricIssuedM: 120, pcsCut: 36, wastagePct: 11, bundleNo: "BND-102" },
  { date: "2026-06-19", styleCode: "TB-KRT-002", fabricIssuedM: 70, pcsCut: 42, wastagePct: 7, bundleNo: "BND-103" }
];

export const SEED_DISPATCH = SEED_ORDERS.filter((o) => o.trackingNo).map((o, i) => ({
  date: o.date,
  orderNo: o.orderNo,
  courier: "Shiprocket",
  awb: o.trackingNo,
  qty: o.items.reduce((a: number, l: any) => a + l.qty, 0),
  value: o.total,
  status: i % 4 === 0 ? "RTO" : i % 2 === 0 ? "Delivered" : "Shipped"
}));

export const SEED_EXPENSES = [
  { date: "2026-06-01", category: "Rent", amount: 18000, mode: "Bank", gst: 0, notes: "Workshop + store" },
  { date: "2026-06-03", category: "Packaging", amount: 4200, mode: "UPI", gst: 756, notes: "Mailers + tags" },
  { date: "2026-06-05", category: "Marketing", amount: 9500, mode: "Card", gst: 1710, notes: "Meta ads" },
  { date: "2026-06-08", category: "Logistics", amount: 6100, mode: "Bank", gst: 1098, notes: "Shiprocket recharge" },
  { date: "2026-06-12", category: "Utilities", amount: 3200, mode: "UPI", gst: 0, notes: "Electricity" },
  { date: "2026-06-15", category: "Salaries", amount: 22000, mode: "Bank", gst: 0, notes: "Ops assistant" },
  { date: "2026-06-20", category: "Marketing", amount: 5000, mode: "UPI", gst: 900, notes: "Influencer seeding" },
  { date: "2026-06-22", category: "Software", amount: 1499, mode: "Card", gst: 270, notes: "Tools subscription" }
];

export const SEED_PURCHASES = [
  { date: "2026-06-10", vendor: "Bagru Textiles", item: "Cotton Mulmul Indigo 320m", amount: 37760, gst: 1888, billNo: "BT-4471" },
  { date: "2026-06-12", vendor: "Sanganer Mills", item: "Cotton Cambric White 500m", amount: 47500, gst: 2375, billNo: "SM-9921" },
  { date: "2026-06-14", vendor: "Jaipur Trims House", item: "Buttons, zips, labels", amount: 8600, gst: 1548, billNo: "JT-220" }
];

export const SEED_VENDORS = [
  { name: "Bagru Textiles", type: "Fabric", contact: "+91 94140 50001", rate: "₹118/m", leadTimeDays: 7, rating: 4.5, status: "Preferred" },
  { name: "Sanganer Mills", type: "Fabric", contact: "+91 94140 50002", rate: "₹95/m", leadTimeDays: 5, rating: 4.3, status: "Active" },
  { name: "Ramesh Tailor", type: "Stitching jobworker", contact: "+91 99280 10001", rate: "₹85/pc", leadTimeDays: 4, rating: 4.6, status: "Preferred" },
  { name: "Sanganer Prints Co.", type: "Printer", contact: "+91 99280 10004", rate: "₹22/pc", leadTimeDays: 3, rating: 4.2, status: "Active" },
  { name: "Geeta Embroidery", type: "Embroidery", contact: "+91 99280 10005", rate: "₹45/pc", leadTimeDays: 6, rating: 4.5, status: "Active" },
  { name: "Jaipur Trims House", type: "Trims", contact: "+91 94140 50003", rate: "varies", leadTimeDays: 2, rating: 4.1, status: "Active" },
  { name: "Shiprocket", type: "Logistics", contact: "support@shiprocket.in", rate: "₹38/shipment", leadTimeDays: 1, rating: 4.0, status: "Active" },
  { name: "Sunita Boutique", type: "Wholesale buyer", contact: "+91 94140 33333", rate: "MOQ 20pc", leadTimeDays: 0, rating: 4.7, status: "Preferred" }
];

export const SEED_CONTENT = [
  ["2026-06-20", "POV: ethnic wear finally in YOUR size", "Reel", "Product", "Sizes XS to 8XL. No exceptions.", "posted"],
  ["2026-06-21", "5 ways to style the Anarkali Box Gown", "Carousel", "Styling", "One gown, five looks.", "posted"],
  ["2026-06-22", "How a Baisa co-ord is born in Sanganer", "Reel", "Craft/BTS", "From loom to your wardrobe.", "posted"],
  ["2026-06-23", "Plus-size kurta that actually fits", "Static", "Product", "Plus-size, not an afterthought.", "scheduled"],
  ["2026-06-24", "Office to dinner in one co-ord", "Reel", "Styling", "9 to 9, one outfit.", "scheduled"],
  ["2026-06-25", "Cotton care 101 — make your kurti last", "Carousel", "Education", "Stop ruining your cotton.", "scripted"],
  ["2026-06-26", "Weekend drop + festive preview", "WA Broadcast", "Offers", "First look for WhatsApp family.", "idea"],
  ["2026-06-27", "Customer reorder story", "Reel", "UGC", "She came back for her 4th.", "idea"],
  ["2026-06-28", "Maternity that's nursing-friendly AND pretty", "Reel", "Product", "Motherhood, minus the compromise.", "idea"],
  ["2026-06-29", "Morpankh print spotlight", "Static", "Product", "The peacock that never goes out of style.", "idea"]
].map(([date, title, format, pillar, hook, status]) => ({ date, title, format, pillar, hook, status, channel: "Instagram" }));

export const SEED_TASKS = [
  ["Recover ₹877.80 lost customer (Razorpay now live)", "Sales / CRM", "P1"],
  ["Register Shopify webhooks → OMS (Order create+update)", "Fulfilment", "P1"],
  ["Physical inventory count & reconcile", "Inventory", "P1"],
  ["Install Judge.me reviews + USP/trust bar", "E-commerce", "P1"],
  ["Create Google Business Profile (Sanganer)", "Marketing", "P1"],
  ["Apply marketplace seller accounts (Amazon/Meesho first)", "E-commerce", "P1"],
  ["Fill actual COGM per SKU from master sheet", "Finance", "P1"],
  ["Upload latest .com zip via hPanel", "Tech / Web", "P2"],
  ["Shopify theme fixes + verify Merchant Center/FB catalog", "Tech / Web", "P2"]
].map(([title, fn, priority]) => ({ title, fn, priority, status: "open", due: "2026-06-30", owner: "Founder" }));

export const SEED_USERS = [
  { name: "Ashish Sharma", email: "founder@baisajaipur.in", role: "owner", password: "baisa123" }
];

export function buildSeed(): Record<string, any[]> {
  return {
    users: SEED_USERS,
    skus: SEED_SKUS,
    channels: SEED_CHANNELS,
    inventory: SEED_INVENTORY,
    orders: SEED_ORDERS,
    customers: SEED_CUSTOMERS,
    styles: SEED_STYLES,
    fabric: SEED_FABRIC,
    cutting: SEED_CUTTING,
    jobwork: SEED_JOBWORK,
    workers: SEED_WORKERS,
    wages: SEED_WAGES,
    production: SEED_PRODUCTION,
    dispatch: SEED_DISPATCH,
    expenses: SEED_EXPENSES,
    purchases: SEED_PURCHASES,
    vendors: SEED_VENDORS,
    content: SEED_CONTENT,
    tasks: SEED_TASKS
  };
}
