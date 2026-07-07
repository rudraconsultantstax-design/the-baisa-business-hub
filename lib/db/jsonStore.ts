// JSON-file backed data store with an in-memory cache.
//
// Why this design: it is dependency-free (no native modules), builds anywhere,
// and on a long-running Node host (Netlify/VPS/local) it genuinely persists
// writes across requests. On ephemeral serverless it re-seeds per cold start —
// the app stays fully functional. The interface is deliberately small so a
// Postgres/Supabase adapter can be dropped in later without touching callers.

import { promises as fs } from "node:fs";
import path from "node:path";
import { SEED_ORG, buildSeed, SEED_CHANNELS } from "./seed";
import type { Org } from "./schema";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "baisa-os.json");

type Record_ = Record<string, any> & { id: string; orgId: string; createdAt: string; updatedAt: string };

interface DbShape {
  orgs: Org[];
  sessions: { token: string; userId: string; orgId: string; createdAt: string }[];
  collections: Record<string, Record_[]>;
  counters: Record<string, number>;
}

let db: DbShape | null = null;
let loading: Promise<DbShape> | null = null;

function now() {
  return new Date().toISOString();
}

function freshDb(): DbShape {
  const seed = buildSeed();
  const collections: Record<string, Record_[]> = {};
  const counters: Record<string, number> = {};
  for (const [coll, rows] of Object.entries(seed)) {
    counters[coll] = 0;
    collections[coll] = rows.map((r) => {
      counters[coll] += 1;
      return {
        id: `${coll}_${counters[coll]}`,
        orgId: SEED_ORG.id,
        createdAt: SEED_ORG.createdAt,
        updatedAt: SEED_ORG.createdAt,
        ...r
      };
    });
  }
  return { orgs: [SEED_ORG], sessions: [], collections, counters };
}

async function persist() {
  if (!db) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(db), "utf8");
  } catch {
    // Read-only FS (serverless) — keep working from memory.
  }
}

async function loadDb(): Promise<DbShape> {
  if (db) return db;
  if (loading) return loading;
  loading = (async () => {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      db = JSON.parse(raw) as DbShape;
    } catch {
      db = freshDb();
      await persist();
    }
    return db;
  })();
  return loading;
}

function nextId(d: DbShape, coll: string) {
  d.counters[coll] = (d.counters[coll] || 0) + 1;
  return `${coll}_${d.counters[coll]}`;
}

// ---- Public API ----

export async function getOrg(orgId: string): Promise<Org | undefined> {
  const d = await loadDb();
  return d.orgs.find((o) => o.id === orgId);
}

export async function updateOrg(orgId: string, patch: Partial<Org>): Promise<Org | undefined> {
  const d = await loadDb();
  const org = d.orgs.find((o) => o.id === orgId);
  if (!org) return undefined;
  Object.assign(org, patch);
  await persist();
  return org;
}

export async function list(orgId: string, coll: string): Promise<Record_[]> {
  const d = await loadDb();
  return (d.collections[coll] || []).filter((r) => r.orgId === orgId);
}

export async function get(orgId: string, coll: string, id: string): Promise<Record_ | undefined> {
  const d = await loadDb();
  return (d.collections[coll] || []).find((r) => r.id === id && r.orgId === orgId);
}

export async function create(orgId: string, coll: string, data: Record<string, any>): Promise<Record_> {
  const d = await loadDb();
  if (!d.collections[coll]) d.collections[coll] = [];
  const rec: Record_ = {
    ...data,
    id: nextId(d, coll),
    orgId,
    createdAt: now(),
    updatedAt: now()
  };
  d.collections[coll].push(rec);
  await persist();
  return rec;
}

export async function update(orgId: string, coll: string, id: string, patch: Record<string, any>): Promise<Record_ | undefined> {
  const d = await loadDb();
  const rec = (d.collections[coll] || []).find((r) => r.id === id && r.orgId === orgId);
  if (!rec) return undefined;
  Object.assign(rec, patch, { id: rec.id, orgId: rec.orgId, updatedAt: now() });
  await persist();
  return rec;
}

export async function remove(orgId: string, coll: string, id: string): Promise<boolean> {
  const d = await loadDb();
  const arr = d.collections[coll] || [];
  const idx = arr.findIndex((r) => r.id === id && r.orgId === orgId);
  if (idx === -1) return false;
  arr.splice(idx, 1);
  await persist();
  return true;
}

// ---- Sessions (simple cookie auth) ----

export async function createSession(userId: string, orgId: string): Promise<string> {
  const d = await loadDb();
  const token = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  d.sessions.push({ token, userId, orgId, createdAt: now() });
  await persist();
  return token;
}

export async function getSession(token: string | undefined) {
  if (!token) return null;
  const d = await loadDb();
  const s = d.sessions.find((x) => x.token === token);
  if (!s) return null;
  const user = (d.collections.users || []).find((u) => u.id === s.userId);
  return user ? { ...s, user } : null;
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  const d = await loadDb();
  const idx = d.sessions.findIndex((x) => x.token === token);
  if (idx >= 0) d.sessions.splice(idx, 1);
  await persist();
}

export async function findUserByEmail(email: string) {
  const d = await loadDb();
  return (d.collections.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// Create a brand-new workspace (self-serve signup). Seeds the universal channel
// price-map and pricing defaults; business registers start empty.
export async function createOrg(input: { name: string; industry?: string }): Promise<Org> {
  const d = await loadDb();
  const id = `org_${Math.random().toString(36).slice(2, 9)}`;
  const org: Org = {
    id,
    name: input.name,
    slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || id,
    industry: input.industry || "MSME / D2C",
    plan: "free",
    currency: "INR",
    createdAt: now(),
    overheadPct: 0.15,
    rejectPct: 0.03,
    floorMultiplier: 2.0
  };
  d.orgs.push(org);
  for (const ch of SEED_CHANNELS) {
    await create(id, "channels", ch);
  }
  await persist();
  return org;
}

// Reset to seed — used by Settings → "Reset demo data".
export async function resetDb() {
  db = freshDb();
  await persist();
}
