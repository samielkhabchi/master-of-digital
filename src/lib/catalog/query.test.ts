import { afterEach, describe, expect, it, vi } from "vitest";
import { checkoutUrl, filterProducts, idFromSegment, slugify } from "./query";
import { buildCatalog } from "./sync";
import { mockSource } from "@/lib/digiseller/mock";

afterEach(() => vi.unstubAllEnvs());

async function catalog() {
  const { catalog } = await buildCatalog({
    source: mockSource,
    sellerId: 1000001,
    previous: { syncedAt: null, sellerId: 1000001, categories: [], products: [] },
  });
  return catalog!;
}

describe("checkoutUrl", () => {
  it("adds the affiliate id only for partner/unknown items", () => {
    vi.stubEnv("DIGISELLER_SELLER_ID", "555");
    vi.stubEnv("DIGISELLER_AGENT_ID", "777");
    const own = new URL(checkoutUrl({ id: 1, ownership: "own" }, "en"));
    expect(own.searchParams.get("id_d")).toBe("1");
    expect(own.searchParams.get("ai")).toBeNull();
    expect(own.searchParams.get("lang")).toBe("en-US");
    const partner = new URL(checkoutUrl({ id: 2, ownership: "partner" }, "ru"));
    expect(partner.searchParams.get("ai")).toBe("777");
    expect(partner.searchParams.get("lang")).toBe("ru-RU");
    expect(new URL(checkoutUrl({ id: 3, ownership: "unknown" }, "en")).searchParams.get("ai")).toBe("777");
  });

  it("falls back to the seller id as affiliate id", () => {
    vi.stubEnv("DIGISELLER_SELLER_ID", "555");
    expect(new URL(checkoutUrl({ id: 2, ownership: "partner" }, "en")).searchParams.get("ai")).toBe("555");
  });
});

describe("filterProducts", () => {
  it("includes subcategory items when filtering a parent category", async () => {
    const c = await catalog();
    expect(filterProducts(c, "en", { categoryId: 20 })).toHaveLength(8);
    expect(filterProducts(c, "en", { categoryId: 22 })).toHaveLength(4);
  });

  it("searches across both languages", async () => {
    const c = await catalog();
    expect(filterProducts(c, "en", { query: "windows" }).map((p) => p.id)).toEqual([4100012]);
    expect(filterProducts(c, "en", { query: "подписка" }).length).toBeGreaterThan(0);
  });

  it("filters by price and stock and sorts", async () => {
    const c = await catalog();
    const cheap = filterProducts(c, "en", { max: 5, sort: "price-asc" });
    expect(cheap.every((p) => p.price.USD! <= 5)).toBe(true);
    expect(cheap[0].price.USD).toBeLessThanOrEqual(cheap[cheap.length - 1].price.USD!);
    expect(filterProducts(c, "en", { inStock: true }).some((p) => !p.isAvailable)).toBe(false);
  });
});

describe("route helpers", () => {
  it("slugifies and parses ids", () => {
    expect(slugify("Windows 11 Pro — Key!")).toBe("windows-11-pro-key");
    expect(idFromSegment("4100012-windows-11")).toBe(4100012);
    expect(idFromSegment("abc")).toBeNull();
  });
});
