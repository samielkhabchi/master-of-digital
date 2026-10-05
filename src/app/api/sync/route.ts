import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { readReport } from "@/lib/catalog/store";
import { runSync } from "@/lib/catalog/sync";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  if (!config.syncSecret) return false;
  return req.headers.get("authorization") === `Bearer ${config.syncSecret}`;
}

/** Last sync report. */
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await readReport());
}

/** Trigger a sync now (e.g. right after editing the Digiseller shop). */
export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const report = await runSync();
  return NextResponse.json(report, { status: report.ok ? 200 : 502 });
}
