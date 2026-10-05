// Catalog snapshot persisted as a JSON file. At ≤200 products a database adds
// nothing; the file keeps the last good sync so the site works while Digiseller is down.

import fs from "node:fs/promises";
import path from "node:path";
import { config } from "@/lib/config";
import type { Catalog, SyncReport } from "./types";

const catalogFile = () => path.join(config.dataDir, "catalog.json");
const reportFile = () => path.join(config.dataDir, "last-sync.json");

let cache: { mtimeMs: number; catalog: Catalog } | null = null;

export function emptyCatalog(): Catalog {
  return { syncedAt: null, sellerId: config.sellerId, categories: [], products: [] };
}

export async function readCatalog(): Promise<Catalog> {
  try {
    const stat = await fs.stat(catalogFile());
    if (cache && cache.mtimeMs === stat.mtimeMs) return cache.catalog;
    const catalog = JSON.parse(await fs.readFile(catalogFile(), "utf8")) as Catalog;
    cache = { mtimeMs: stat.mtimeMs, catalog };
    return catalog;
  } catch {
    return emptyCatalog();
  }
}

async function writeAtomic(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

export async function writeCatalog(catalog: Catalog) {
  await writeAtomic(catalogFile(), catalog);
  cache = null;
}

export async function writeReport(report: SyncReport) {
  await writeAtomic(reportFile(), report);
}

export async function readReport(): Promise<SyncReport | null> {
  try {
    return JSON.parse(await fs.readFile(reportFile(), "utf8")) as SyncReport;
  } catch {
    return null;
  }
}
