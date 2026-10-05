import { NextResponse } from "next/server";
import { readCatalog, readReport } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [catalog, report] = await Promise.all([readCatalog(), readReport()]);
  return NextResponse.json({
    ok: true,
    products: catalog.products.length,
    syncedAt: catalog.syncedAt,
    lastSyncOk: report?.ok ?? null,
    lastSyncAt: report?.finishedAt ?? null,
  });
}
