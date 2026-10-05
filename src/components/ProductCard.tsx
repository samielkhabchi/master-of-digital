import Link from "next/link";
import { formatPrice, t, type Locale } from "@/lib/i18n";
import { imageUrl, oldPriceOf, priceOf, productPath } from "@/lib/catalog/query";
import type { Product } from "@/lib/catalog/types";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const m = t(locale);
  const name = product.name[locale];
  const price = priceOf(product, locale);
  const old = oldPriceOf(product, locale);
  return (
    <Link
      href={productPath(locale, product)}
      className="group flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-2.5 transition hover:-translate-y-0.5 hover:border-violet/40 hover:shadow-[0_12px_30px_-12px_rgba(106,76,255,0.35)]"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-paper">
        <ProductImage src={imageUrl(product.id)} name={name} id={product.id} className="transition duration-300 group-hover:scale-[1.03]" />
        {product.salePercent ? (
          <span className="absolute top-2 left-2 rounded-lg bg-lime px-2 py-0.5 text-xs font-extrabold text-ink">
            −{Math.round(product.salePercent)}%
          </span>
        ) : null}
        {!product.isAvailable && (
          <span className="absolute inset-x-2 bottom-2 rounded-lg bg-ink/80 px-2 py-1 text-center text-xs font-semibold text-white backdrop-blur">
            {m.outOfStock}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pt-3 pb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight">{formatPrice(price, locale)}</span>
          {old ? <span className="text-xs text-muted line-through">{formatPrice(old, locale)}</span> : null}
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm leading-snug font-semibold text-ink/90">{name}</h3>
        {product.sales ? (
          <p className="mt-auto pt-2 text-xs text-muted">
            {product.sales.toLocaleString(locale)} {m.sold}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function ProductGrid({ products, locale }: { products: Product[]; locale: Locale }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} locale={locale} />
      ))}
    </div>
  );
}
