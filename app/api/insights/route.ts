import { NextResponse } from "next/server";
import { getOverview } from "@/lib/dataServer";
import { requireApiSession } from "@/lib/apiServer";

export async function GET() {
  const { error, session } = await requireApiSession();
  if (error) return error;
  const o = await getOverview(session.orgId);
  return NextResponse.json({
    kpis: o.kpis,
    insights: o.insights,
    reorders: o.reorders,
    channels: o.channels,
    topSkus: o.skuPerf.slice(0, 8)
  });
}
