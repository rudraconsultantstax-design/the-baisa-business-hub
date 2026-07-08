import { NextResponse } from "next/server";
import { getOrg, updateOrg, resetDb } from "@/lib/db/store";
import { requireApiSession, badRequest } from "@/lib/apiServer";

export async function GET() {
  const { error, session } = await requireApiSession();
  if (error) return error;
  const org = await getOrg(session.orgId);
  return NextResponse.json({ data: org });
}

export async function PATCH(req: Request) {
  const { error, session } = await requireApiSession({ write: true });
  if (error) return error;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return badRequest("Invalid JSON body");
  // Only allow editable engine/profile fields.
  const allowed = ["name", "industry", "currency", "overheadPct", "rejectPct", "floorMultiplier", "plan"];
  const patch: Record<string, any> = {};
  for (const k of allowed) if (k in body) patch[k] = body[k];
  const org = await updateOrg(session.orgId, patch);
  return NextResponse.json({ data: org });
}

// POST { action: "reset" } → restore seed data (demo convenience).
export async function POST(req: Request) {
  const { error } = await requireApiSession({ write: true });
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  if (body?.action === "reset") {
    await resetDb();
    return NextResponse.json({ ok: true });
  }
  return badRequest("Unknown action");
}
