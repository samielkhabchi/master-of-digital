import Link from "next/link";
import { Suspense } from "react";
import { config } from "@/lib/config";
import { t, type Locale } from "@/lib/i18n";
import { categoryPath, childrenOf } from "@/lib/catalog/query";
import type { Catalog } from "@/lib/catalog/types";
import { Logo } from "./Logo";
import { LocaleSwitch } from "./LocaleSwitch";
import { BagIcon, GridIcon, SearchIcon, SendIcon } from "./icons";

export function Header({ locale, catalog, query = "" }: { locale: Locale; catalog: Catalog; query?: string }) {
  const m = t(locale);
  const top = childrenOf(catalog, null);
  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:gap-4">
        <Logo locale={locale} dark />
        <Link
          href={`/${locale}/catalog`}
          className="ml-auto hidden items-center gap-2 rounded-xl bg-violet px-4 py-2.5 text-sm font-bold transition hover:bg-violet-600 sm:ml-2 sm:flex"
        >
          <GridIcon className="h-4 w-4" />
          {m.catalog}
        </Link>
        <form action={`/${locale}/search`} className="order-last w-full sm:order-none sm:flex-1" role="search">
          <label className="flex items-center gap-2 rounded-xl bg-ink-3 px-3 py-2.5 ring-violet/60 focus-within:ring-2">
            <SearchIcon className="h-4 w-4 text-white/50" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={m.search}
              aria-label={m.search}
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </label>
        </form>
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <Suspense>
            <LocaleSwitch current={locale} />
          </Suspense>
          <a
            href={config.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={m.support}
            aria-label={m.support}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
          >
            <SendIcon className="h-4 w-4" />
          </a>
          <a
            href={config.purchasesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-lime px-3 py-2 text-sm font-bold text-ink transition hover:brightness-95"
          >
            <BagIcon className="h-4 w-4" />
            <span className="hidden md:inline">{m.myPurchases}</span>
          </a>
        </div>
      </div>
      {top.length > 0 && (
        <nav className="border-t border-white/10" aria-label={m.browseCategories}>
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 text-sm [scrollbar-width:none]">
            <Link href={`/${locale}/catalog`} className="rounded-lg px-3 py-1.5 whitespace-nowrap text-white/70 hover:bg-white/10 hover:text-white sm:hidden">
              {m.catalog}
            </Link>
            {top.map((c) => (
              <Link
                key={c.id}
                href={categoryPath(locale, c)}
                className="rounded-lg px-3 py-1.5 font-medium whitespace-nowrap text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {c.name[locale]}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
