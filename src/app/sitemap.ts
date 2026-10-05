import type { MetadataRoute } from "next";
import { config } from "@/lib/config";
import { categoryPath, productPath } from "@/lib/catalog/query";
import { readCatalog } from "@/lib/catalog/store";
import { locales } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await readCatalog();
  const base = config.siteUrl;
  return locales.flatMap((l) => [
    { url: `${base}/${l}`, changeFrequency: "daily" as const, priority: 1 },
    { url: `${base}/${l}/catalog`, changeFrequency: "daily" as const, priority: 0.8 },
    ...catalog.categories.map((c) => ({ url: base + categoryPath(l, c), changeFrequency: "daily" as const, priority: 0.7 })),
    ...catalog.products.map((p) => ({ url: base + productPath(l, p), changeFrequency: "daily" as const, priority: 0.6 })),
  ]);
}
