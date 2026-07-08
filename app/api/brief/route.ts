import { NextResponse } from "next/server";
import { getDailyBrief } from "@/lib/dataServer";
import { requireApiSession } from "@/lib/apiServer";

export async function GET() {
  const { error, session } = await requireApiSession();
  if (error) return error;
  const brief = await getDailyBrief(session.orgId);
  return NextResponse.json(brief);
}
