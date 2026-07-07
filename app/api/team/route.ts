import { NextResponse } from "next/server";
import { list, create, findUserByEmail } from "@/lib/db/store";
import { requireApiSession, badRequest } from "@/lib/apiServer";

function canManage(role: string) {
  return role === "owner" || role === "manager";
}
function strip(u: any) {
  const { password, ...rest } = u;
  return rest;
}

export async function GET() {
  const { error, session } = await requireApiSession();
  if (error) return error;
  const users = await list(session.orgId, "users");
  return NextResponse.json({ data: users.map(strip), me: session.userId });
}

export async function POST(req: Request) {
  const { error, session } = await requireApiSession();
  if (error) return error;
  if (!canManage(session.user.role)) return NextResponse.json({ error: "Only owners/managers can invite teammates" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.email || !body?.password) return badRequest("name, email and password required");
  const role = ["owner", "manager", "staff"].includes(body.role) ? body.role : "staff";
  const existing = await findUserByEmail(body.email);
  if (existing) return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
  const user = await create(session.orgId, "users", { name: body.name, email: body.email, role, password: body.password });
  return NextResponse.json({ data: strip(user) }, { status: 201 });
}
