import Link from "next/link";
import { config } from "@/lib/config";
import { t, type Locale } from "@/lib/i18n";
import { Logo } from "./Logo";

export function Footer({ locale, syncedAt }: { locale: Locale; syncedAt: string | null }) {
  const m = t(locale);
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Logo locale={locale} />
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink/80">
          <Link href={`/${locale}/catalog`} className="hover:text-violet">{m.catalog}</Link>
          <a href={config.purchasesUrl} target="_blank" rel="noopener noreferrer" className="hover:text-violet">{m.myPurchases}</a>
          <a href={config.telegramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-violet">{m.support}</a>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl border-t border-line px-4 py-5 text-xs text-muted">
        <p>© {new Date().getFullYear()} Master Of Digital. {m.footerRights}</p>
        {syncedAt && (
          <p className="mt-1">
            {m.lastSync}: {new Date(syncedAt).toLocaleString(locale === "ru" ? "ru-RU" : "en-US", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        )}
      </div>
    </footer>
  );
}
