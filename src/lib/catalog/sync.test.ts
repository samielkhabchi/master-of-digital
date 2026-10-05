import { describe, expect, it, vi } from "vitest";
import { buildCatalog, ownershipOf } from "./sync";
import { mockSource } from "@/lib/digiseller/mock";
import type { CatalogSource } from "@/lib/digiseller/source";
import type { Catalog } from "./types";

const SELLER = 1000001;
const empty: Catalog = { syncedAt: null, sellerId: SELLER, categories: [], products: [] };

describe("ownershipOf", () => {
  it("classifies by seller id", () => {
    expect(ownershipOf(SELLER, SELLER)).toBe("own");
    expect(ownershipOf(2, SELLER)).toBe("partner");
    expect(ownershipOf(null, SELLER)).toBe("unknown");
  });
});

describe("buildCatalog", () => {
  it("imports every category and product with both languages and currencies", async () => {
    const { catalog, report } = await buildCatalog({ source: mockSource, sellerId: SELLER, previous: empty });
    expect(report.ok).toBe(true);
    expect(catalog!.categories).toHaveLength(8);
    expect(catalog!.products).toHaveLength(20);
    const win = catalog!.products.find((p) => p.id === 4100012)!;
    expect(win.name.ru).toContain("ключ");
    expect(win.price.USD).toBe(14.99);
    expect(win.price.RUB).toBeGreaterThan(1000);
    expect(win.categoryIds).toEqual([22]);
    const sub = catalog!.categories.find((c) => c.id === 22)!;
    expect(sub.parentId).toBe(20);
    expect(sub.name.ru).toBe("Лицензии ПО");
  });

  it("detects own vs partner items from item info", async () => {
    const { catalog, report } = await buildCatalog({ source: mockSource, sellerId: SELLER, previous: empty });
    expect(catalog!.products.find((p) => p.id === 4100001)!.ownership).toBe("own");
    expect(catalog!.products.find((p) => p.id === 4100003)!.ownership).toBe("partner");
    expect(report.own + report.partner).toBe(20);
    expect(report.unknown).toBe(0);
  });

  it("reports added and removed items and keeps firstSeenAt", async () => {
    const first = await buildCatalog({ source: mockSource, sellerId: SELLER, previous: empty, now: new Date("2026-01-01") });
    const prev = first.catalog!;
    prev.products.push({ ...prev.products[0], id: 999 });
    const second = await buildCatalog({ source: mockSource, sellerId: SELLER, previous: prev, now: new Date("2026-01-02") });
    expect(second.report.removed).toEqual([999]);
    expect(second.report.added).toEqual([]);
    expect(second.catalog!.products[0].firstSeenAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("reuses fresh item details instead of refetching", async () => {
    const first = await buildCatalog({ source: mockSource, sellerId: SELLER, previous: empty });
    const spy = vi.fn(mockSource.fetchProductData);
    const source: CatalogSource = { ...mockSource, fetchProductData: spy };
    await buildCatalog({ source, sellerId: SELLER, previous: first.catalog! });
    expect(spy).not.toHaveBeenCalled();
  });

  it("keeps the previous snapshot when a category listing fails", async () => {
    const source: CatalogSource = {
      ...mockSource,
      fetchCategoryProducts: async (...args) => {
        if (args[1] === 21) throw new Error("HTTP 503");
        return mockSource.fetchCategoryProducts(...args);
      },
    };
    const { catalog, report } = await buildCatalog({ source, sellerId: SELLER, previous: empty });
    expect(catalog).toBeNull();
    expect(report.ok).toBe(false);
    expect(report.errors.join()).toContain("category 21");
  });

  it("refuses to run without a seller id", async () => {
    const { catalog, report } = await buildCatalog({ source: mockSource, sellerId: 0, previous: empty });
    expect(catalog).toBeNull();
    expect(report.errors[0]).toMatch(/SELLER_ID/);
  });
});
