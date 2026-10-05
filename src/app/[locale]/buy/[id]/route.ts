import { NextResponse } from "next/server";
import { checkoutUrl } from "@/lib/catalog/query";
import { readCatalog } from "@/lib/catalog/store";
import { isLocale } from "@/lib/i18n";

// Redirects to Digiseller checkout. Going through our own URL keeps the affiliate
// logic server-side and lets us refuse items that are no longer in the shop.
export async function GET(req: Request, { params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) return new NextResponse("Not found", { status: 404 });
  const catalog = await readCatalog();
  const product = catalog.products.find((p) => p.id === Number(id));
  if (!product) return NextResponse.redirect(new URL(`/${locale}/catalog`, req.url), 302);
  return NextResponse.redirect(checkoutUrl(product, locale), 302);
}
