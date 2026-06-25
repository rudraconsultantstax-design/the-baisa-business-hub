import { NextResponse } from "next/server";
import { list, create } from "@/lib/db/store";
import { isApiCollection, requireApiSession, notFound, badRequest } from "@/lib/apiServer";

export async function GET(_req: Request, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!isApiCollection(collection)) return notFound("Unknown collection");
  const { error, session } = await requireApiSession();
  if (error) return error;
  const rows = await list(session.orgId, collection);
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!isApiCollection(collection)) return notFound("Unknown collection");
  const { error, session } = await requireApiSession();
  if (error) return error;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return badRequest("Invalid JSON body");
  const rec = await create(session.orgId, collection, body);
  return NextResponse.json({ data: rec }, { status: 201 });
}
