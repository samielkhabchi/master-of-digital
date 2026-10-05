import Link from "next/link";
import { t, type Locale } from "@/lib/i18n";
import {
  ancestors,
  categoryPath,
  childrenOf,
  countInCategory,
  filterProducts,
  type SortKey,
} from "@/lib/catalog/query";
import type { Catalog, Category } from "@/lib/catalog/types";
import { ProductGrid } from "./ProductCard";
import { SortSelect } from "./SortSelect";
import { ChevronRight } from "./icons";

const PAGE_SIZE = 30;
const SORTS: SortKey[] = ["popular", "price-asc", "price-desc", "name"];

export type CatalogSearchParams = { [k: string]: string | string[] | undefined };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const numOrUndef = (v: string) => (v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : undefined);

export function CatalogView({
  catalog,
  locale,
  category,
  searchParams,
  basePath,
  title,
}: {
  catalog: Catalog;
  locale: Locale;
  category?: Category;
  searchParams: CatalogSearchParams;
  basePath: string;
  title: string;
}) {
  const m = t(locale);
  const q = one(searchParams.q).trim();
  const sort = (SORTS as string[]).includes(one(searchParams.sort)) ? (one(searchParams.sort) as SortKey) : "popular";
  const min = numOrUndef(one(searchParams.min));
  const max = numOrUndef(one(searchParams.max));
  const inStock = one(searchParams.stock) === "1";
  const page = Math.max(1, Number.parseInt(one(searchParams.page), 10) || 1);

  const all = filterProducts(catalog, locale, { categoryId: category?.id, query: q, min, max, inStock, sort });
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const visible = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const trail = category ? ancestors(catalog, category.id) : [];
  const activeIds = new Set(trail.map((c) => c.id));
  const parent = trail.length > 1 ? trail[trail.length - 2] : undefined;

  const pageHref = (n: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (k !== "page" && one(v)) sp.set(k, one(v));
    if (n > 1) sp.set("page", String(n));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs font-medium text-muted">
        <Link href={`/${locale}`} className="hover:text-violet">{m.home}</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/${locale}/catalog`} className="hover:text-violet">{m.catalog}</Link>
        {trail.map((c) => (
          <span key={c.id} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            <Link href={categoryPath(locale, c)} className="hover:text-violet">{c.name[locale]}</Link>
          </span>
        ))}
      </nav>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
            {parent && (
              <Link href={categoryPath(locale, parent)} className="mb-2 flex items-center gap-1 text-xs font-bold text-violet">
                ← {parent.name[locale]}
              </Link>
            )}
            <CategoryTree catalog={catalog} locale={locale} parentId={null} activeIds={activeIds} currentId={category?.id} />
          </div>

          <form action={basePath} className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-4">
            {q && <input type="hidden" name="q" value={q} />}
            <input type="hidden" name="sort" value={sort} />
            <fieldset>
              <legend className="mb-2 text-xs font-extrabold tracking-wider text-muted uppercase">{m.price}</legend>
              <div className="flex gap-2">
                <input name="min" inputMode="decimal" defaultValue={min ?? ""} placeholder={m.min} aria-label={m.min} className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-violet focus:outline-none" />
                <input name="max" inputMode="decimal" defaultValue={max ?? ""} placeholder={m.max} aria-label={m.max} className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-violet focus:outline-none" />
              </div>
            </fieldset>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="stock" value="1" defaultChecked={inStock} className="h-4 w-4 accent-violet" />
              {m.inStockOnly}
            </label>
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-ink-2">{m.apply}</button>
              <Link href={basePath} className="flex-1 rounded-lg bg-violet-50 px-3 py-2 text-center text-sm font-bold text-violet hover:bg-violet/15">
                {m.reset}
              </Link>
            </div>
          </form>
        </aside>

        <section>
          <form action={basePath} className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {q && <input type="hidden" name="q" value={q} />}
            {min != null && <input type="hidden" name="min" value={min} />}
            {max != null && <input type="hidden" name="max" value={max} />}
            {inStock && <input type="hidden" name="stock" value="1" />}
            <p className="text-sm text-muted">
              {all.length} {m.items}
            </p>
            <SortSelect
              value={sort}
              label={m.sort}
              options={[
                { value: "popular", label: m.sortPopular },
                { value: "price-asc", label: m.sortPriceAsc },
                { value: "price-desc", label: m.sortPriceDesc },
                { value: "name", label: m.sortName },
              ]}
            />
          </form>

          {visible.length ? (
            <ProductGrid products={visible} locale={locale} />
          ) : (
            <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface p-10 text-center text-muted">
              {catalog.products.length ? m.nothingFound : m.emptyCatalog}
            </p>
          )}

          {pages > 1 && (
            <nav className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={pageHref(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold ${n === page ? "bg-ink text-white" : "border border-line bg-surface hover:border-violet"}`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}

function CategoryTree({
  catalog,
  locale,
  parentId,
  activeIds,
  currentId,
  depth = 0,
}: {
  catalog: Catalog;
  locale: Locale;
  parentId: number | null;
  activeIds: Set<number>;
  currentId?: number;
  depth?: number;
}) {
  const items = childrenOf(catalog, parentId);
  if (!items.length) return null;
  return (
    <ul className={depth ? "mt-1 ml-3 border-l border-line pl-2" : "space-y-0.5"}>
      {depth === 0 && (
        <li>
          <Link
            href={`/${locale}/catalog`}
            className={`block rounded-lg px-2 py-1.5 text-sm font-semibold ${currentId == null ? "bg-violet-50 text-violet" : "hover:bg-paper"}`}
          >
            {t(locale).allCategories}
          </Link>
        </li>
      )}
      {items.map((c) => (
        <li key={c.id}>
          <Link
            href={categoryPath(locale, c)}
            className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm ${c.id === currentId ? "bg-violet-50 font-bold text-violet" : activeIds.has(c.id) ? "font-bold" : "font-medium hover:bg-paper"}`}
          >
            <span>{c.name[locale]}</span>
            <span className="text-xs text-muted">{countInCategory(catalog, c.id)}</span>
          </Link>
          {activeIds.has(c.id) && (
            <CategoryTree catalog={catalog} locale={locale} parentId={c.id} activeIds={activeIds} currentId={currentId} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
