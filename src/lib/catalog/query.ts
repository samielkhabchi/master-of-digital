import { config } from "@/lib/config";
import { localeSettings, type Locale } from "@/lib/i18n";
import type { Catalog, Category, Product } from "./types";

export type SortKey = "popular" | "price-asc" | "price-desc" | "name";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const productPath = (locale: Locale, p: Product) => `/${locale}/p/${p.id}-${slugify(p.name.en)}`;
export const categoryPath = (locale: Locale, c: Category) => `/${locale}/c/${c.id}-${slugify(c.name.en)}`;

/** Leading numeric id from a "123-some-slug" route segment. */
export function idFromSegment(segment: string): number | null {
  const m = /^(\d+)/.exec(decodeURIComponent(segment));
  return m ? Number(m[1]) : null;
}

export function priceOf(p: Product, locale: Locale): number | null {
  return p.price[localeSettings[locale].currency];
}

export function oldPriceOf(p: Product, locale: Locale): number | null {
  return p.oldPrice[localeSettings[locale].currency];
}

export function childrenOf(catalog: Catalog, parentId: number | null): Category[] {
  return catalog.categories.filter((c) => c.parentId === parentId).sort((a, b) => a.order - b.order);
}

export function descendantIds(catalog: Catalog, id: number): Set<number> {
  const ids = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of catalog.categories) {
      if (c.parentId != null && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        grew = true;
      }
    }
  }
  return ids;
}

export function ancestors(catalog: Catalog, id: number): Category[] {
  const byId = new Map(catalog.categories.map((c) => [c.id, c]));
  const chain: Category[] = [];
  let cur = byId.get(id);
  while (cur && chain.length < 20) {
    chain.unshift(cur);
    cur = cur.parentId != null ? byId.get(cur.parentId) : undefined;
  }
  return chain;
}

export function countInCategory(catalog: Catalog, id: number): number {
  const ids = descendantIds(catalog, id);
  return catalog.products.filter((p) => p.categoryIds.some((c) => ids.has(c))).length;
}

export interface ProductFilter {
  categoryId?: number;
  query?: string;
  min?: number;
  max?: number;
  inStock?: boolean;
  sort?: SortKey;
}

export function filterProducts(catalog: Catalog, locale: Locale, f: ProductFilter): Product[] {
  let list = catalog.products;
  if (f.categoryId != null) {
    const ids = descendantIds(catalog, f.categoryId);
    list = list.filter((p) => p.categoryIds.some((c) => ids.has(c)));
  }
  if (f.query) {
    const terms = f.query.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter((p) => {
      const hay = `${p.name.en} ${p.name.ru} ${p.id}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }
  if (f.min != null) list = list.filter((p) => (priceOf(p, locale) ?? 0) >= f.min!);
  if (f.max != null) list = list.filter((p) => (priceOf(p, locale) ?? Infinity) <= f.max!);
  if (f.inStock) list = list.filter((p) => p.isAvailable);
  return sortProducts(list, locale, f.sort ?? "popular");
}

export function sortProducts(list: Product[], locale: Locale, sort: SortKey): Product[] {
  const out = [...list];
  const price = (p: Product) => priceOf(p, locale) ?? Infinity;
  switch (sort) {
    case "price-asc":
      return out.sort((a, b) => price(a) - price(b));
    case "price-desc":
      return out.sort((a, b) => price(b) - price(a));
    case "name":
      return out.sort((a, b) => a.name[locale].localeCompare(b.name[locale], locale));
    default:
      // In-stock first, then by sales, then the seller's own ordering.
      return out.sort(
        (a, b) =>
          Number(b.isAvailable) - Number(a.isAvailable) ||
          (b.sales ?? 0) - (a.sales ?? 0) ||
          a.order - b.order,
      );
  }
}

export function newest(catalog: Catalog, n: number): Product[] {
  return [...catalog.products]
    .filter((p) => p.isAvailable)
    .sort((a, b) => b.firstSeenAt.localeCompare(a.firstSeenAt) || b.id - a.id)
    .slice(0, n);
}

/**
 * Digiseller checkout link. Own items go straight to checkout; partner items
 * (and items whose seller we could not determine) carry the affiliate id so
 * the commission is credited.
 */
export function checkoutUrl(p: Pick<Product, "id" | "ownership">, locale: Locale): string {
  const s = localeSettings[locale];
  const url = new URL(
    config.checkoutUrl
      .replace("{id}", String(p.id))
      .replace("{lang}", s.lang)
      .replace("{cur}", s.apiCurrency),
  );
  if (p.ownership !== "own" && config.agentId) {
    url.searchParams.set(config.agentParam, String(config.agentId));
  }
  return url.toString();
}

/** Product cover from Digiseller's image service. Null in mock mode (no real images). */
export function imageUrl(id: number, size = 400): string | null {
  if (config.mock) return null;
  return `https://graph.digiseller.ru/img.ashx?id_d=${id}&w=${size}&h=${size}&crop=true`;
}
