// Thin client for Digiseller's public catalog API.
// Docs: https://my.digiseller.com/inside/api_catgoods.asp
//
// Field names are read defensively (several candidates per value) because the
// API mixes naming styles between endpoints and versions.

import { config } from "@/lib/config";

export type ApiLang = "en-US" | "ru-RU";
export type ApiCurrency = "USD" | "RUR";

export interface RawCategory {
  id: number;
  name: string;
  sub?: RawCategory[] | null;
}

export interface RawListProduct {
  id: number;
  name: string;
  price: number | null;
  oldPrice: number | null;
  salePercent: number | null;
  isAvailable: boolean;
  sellerId: number | null;
}

export interface RawProductData {
  id: number;
  name: string;
  info: string;
  addInfo: string;
  price: number | null;
  isAvailable: boolean;
  sellerId: number | null;
  sellerName: string | null;
  sales: number | null;
  goodReviews: number | null;
  badReviews: number | null;
  images: string[];
}

export class DigisellerError extends Error {}

type Json = Record<string, unknown>;

export function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(",", ".").replace(/\s/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function pick(obj: Json | undefined | null, ...keys: string[]): unknown {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function asArray<T = Json>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === "object") return [v as T];
  return [];
}

async function getJson(path: string, params: Record<string, string | number>): Promise<Json> {
  const url = new URL(config.apiBase.replace(/\/$/, "") + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      });
      if (res.status === 429 || res.status >= 500) {
        throw new DigisellerError(`HTTP ${res.status} for ${url.pathname}`);
      }
      if (!res.ok) {
        // 4xx other than 429 will not get better on retry.
        throw Object.assign(new DigisellerError(`HTTP ${res.status} for ${url.pathname}`), {
          fatal: true,
        });
      }
      const body = (await res.json()) as Json;
      const retval = num(body.retval);
      if (retval != null && retval !== 0) {
        throw Object.assign(
          new DigisellerError(`Digiseller retval ${retval} (${str(body.retdesc)}) for ${url.pathname}`),
          { fatal: true },
        );
      }
      return body;
    } catch (err) {
      lastErr = err;
      if ((err as { fatal?: boolean }).fatal) break;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
  throw lastErr instanceof Error ? lastErr : new DigisellerError(String(lastErr));
}

function parseCategory(raw: Json): RawCategory {
  return {
    id: num(raw.id) ?? 0,
    name: str(raw.name),
    sub: asArray<Json>(raw.sub).map(parseCategory),
  };
}

/** The seller's shop category tree (includes categories holding partner items). */
export async function fetchCategories(sellerId: number, lang: ApiLang): Promise<RawCategory[]> {
  const body = await getJson("/categories", { seller_id: sellerId, category_id: 0, lang });
  return asArray<Json>(pick(body, "category", "categories")).map(parseCategory);
}

export function parseListProduct(raw: Json): RawListProduct {
  const sale = (pick(raw, "sale_info") as Json | undefined) ?? undefined;
  const salePercent = num(pick(sale, "sale_percent", "percent"));
  const oldPrice = num(pick(sale, "common_base_price", "base_price"));
  return {
    id: num(raw.id) ?? 0,
    name: str(raw.name),
    price: num(pick(raw, "price")),
    oldPrice: salePercent ? oldPrice : null,
    salePercent: salePercent || null,
    isAvailable: num(pick(raw, "is_available")) !== 0,
    sellerId: num(pick(raw, "id_seller", "seller_id")),
  };
}

/** One page of products in a shop category, priced in the requested currency. */
export async function fetchCategoryProducts(
  sellerId: number,
  categoryId: number,
  lang: ApiLang,
  currency: ApiCurrency,
  page: number,
  rows = 100,
): Promise<{ products: RawListProduct[]; totalPages: number }> {
  const body = await getJson("/shop/products", {
    seller_id: sellerId,
    category_id: categoryId,
    lang,
    currency,
    page,
    rows,
  });
  return {
    products: asArray<Json>(pick(body, "product", "products")).map(parseListProduct),
    totalPages: num(pick(body, "totalPages", "pages")) ?? 1,
  };
}

export function parseProductData(body: Json): RawProductData {
  const p = (pick(body, "product") as Json | undefined) ?? body;
  const seller = pick(p, "seller") as Json | undefined;
  const stats = pick(p, "statistics") as Json | undefined;
  const prices = pick(p, "prices") as Json | undefined;
  const defaultPrice = pick(prices, "default") as Json | undefined;
  const images = asArray<Json>(pick(p, "preview_imgs"))
    .map((img) => str(pick(img, "url")))
    .filter(Boolean);
  return {
    id: num(p.id) ?? 0,
    name: str(p.name),
    info: str(pick(p, "info")),
    addInfo: str(pick(p, "add_info")),
    price: num(pick(defaultPrice, "price")) ?? num(pick(p, "price")),
    isAvailable: num(pick(p, "is_available")) !== 0,
    sellerId: num(pick(seller, "id")) ?? num(pick(p, "id_seller", "seller_id")),
    sellerName: (pick(seller, "name") as string | undefined) ?? null,
    sales: num(pick(stats, "sales")),
    goodReviews: num(pick(stats, "good_reviews")),
    badReviews: num(pick(stats, "bad_reviews")),
    images,
  };
}

/** Item info: description, seller and sales statistics. */
export async function fetchProductData(
  productId: number,
  lang: ApiLang,
  currency: ApiCurrency,
): Promise<RawProductData> {
  const body = await getJson(`/products/${productId}/data`, { lang, currency });
  return parseProductData(body);
}
