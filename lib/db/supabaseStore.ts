// Supabase backend — implements the same interface as jsonStore.ts.
//
// Schema (prefixed to avoid clashing with the sibling OMS schema if pointed at
// the shared project): baisa_os_orgs, baisa_os_records, baisa_os_sessions.
// All business collections live in baisa_os_records as JSONB, keyed by
// (org_id, collection) — mirroring the generic store interface exactly.
//
// The client is created lazily so importing this module never throws when the
// env vars are absent (the dispatcher in store.ts only routes here when set).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SEED_ORG, buildSeed, SEED_CHANNELS } from "./seed";
import type { Org } from "./schema";

const ORGS = "baisa_os_orgs";
const RECORDS = "baisa_os_records";
const SESSIONS = "baisa_os_sessions";

type Rec = Record<string, any> & { id: string; orgId: string; createdAt: string; updatedAt: string };

let _client: SupabaseClient | null = null;
function client(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return _client;
}

function now() {
  return new Date().toISOString();
}

function flatten(row: any): Rec {
  return { id: row.id, orgId: row.org_id, createdAt: row.created_at, updatedAt: row.updated_at, ...(row.data || {}) };
}

function stripMeta(data: Record<string, any>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, orgId, createdAt, updatedAt, ...rest } = data;
  return rest;
}

let seeded = false;
async function ensureSeeded() {
  if (seeded) return;
  const c = client();
  const { data: orgs } = await c.from(ORGS).select("id").limit(1);
  if (orgs && orgs.length) {
    seeded = true;
    return;
  }
  await c.from(ORGS).insert({ id: SEED_ORG.id, data: SEED_ORG });
  const seed = buildSeed();
  const rows: any[] = [];
  for (const [coll, items] of Object.entries(seed)) {
    items.forEach((r, i) => {
      rows.push({
        id: `${coll}_${i + 1}`,
        org_id: SEED_ORG.id,
        collection: coll,
        data: r,
        created_at: SEED_ORG.createdAt,
        updated_at: SEED_ORG.createdAt
      });
    });
  }
  // chunk inserts to stay within payload limits
  for (let i = 0; i < rows.length; i += 200) {
    await c.from(RECORDS).insert(rows.slice(i, i + 200));
  }
  seeded = true;
}

function newId(coll: string) {
  return `${coll}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// ---- Public API (mirrors jsonStore.ts) ----

export async function getOrg(orgId: string): Promise<Org | undefined> {
  await ensureSeeded();
  const { data } = await client().from(ORGS).select("data").eq("id", orgId).maybeSingle();
  return data?.data as Org | undefined;
}

export async function updateOrg(orgId: string, patch: Partial<Org>): Promise<Org | undefined> {
  const current = await getOrg(orgId);
  if (!current) return undefined;
  const merged = { ...current, ...patch, id: current.id };
  await client().from(ORGS).update({ data: merged }).eq("id", orgId);
  return merged;
}

export async function list(orgId: string, coll: string): Promise<Rec[]> {
  await ensureSeeded();
  const { data } = await client().from(RECORDS).select("*").eq("org_id", orgId).eq("collection", coll).order("created_at", { ascending: true });
  return (data || []).map(flatten);
}

export async function get(orgId: string, coll: string, id: string): Promise<Rec | undefined> {
  await ensureSeeded();
  const { data } = await client().from(RECORDS).select("*").eq("org_id", orgId).eq("collection", coll).eq("id", id).maybeSingle();
  return data ? flatten(data) : undefined;
}

export async function create(orgId: string, coll: string, data: Record<string, any>): Promise<Rec> {
  await ensureSeeded();
  const ts = now();
  const row = { id: newId(coll), org_id: orgId, collection: coll, data: stripMeta(data), created_at: ts, updated_at: ts };
  await client().from(RECORDS).insert(row);
  return flatten(row);
}

export async function update(orgId: string, coll: string, id: string, patch: Record<string, any>): Promise<Rec | undefined> {
  const existing = await get(orgId, coll, id);
  if (!existing) return undefined;
  const data = { ...stripMeta(existing), ...stripMeta(patch) };
  const ts = now();
  await client().from(RECORDS).update({ data, updated_at: ts }).eq("org_id", orgId).eq("collection", coll).eq("id", id);
  return { ...existing, ...data, updatedAt: ts };
}

export async function remove(orgId: string, coll: string, id: string): Promise<boolean> {
  await ensureSeeded();
  const { error } = await client().from(RECORDS).delete().eq("org_id", orgId).eq("collection", coll).eq("id", id);
  return !error;
}

// ---- Sessions ----
export async function createSession(userId: string, orgId: string): Promise<string> {
  await ensureSeeded();
  const token = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  await client().from(SESSIONS).insert({ token, user_id: userId, org_id: orgId, created_at: now() });
  return token;
}

export async function getSession(token: string | undefined) {
  if (!token) return null;
  await ensureSeeded();
  const { data: s } = await client().from(SESSIONS).select("*").eq("token", token).maybeSingle();
  if (!s) return null;
  const user = await get(s.org_id, "users", s.user_id);
  return user ? { token: s.token, userId: s.user_id, orgId: s.org_id, createdAt: s.created_at, user } : null;
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await client().from(SESSIONS).delete().eq("token", token);
}

export async function findUserByEmail(email: string) {
  await ensureSeeded();
  // Global lookup across all orgs (email is the login identity).
  const { data } = await client().from(RECORDS).select("*").eq("collection", "users");
  return (data || []).map(flatten).find((u) => String(u.email).toLowerCase() === email.toLowerCase());
}

export async function createOrg(input: { name: string; industry?: string }): Promise<Org> {
  await ensureSeeded();
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
  await client().from(ORGS).insert({ id, data: org });
  for (const ch of SEED_CHANNELS) await create(id, "channels", ch);
  return org;
}

export async function resetDb() {
  const c = client();
  await c.from(SESSIONS).delete().eq("org_id", SEED_ORG.id);
  await c.from(RECORDS).delete().eq("org_id", SEED_ORG.id);
  await c.from(ORGS).delete().eq("id", SEED_ORG.id);
  seeded = false;
  await ensureSeeded();
}
