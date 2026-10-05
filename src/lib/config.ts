// Runtime configuration. Everything comes from environment variables (read on
// access, so tests can stub them) so the same build can run against the real
// Digiseller shop or the bundled sample data.

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

const env = (name: string, fallback: string) => process.env[name] || fallback;

export const config = {
  /** Your Digiseller seller ID. Items whose seller differs are partner items. */
  get sellerId() {
    return int("DIGISELLER_SELLER_ID", 0);
  },
  /** Affiliate (agent) ID appended to partner checkout links. Defaults to the seller ID. */
  get agentId() {
    return int("DIGISELLER_AGENT_ID", this.sellerId);
  },
  get apiBase() {
    return env("DIGISELLER_API_BASE", "https://api.digiseller.ru/api");
  },
  /** Use bundled sample data instead of calling Digiseller (local dev / demos). */
  get mock() {
    return process.env.DIGISELLER_MOCK === "1";
  },
  /**
   * Checkout URL. Placeholders: {id} product id, {lang} ru-RU|en-US, {cur} USD|RUR.
   * The affiliate parameter is added separately for partner items.
   */
  get checkoutUrl() {
    return env("DIGISELLER_CHECKOUT_URL", "https://www.oplata.info/asp2/pay_wm.asp?id_d={id}&lang={lang}");
  },
  /** Name of the affiliate query parameter on the checkout URL. */
  get agentParam() {
    return env("DIGISELLER_AGENT_PARAM", "ai");
  },
  /** Digiseller buyer area where customers log in by email to see purchases. */
  get purchasesUrl() {
    return env("PURCHASES_URL", "https://www.oplata.info/info/");
  },
  get telegramUrl() {
    return env("TELEGRAM_SUPPORT_URL", "https://t.me/");
  },
  get siteUrl() {
    return env("SITE_URL", "https://masterofdigital.com");
  },
  /** Minutes between automatic catalog syncs. 0 disables the scheduler. */
  get syncIntervalMinutes() {
    return int("SYNC_INTERVAL_MINUTES", 15);
  },
  /** Hours before an item's seller/stats details are re-fetched. */
  get detailsMaxAgeHours() {
    return int("DETAILS_MAX_AGE_HOURS", 24);
  },
  /** Bearer secret for POST /api/sync. The endpoint is disabled when empty. */
  get syncSecret() {
    return env("SYNC_SECRET", "");
  },
  get dataDir() {
    return env("DATA_DIR", "./data");
  },
};
