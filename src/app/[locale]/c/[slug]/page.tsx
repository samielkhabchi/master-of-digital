import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CatalogView, type CatalogSearchParams } from "@/components/CatalogView";
import { categoryPath, idFromSegment } from "@/lib/catalog/query";
import { readCatalog } from "@/lib/catalog/store";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<CatalogSearchParams> };

async function load(props: Props) {
  const { locale, slug } = await props.params;
  if (!isLocale(locale)) notFound();
  const id = idFromSegment(slug);
  const catalog = await readCatalog();
  const category = catalog.categories.find((c) => c.id === id);
  if (!category) notFound();
  return { locale, slug, catalog, category };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, category } = await load(props);
  return { title: category.name[locale], alternates: { canonical: categoryPath(locale, category) } };
}

export default async function CategoryPage(props: Props) {
  const { locale, slug, catalog, category } = await load(props);
  const path = categoryPath(locale, category);
  if (`/${locale}/c/${decodeURIComponent(slug)}` !== path) permanentRedirect(path);
  return (
    <CatalogView
      catalog={catalog}
      locale={locale}
      category={category}
      searchParams={await props.searchParams}
      basePath={path}
      title={category.name[locale]}
    />
  );
}
