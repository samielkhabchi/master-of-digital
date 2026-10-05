import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductGrid } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { BagIcon, ChevronRight, ExternalIcon, SendIcon, StarIcon } from "@/components/icons";
import { config } from "@/lib/config";
import { getProductDetails } from "@/lib/catalog/details";
import {
  ancestors,
  categoryPath,
  filterProducts,
  idFromSegment,
  imageUrl,
  oldPriceOf,
  priceOf,
  productPath,
} from "@/lib/catalog/query";
import { readCatalog } from "@/lib/catalog/store";
import { formatPrice, isLocale, t } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string }> };

async function load(props: Props) {
  const { locale, slug } = await props.params;
  if (!isLocale(locale)) notFound();
  const id = idFromSegment(slug);
  const catalog = await readCatalog();
  // Only items currently in the synced shop are sellable here.
  const product = catalog.products.find((p) => p.id === id);
  if (!product) notFound();
  return { locale, slug, catalog, product };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, product } = await load(props);
  const price = formatPrice(priceOf(product, locale), locale);
  return {
    title: product.name[locale],
    description: `${product.name[locale]} — ${price}. ${t(locale).instantDeliveryText}`,
    alternates: {
      canonical: productPath(locale, product),
      languages: { en: productPath("en", product), ru: productPath("ru", product) },
    },
    openGraph: { images: imageUrl(product.id, 600) ? [imageUrl(product.id, 600)!] : undefined },
  };
}

export default async function ProductPage(props: Props) {
  const { locale, slug, catalog, product } = await load(props);
  const path = productPath(locale, product);
  if (`/${locale}/p/${decodeURIComponent(slug)}` !== path) permanentRedirect(path);

  const m = t(locale);
  const details = await getProductDetails(product.id, locale);
  const name = product.name[locale];
  const price = priceOf(product, locale);
  const old = oldPriceOf(product, locale);
  const available = product.isAvailable && (details?.isAvailable ?? true);
  const trail = product.categoryIds.length ? ancestors(catalog, product.categoryIds[0]) : [];
  const sellerName = product.ownership === "own" ? m.officialStore : (product.sellerName ?? details?.sellerName ?? m.partnerStore);
  const reviews = (product.goodReviews ?? 0) + (product.badReviews ?? 0);
  const rating = reviews ? Math.round((product.goodReviews! / reviews) * 100) : null;
  const related = product.categoryIds.length
    ? filterProducts(catalog, locale, { categoryId: product.categoryIds[0], inStock: true })
        .filter((p) => p.id !== product.id)
        .slice(0, 5)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: imageUrl(product.id, 600) ?? undefined,
    offers: {
      "@type": "Offer",
      price: price ?? undefined,
      priceCurrency: locale === "ru" ? "RUB" : "USD",
      availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${config.siteUrl}${path}`,
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs font-medium text-muted">
        <Link href={`/${locale}`} className="hover:text-violet">{m.home}</Link>
        {trail.map((c) => (
          <span key={c.id} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            <Link href={categoryPath(locale, c)} className="hover:text-violet">{c.name[locale]}</Link>
          </span>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-[1.5rem] border border-line bg-surface">
            <ProductImage src={imageUrl(product.id, 800)} name={name} id={product.id} />
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 text-center">
            <Stat label={m.sales} value={product.sales?.toLocaleString(locale) ?? "—"} />
            <Stat label={m.reviews} value={reviews ? reviews.toLocaleString(locale) : "—"} />
            <Stat
              label={m.positive}
              value={
                rating != null ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <StarIcon className="h-4 w-4" />
                    {rating}%
                  </span>
                ) : (
                  "—"
                )
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-line bg-surface p-6">
            <h1 className="text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">{name}</h1>
            <p className="mt-2 text-sm text-muted">
              {m.seller}: <span className="font-bold text-ink">{sellerName}</span>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-paper p-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight">{formatPrice(price, locale)}</span>
                  {old ? <span className="text-sm text-muted line-through">{formatPrice(old, locale)}</span> : null}
                  {product.salePercent ? (
                    <span className="rounded-md bg-lime px-1.5 py-0.5 text-xs font-extrabold">−{Math.round(product.salePercent)}%</span>
                  ) : null}
                </div>
              </div>
              {available ? (
                <a
                  href={`/${locale}/buy/${product.id}`}
                  rel="nofollow"
                  className="ml-auto inline-flex items-center gap-2 rounded-xl bg-violet px-6 py-3.5 font-bold text-white shadow-[0_10px_24px_-10px_rgba(106,76,255,0.8)] transition hover:bg-violet-600"
                >
                  <BagIcon className="h-5 w-5" />
                  {m.buy}
                  <ExternalIcon className="h-4 w-4 opacity-70" />
                </a>
              ) : (
                <span className="ml-auto rounded-xl bg-line px-6 py-3.5 font-bold text-muted">{m.outOfStock}</span>
              )}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">{m.checkoutNote}</p>
            <a
              href={config.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet hover:underline"
            >
              <SendIcon className="h-4 w-4" />
              {m.humanSupportText}
            </a>
          </div>

          {(details?.info || details?.addInfo) && (
            <div className="rounded-[1.5rem] border border-line bg-surface p-6">
              {details.info && (
                <>
                  <h2 className="mb-3 text-xl font-extrabold">{m.description}</h2>
                  <div className="prose-digi text-sm text-ink/85" dangerouslySetInnerHTML={{ __html: details.info }} />
                </>
              )}
              {details.addInfo && (
                <>
                  <h2 className="mt-6 mb-3 text-xl font-extrabold">{m.moreInfo}</h2>
                  <div className="prose-digi text-sm text-ink/85" dangerouslySetInnerHTML={{ __html: details.addInfo }} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight">{trail.at(-1)?.name[locale] ?? m.popular}</h2>
          <ProductGrid products={related} locale={locale} />
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-lg font-extrabold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
