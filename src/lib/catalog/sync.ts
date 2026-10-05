// Pulls the whole Digiseller shop (category tree + every item in it, own and
// partner) and turns it into a Catalog snapshot.

import { config } from "@/lib/config";
import type { ApiCurrency, ApiLang, RawCategory, RawListProduct } from "@/lib/digiseller/client";
import { getSource, type CatalogSource } from "@/lib/digiseller/source";
import { readCatalog, writeCatalog, writeReport } from "./store";
import type { Catalog, Category, Ownership, Product, SyncReport } from "./types";

const VARIANTS: { key: "en" | "ru"; lang: ApiLang; currency: ApiCurrency; priceKey: "USD" | "RUB" }[] = [
  { key: "en", lang: "en-US", currency: "USD", priceKey: "USD" },
  { key: "ru", lang: "ru-RU", currency: "RUR", priceKey: "RUB" },
];

export function ownershipOf(productSellerId: number | null, ownSellerId: number): Ownership {
  if (productSellerId == null || !ownSellerId) return "unknown";
  return productSellerId === ownSellerId ? "own" : "partner";
}

function flatten(tree: RawCategory[], parentId: number | null, out: { id: number; parentId: number | null; name: string }[]) {
  for (const c of tree) {
    out.push({ id: c.id, parentId, name: c.name });
    if (c.sub?.length) flatten(c.sub, c.id, out);
  }
  return out;
}

