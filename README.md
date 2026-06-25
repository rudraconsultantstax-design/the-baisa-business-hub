# Baisa OS — Business Operating System for MSMEs

A **full-stack, multi-tenant SaaS** that lets an MSME manufacturer / D2C brand run the whole
business from one place — and know what to do today. Built from The Baisa (Pushpraj Fashion,
Sanganer, Jaipur) operating system and generalised into a product any small manufacturer can use.

> Frontend **and** backend in one Next.js 16 app. Seeded with real data so every screen works on first run.

## What's inside

| Area | Module |
|---|---|
| **Overview** | Live Dashboard (KPIs, daily brief), Intelligence (ranked insights) |
| **Commerce** | Catalog & Pricing, Costing Engine, Inventory (+reorder AI), Orders + Dispatch, Customers/CRM, Channels |
| **Factory** | Daily Production Report (DPR), Job-Work challans & piece-rate Wages, Fabric store, Cutting register, Style tech-packs |
| **Back office** | Finance & MIS (live P&L), Partners/Vendors, Content calendar, Tasks, Settings |

### The intelligence layer
The app doesn't just store registers — it reads them and tells you where the money and risk are:
loss-making / thin-margin SKUs, reorder suggestions with quantities, overdue job-work, cutting-wastage
spikes, low line efficiency, RTO, wages payable and cash position — all ranked by urgency with a
recommended action, and rolled into a one-screen **daily brief**.

## Architecture

```
Next.js 16 (App Router, React 19, TypeScript)
├── app/(app)/*          Authenticated module pages (server + client components)
├── app/api/*            Backend: org-scoped REST CRUD + auth + insights + brief + org
├── lib/db/store.ts      Persistent JSON data store (dependency-free, swappable for Postgres/Supabase)
├── lib/db/seed.ts       Real Baisa seed data (29 SKUs, channels, registers, content, tasks)
├── lib/pricing.ts       COGM + channel price-map engine
├── lib/intelligence.ts  KPIs, insights, reorder engine, channel & SKU analytics
└── lib/auth.ts          Cookie session auth (multi-tenant, org-scoped)
```

**Multi-tenant by design:** every record carries an `orgId`; the store, the API and the session
are all org-scoped, so the same deployment serves many MSME workspaces.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Demo login: **founder@baisajaipur.in** / **baisa123**

## Backend API (org-scoped, requires session cookie)

```
POST   /api/auth/login           { email, password }
POST   /api/auth/logout
GET    /api/:collection          list           (skus, inventory, orders, jobwork, wages, …)
POST   /api/:collection          create
GET    /api/:collection/:id      read
PATCH  /api/:collection/:id      update
DELETE /api/:collection/:id      delete
GET    /api/insights             KPIs + ranked insights + reorder + channel + SKU analytics
GET    /api/brief                the daily brief
GET    /api/org   PATCH /api/org  workspace + pricing-engine config (POST {action:"reset"} reseeds)
```

## Persistence & production

The default store persists to a JSON file (`.data/baisa-os.json`) — zero native dependencies, builds
anywhere, and genuinely persists on a long-running Node host. The store interface is intentionally
small so a Postgres/Supabase adapter (the suite's `mhlyicynbznlvbinvqna` project) can be dropped in
without touching callers.

## Build

```bash
npm run build && npm start
```
