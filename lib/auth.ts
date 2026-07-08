import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "./db/store";

export const SESSION_COOKIE = "baisa_session";

export async function currentSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return getSession(token);
}

// For server components / pages — redirect to login if not authed.
export async function requireSession() {
  const s = await currentSession();
  if (!s) redirect("/login");
  return s;
}

// For route handlers — returns null instead of redirecting.
export async function sessionFromRequest() {
  return currentSession();
}
