"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";

const options: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN · $" },
  { locale: "ru", label: "RU · ₽" },
];

export function LocaleSwitch({ current }: { current: Locale }) {
  const pathname = usePathname() || `/${current}`;
  const search = useSearchParams().toString();
  return (
    <div className="flex rounded-xl bg-white/10 p-1 text-xs font-bold" role="group" aria-label="Language and currency">
      {options.map((o) => {
        const href = pathname.replace(/^\/(en|ru)(?=\/|$)/, `/${o.locale}`) + (search ? `?${search}` : "");
        const active = o.locale === current;
        return (
          <Link
            key={o.locale}
            href={href}
            hrefLang={o.locale}
            aria-current={active ? "true" : undefined}
            className={`rounded-lg px-2.5 py-1.5 transition ${active ? "bg-white text-ink" : "text-white/70 hover:text-white"}`}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}
