import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { config } from "@/lib/config";
import { readCatalog } from "@/lib/catalog/store";
import { isLocale, t } from "@/lib/i18n";
import "../globals.css";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });

// Pages read the catalog snapshot written by the sync job, so never pre-render at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = t(locale);
  return {
    metadataBase: new URL(config.siteUrl),
    title: { default: `Master Of Digital — ${m.tagline}`, template: "%s · Master Of Digital" },
    description: m.heroText,
    alternates: { languages: { en: "/en", ru: "/ru" } },
    icons: { icon: "/icon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const catalog = await readCatalog();
  return (
    <html lang={locale} className={manrope.variable}>
      <body className="flex min-h-screen flex-col">
        <Header locale={locale} catalog={catalog} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6">{children}</main>
        <Footer locale={locale} syncedAt={catalog.syncedAt} />
      </body>
    </html>
  );
}
