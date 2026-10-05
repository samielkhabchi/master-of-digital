import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView, type CatalogSearchParams } from "@/components/CatalogView";
import { readCatalog } from "@/lib/catalog/store";
import { isLocale, t } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<CatalogSearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).searchResults, robots: { index: false } } : {};
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const catalog = await readCatalog();
  return (
    <CatalogView
      catalog={catalog}
      locale={locale}
      searchParams={sp}
      basePath={`/${locale}/search`}
      title={q ? `${t(locale).searchResults}: “${q}”` : t(locale).searchResults}
    />
  );
}
