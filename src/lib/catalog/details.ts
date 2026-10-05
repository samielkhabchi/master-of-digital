// Live item info for the product page (description, images), cached briefly in memory.

import sanitizeHtml from "sanitize-html";
import { getSource } from "@/lib/digiseller/source";
import { localeSettings, type Locale } from "@/lib/i18n";
import type { ProductDetails } from "./types";

const TTL_MS = 10 * 60_000;
const cache = new Map<string, { at: number; value: ProductDetails }>();

/** Digiseller descriptions are seller-authored HTML or plain text; keep only safe formatting. */
export function cleanDescription(raw: string): string {
  if (!raw.trim()) return "";
  const html = /<[a-z][\s\S]*>/i.test(raw) ? raw : raw.replace(/\r?\n/g, "<br>");
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "b", "strong", "i", "em", "u", "s", "ul", "ol", "li", "a", "span", "div", "h3", "h4", "img", "hr", "blockquote", "code"],
    allowedAttributes: { a: ["href", "title"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["https", "http"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "nofollow noopener noreferrer" }),
    },
  });
}

export async function getProductDetails(id: number, locale: Locale): Promise<ProductDetails | null> {
  const key = `${id}:${locale}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  try {
    const { lang, apiCurrency } = localeSettings[locale];
    const d = await getSource().fetchProductData(id, lang, apiCurrency);
    const value: ProductDetails = {
      id: d.id,
      name: d.name,
      info: cleanDescription(d.info),
      addInfo: cleanDescription(d.addInfo),
      price: d.price,
      sellerId: d.sellerId,
      sellerName: d.sellerName,
      isAvailable: d.isAvailable,
      images: d.images,
    };
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (err) {
    console.warn(`[details] product ${id}: ${(err as Error).message}`);
    return hit?.value ?? null;
  }
}
