import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrg, create, createSession, findUserByEmail } from "@/lib/db/store";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { orgName, name, email, password } = body as { orgName?: string; name?: string; email?: string; password?: string };
  if (!orgName || !name || !email || !password) {
    return NextResponse.json({ error: "Business name, your name, email and password are all required" }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists — sign in instead" }, { status: 409 });
  }
  const org = await createOrg({ name: orgName });
  const user = await create(org.id, "users", { name, email, role: "owner", password });
  const token = await createSession(user.id, org.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return NextResponse.json({ ok: true, org: { id: org.id, name: org.name } });
}
