import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductCard";
import { BoltIcon, ChatIcon, ChevronRight, ShieldIcon } from "@/components/icons";
import { readCatalog } from "@/lib/catalog/store";
import { categoryPath, childrenOf, countInCategory, filterProducts, newest } from "@/lib/catalog/query";
import { isLocale, t } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = t(locale);
  const catalog = await readCatalog();
  const top = childrenOf(catalog, null);
  const popular = filterProducts(catalog, locale, { inStock: true }).slice(0, 10);
  const popularIds = new Set(popular.map((p) => p.id));
  const fresh = newest(catalog, 15).filter((p) => !popularIds.has(p.id)).slice(0, 5);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-ink px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-violet/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:36px_36px]" />
        <div className="relative max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-lime uppercase">
            <BoltIcon className="h-3.5 w-3.5" /> {m.instantDelivery}
          </p>
          <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">{m.heroTitle}</h1>
          <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">{m.heroText}</p>
          <Link
            href={`/${locale}/catalog`}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-lime px-5 py-3 font-bold text-ink transition hover:brightness-95"
          >
            {m.heroCta} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {top.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight">{m.browseCategories}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {top.map((c, i) => (
              <Link
                key={c.id}
                href={categoryPath(locale, c)}
                className="group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-5 transition hover:border-violet/40"
              >
                <span className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full transition group-hover:scale-110 ${["bg-violet/15", "bg-lime/40", "bg-sky-300/30", "bg-pink-300/30"][i % 4]}`} />
                <span className="relative block text-lg font-extrabold">{c.name[locale]}</span>
                <span className="relative mt-1 block text-sm text-muted">
                  {countInCategory(catalog, c.id)} {m.items}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {catalog.products.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface p-10 text-center text-muted">{m.emptyCatalog}</p>
      ) : (
        <>
          <section>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-2xl font-extrabold tracking-tight">{m.popular}</h2>
              <Link href={`/${locale}/catalog`} className="text-sm font-bold text-violet hover:underline">{m.viewAll}</Link>
            </div>
            <ProductGrid products={popular} locale={locale} />
          </section>
          {fresh.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-extrabold tracking-tight">{m.newArrivals}</h2>
              <ProductGrid products={fresh} locale={locale} />
            </section>
          )}
        </>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: BoltIcon, title: m.instantDelivery, text: m.instantDeliveryText },
          { icon: ShieldIcon, title: m.securePayment, text: m.securePaymentText },
          { icon: ChatIcon, title: m.humanSupport, text: m.humanSupportText },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-extrabold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
