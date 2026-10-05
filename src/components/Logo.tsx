import Link from "next/link";
import type { Locale } from "@/lib/i18n";

/** Placeholder mark until the final logo is ready: an "M" chevron with a lime spark. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="mod-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7d63ff" />
          <stop offset="1" stopColor="#4a2bdc" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#mod-g)" />
      <path d="M10 28V13l10 9 10-9v15" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="31" cy="9" r="3.2" fill="#c8f53c" />
    </svg>
  );
}

export function Logo({ locale, dark = false }: { locale: Locale; dark?: boolean }) {
  return (
    <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2.5" aria-label="Master Of Digital">
      <LogoMark />
      <span className={`leading-none ${dark ? "text-white" : "text-ink"}`}>
        <span className="block text-[15px] font-extrabold tracking-tight">Master Of</span>
        <span className="block text-[15px] font-extrabold tracking-tight text-violet">Digital</span>
      </span>
    </Link>
  );
}
