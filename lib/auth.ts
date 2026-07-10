import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, type SessionPayload } from "./session";

export const SESSION_COOKIE = "baisa_session";

export interface Session {
  userId: string;
  orgId: string;
  user: { id: string; name: string; email: string; role: SessionPayload["role"] };
}

function toSession(p: SessionPayload | null): Session | null {
  if (!p) return null;
  return { userId: p.userId, orgId: p.orgId, user: { id: p.userId, name: p.name, email: p.email, role: p.role } };
}

export async function currentSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return toSession(verifySession(token));
}

// For server components / pages — redirect to login if not authed.
export async function requireSession(): Promise<Session> {
  const s = await currentSession();
  if (!s) redirect("/login");
  return s;
}

// For route handlers — returns null instead of redirecting.
export async function sessionFromRequest() {
  return currentSession();
}
