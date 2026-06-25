import { NextResponse } from "next/server";
import { currentSession } from "./auth";
import { COLLECTIONS } from "./db/schema";

// Collections reachable through the generic /api/[collection] CRUD endpoints.
// `users` is intentionally excluded (managed via auth only).
export const API_COLLECTIONS: string[] = COLLECTIONS.filter((c) => c !== "users");

export function isApiCollection(name: string): boolean {
  return API_COLLECTIONS.includes(name);
}

export async function requireApiSession() {
  const session = await currentSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export function notFound(msg = "Not found") {
  return NextResponse.json({ error: msg }, { status: 404 });
}
