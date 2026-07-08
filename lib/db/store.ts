// Store facade — routes to the Supabase backend when SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are set, otherwise the dependency-free JSON store.
// Callers import only from here; swapping persistence touches nothing else.

import type { Org } from "./schema";
import * as jsonStore from "./jsonStore";
import * as supabaseStore from "./supabaseStore";

function useSupabase(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
function b() {
  return useSupabase() ? supabaseStore : jsonStore;
}

export function getOrg(orgId: string): Promise<Org | undefined> {
  return b().getOrg(orgId);
}
export function updateOrg(orgId: string, patch: Partial<Org>): Promise<Org | undefined> {
  return b().updateOrg(orgId, patch);
}
export function list(orgId: string, coll: string) {
  return b().list(orgId, coll);
}
export function get(orgId: string, coll: string, id: string) {
  return b().get(orgId, coll, id);
}
export function create(orgId: string, coll: string, data: Record<string, any>) {
  return b().create(orgId, coll, data);
}
export function update(orgId: string, coll: string, id: string, patch: Record<string, any>) {
  return b().update(orgId, coll, id, patch);
}
export function remove(orgId: string, coll: string, id: string) {
  return b().remove(orgId, coll, id);
}
export function createSession(userId: string, orgId: string) {
  return b().createSession(userId, orgId);
}
export function getSession(token: string | undefined) {
  return b().getSession(token);
}
export function destroySession(token: string | undefined) {
  return b().destroySession(token);
}
export function findUserByEmail(email: string) {
  return b().findUserByEmail(email);
}
export function resetDb() {
  return b().resetDb();
}
export function createOrg(input: { name: string; industry?: string }) {
  return b().createOrg(input);
}

export const persistenceMode = () => (useSupabase() ? "supabase" : "json");
