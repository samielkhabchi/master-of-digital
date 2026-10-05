import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView, type CatalogSearchParams } from "@/components/CatalogView";
import { readCatalog } from "@/lib/catalog/store";
import { isLocale, t } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<CatalogSearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).catalog, alternates: { canonical: `/${locale}/catalog` } } : {};
}

export default async function CatalogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const catalog = await readCatalog();
  return (
    <CatalogView
      catalog={catalog}
      locale={locale}
      searchParams={await searchParams}
      basePath={`/${locale}/catalog`}
      title={t(locale).catalog}
    />
  );
}
