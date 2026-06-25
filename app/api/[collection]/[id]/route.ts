import { NextResponse } from "next/server";
import { get, update, remove } from "@/lib/db/store";
import { isApiCollection, requireApiSession, notFound, badRequest } from "@/lib/apiServer";

export async function GET(_req: Request, { params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  if (!isApiCollection(collection)) return notFound("Unknown collection");
  const { error, session } = await requireApiSession();
  if (error) return error;
  const rec = await get(session.orgId, collection, id);
  if (!rec) return notFound();
  return NextResponse.json({ data: rec });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  if (!isApiCollection(collection)) return notFound("Unknown collection");
  const { error, session } = await requireApiSession();
  if (error) return error;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return badRequest("Invalid JSON body");
  const rec = await update(session.orgId, collection, id, body);
  if (!rec) return notFound();
  return NextResponse.json({ data: rec });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  if (!isApiCollection(collection)) return notFound("Unknown collection");
  const { error, session } = await requireApiSession();
  if (error) return error;
  const ok = await remove(session.orgId, collection, id);
  if (!ok) return notFound();
  return NextResponse.json({ ok: true });
}
