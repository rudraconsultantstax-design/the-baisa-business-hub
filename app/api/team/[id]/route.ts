import { NextResponse } from "next/server";
import { list, get, update, remove } from "@/lib/db/store";
import { requireApiSession, badRequest, notFound } from "@/lib/apiServer";

function canManage(role: string) {
  return role === "owner" || role === "manager";
}
function strip(u: any) {
  const { password, ...rest } = u;
  return rest;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, session } = await requireApiSession();
  if (error) return error;
  if (!canManage(session.user.role)) return NextResponse.json({ error: "Only owners/managers can edit teammates" }, { status: 403 });
  const target = await get(session.orgId, "users", id);
  if (!target) return notFound();
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid body");
  const patch: Record<string, any> = {};
  if (body.name) patch.name = body.name;
  if (body.password) patch.password = body.password;
  if (body.role && ["owner", "manager", "staff"].includes(body.role)) {
    // Guard: don't demote the last remaining owner.
    if (target.role === "owner" && body.role !== "owner") {
      const owners = (await list(session.orgId, "users")).filter((u) => u.role === "owner");
      if (owners.length <= 1) return NextResponse.json({ error: "The workspace needs at least one owner" }, { status: 400 });
    }
    patch.role = body.role;
  }
  const updated = await update(session.orgId, "users", id, patch);
  return NextResponse.json({ data: strip(updated) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, session } = await requireApiSession();
  if (error) return error;
  if (!canManage(session.user.role)) return NextResponse.json({ error: "Only owners/managers can remove teammates" }, { status: 403 });
  if (id === session.userId) return NextResponse.json({ error: "You can't remove yourself" }, { status: 400 });
  const target = await get(session.orgId, "users", id);
  if (!target) return notFound();
  if (target.role === "owner") {
    const owners = (await list(session.orgId, "users")).filter((u) => u.role === "owner");
    if (owners.length <= 1) return NextResponse.json({ error: "The workspace needs at least one owner" }, { status: 400 });
  }
  await remove(session.orgId, "users", id);
  return NextResponse.json({ ok: true });
}
