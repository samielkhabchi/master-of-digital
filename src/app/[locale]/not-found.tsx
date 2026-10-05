import Link from "next/link";

// Rendered inside the locale layout; the locale isn't available here, so show both languages.
export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-7xl font-extrabold text-violet">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">Page not found · Страница не найдена</h1>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/en" className="rounded-xl bg-ink px-5 py-3 font-bold text-white">Home</Link>
        <Link href="/ru" className="rounded-xl bg-violet-50 px-5 py-3 font-bold text-violet">На главную</Link>
      </div>
    </div>
  );
}