/** Run async jobs with bounded concurrency so we don't hammer the API. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export interface BuildOptions {
  source: CatalogSource;
  sellerId: number;
  previous: Catalog;
  now?: Date;
  detailsMaxAgeHours?: number;
  concurrency?: number;
}

export async function buildCatalog(opts: BuildOptions): Promise<{ catalog: Catalog | null; report: SyncReport }> {
  const { source, sellerId, previous } = opts;
  const now = opts.now ?? new Date();
  const nowIso = now.toISOString();
  const maxAgeMs = (opts.detailsMaxAgeHours ?? 24) * 3600_000;
  const concurrency = opts.concurrency ?? 4;
  const errors: string[] = [];

  const report = (partial: Partial<SyncReport>): SyncReport => ({
    ok: false,
    startedAt: nowIso,
    finishedAt: new Date().toISOString(),
    categories: 0,
    products: 0,
    added: [],
    removed: [],
    own: 0,
    partner: 0,
    unknown: 0,
    errors,
    ...partial,
  });

  if (!sellerId) {
    errors.push("DIGISELLER_SELLER_ID is not set");
    return { catalog: null, report: report({}) };
  }

  // 1. Category tree in both languages, merged by id.
  let enTree: RawCategory[], ruTree: RawCategory[];
  try {
    [enTree, ruTree] = await Promise.all([
      source.fetchCategories(sellerId, "en-US"),
      source.fetchCategories(sellerId, "ru-RU"),
    ]);
  } catch (err) {
    errors.push(`categories: ${(err as Error).message}`);
    return { catalog: null, report: report({}) };
  }
  const ruNames = new Map(flatten(ruTree, null, []).map((c) => [c.id, c.name]));
  const categories: Category[] = flatten(enTree, null, []).map((c, order) => ({
    id: c.id,
    parentId: c.parentId,
    name: { en: c.name, ru: ruNames.get(c.id) || c.name },
    order,
  }));

  // 2. Every product in every category, once per language/currency.
  type Acc = { order: number; categoryIds: Set<number>; listSellerId: number | null } & {
    [K in "en" | "ru"]?: RawListProduct;
  };
  const acc = new Map<number, Acc>();
  let seq = 0;
  const jobs = categories.flatMap((c) => VARIANTS.map((v) => ({ c, v })));
  let listingFailed = false;

  await mapLimit(jobs, concurrency, async ({ c, v }) => {
    try {
      for (let page = 1, total = 1; page <= total; page++) {
        const res = await source.fetchCategoryProducts(sellerId, c.id, v.lang, v.currency, page);
        total = Math.min(res.totalPages, 50);
        for (const p of res.products) {
          if (!p.id) continue;
          let entry = acc.get(p.id);
          if (!entry) {
            entry = { order: seq++, categoryIds: new Set(), listSellerId: null };
            acc.set(p.id, entry);
          }
          entry.categoryIds.add(c.id);
          entry[v.key] = p;
          entry.listSellerId ??= p.sellerId;
        }
      }
    } catch (err) {
      listingFailed = true;
      errors.push(`category ${c.id} (${v.lang}): ${(err as Error).message}`);
    }
  });

  // A partial listing would make items look "removed". Keep the previous snapshot instead.
  if (listingFailed) return { catalog: null, report: report({}) };

  // 3. Per-item details (seller id → ownership, sales stats), cached between syncs.
  const prevById = new Map(previous.products.map((p) => [p.id, p]));
  const ids = [...acc.keys()];
  const details = new Map<number, Pick<Product, "sellerId" | "sellerName" | "sales" | "goodReviews" | "badReviews" | "detailsFetchedAt">>();

  await mapLimit(ids, concurrency, async (id) => {
    const prev = prevById.get(id);
    const fresh =
      prev?.detailsFetchedAt && prev.sellerId != null && now.getTime() - Date.parse(prev.detailsFetchedAt) < maxAgeMs;
    if (fresh) {
      details.set(id, prev);
      return;
    }
    try {
      const d = await source.fetchProductData(id, "en-US", "USD");
      details.set(id, {
        sellerId: d.sellerId,
        sellerName: d.sellerName,
        sales: d.sales,
        goodReviews: d.goodReviews,
        badReviews: d.badReviews,
        detailsFetchedAt: nowIso,
      });
    } catch (err) {
      errors.push(`product ${id} details: ${(err as Error).message}`);
      if (prev) details.set(id, prev);
    }
  });

  // 4. Assemble products.
  const products: Product[] = ids.map((id) => {
    const a = acc.get(id)!;
    const en = a.en ?? a.ru!;
    const ru = a.ru ?? a.en!;
    const d = details.get(id);
    const prev = prevById.get(id);
    const productSellerId = d?.sellerId ?? a.listSellerId ?? null;
    return {
      id,
      name: { en: en.name, ru: ru.name },
      categoryIds: [...a.categoryIds],
      price: { USD: a.en?.price ?? null, RUB: a.ru?.price ?? null },
      oldPrice: { USD: a.en?.oldPrice ?? null, RUB: a.ru?.oldPrice ?? null },
      salePercent: en.salePercent ?? ru.salePercent ?? null,
      isAvailable: en.isAvailable && ru.isAvailable,
      sellerId: productSellerId,
      sellerName: d?.sellerName ?? null,
      ownership: ownershipOf(productSellerId, sellerId),
      sales: d?.sales ?? null,
      goodReviews: d?.goodReviews ?? null,
      badReviews: d?.badReviews ?? null,
      order: a.order,
      firstSeenAt: prev?.firstSeenAt ?? nowIso,
      detailsFetchedAt: d?.detailsFetchedAt ?? null,
    };
  });

  const newIds = new Set(ids);
  const catalog: Catalog = { syncedAt: nowIso, sellerId, categories, products };
  return {
    catalog,
    report: report({
      ok: true,
      categories: categories.length,
      products: products.length,
      added: ids.filter((id) => !prevById.has(id)),
      removed: previous.products.filter((p) => !newIds.has(p.id)).map((p) => p.id),
      own: products.filter((p) => p.ownership === "own").length,
      partner: products.filter((p) => p.ownership === "partner").length,
      unknown: products.filter((p) => p.ownership === "unknown").length,
    }),
  };
}

let running: Promise<SyncReport> | null = null;

/** Sync from Digiseller and persist. Concurrent calls share one run. */
export function runSync(): Promise<SyncReport> {
  running ??= (async () => {
    try {
      const previous = await readCatalog();
      const sellerId = config.sellerId || (config.mock ? 1000001 : 0);
      const { catalog, report } = await buildCatalog({
        source: getSource(),
        sellerId,
        previous,
        detailsMaxAgeHours: config.detailsMaxAgeHours,
      });
      if (catalog) await writeCatalog(catalog);
      await writeReport(report);
      console.log(
        `[sync] ${report.ok ? "ok" : "FAILED"}: ${report.products} products, ${report.categories} categories, ` +
          `+${report.added.length} -${report.removed.length}, ${report.errors.length} errors`,
      );
      for (const e of report.errors.slice(0, 10)) console.warn(`[sync] ${e}`);
      return report;
    } finally {
      running = null;
    }
  })();
  return running;
}
