// Sample catalog shaped like Digiseller API responses. Used when DIGISELLER_MOCK=1
// so the storefront can be developed and demoed without network access.

import { config } from "@/lib/config";
import type { CatalogSource } from "./source";
import type { RawCategory, RawListProduct, RawProductData } from "./client";

const MOCK_SELLER = 1000001;
const ownId = () => config.sellerId || MOCK_SELLER;

type MockItem = {
  id: number;
  cat: number;
  en: string;
  ru: string;
  usd: number;
  sale?: number;
  partner?: { id: number; name: string };
  sales: number;
  stock?: boolean;
};

const PARTNER_A = { id: 2000001, name: "KeyHarbor" };
const PARTNER_B = { id: 2000002, name: "PixelVault" };

const categories: { id: number; parent: number | null; en: string; ru: string }[] = [
  { id: 10, parent: null, en: "Accounts", ru: "Аккаунты" },
  { id: 11, parent: 10, en: "Steam accounts", ru: "Аккаунты Steam" },
  { id: 12, parent: 10, en: "PlayStation accounts", ru: "Аккаунты PlayStation" },
  { id: 20, parent: null, en: "Keys", ru: "Ключи" },
  { id: 21, parent: 20, en: "Game keys", ru: "Ключи игр" },
  { id: 22, parent: 20, en: "Software licenses", ru: "Лицензии ПО" },
  { id: 30, parent: null, en: "Activations", ru: "Активации" },
  { id: 31, parent: 30, en: "Subscriptions", ru: "Подписки" },
];

const items: MockItem[] = [
  { id: 4100001, cat: 11, en: "Cyber Odyssey 2088 — Steam account", ru: "Cyber Odyssey 2088 — аккаунт Steam", usd: 6.49, sales: 412 },
  { id: 4100002, cat: 11, en: "Frostbound Legends Deluxe — offline account", ru: "Frostbound Legends Deluxe — офлайн аккаунт", usd: 3.2, sale: 60, sales: 188 },
  { id: 4100003, cat: 11, en: "Iron Harvest Tactics + all DLC", ru: "Iron Harvest Tactics + все DLC", usd: 4.99, partner: PARTNER_A, sales: 96 },
  { id: 4100004, cat: 11, en: "Neon Drift Racing — new account", ru: "Neon Drift Racing — новый аккаунт", usd: 2.49, partner: PARTNER_B, sales: 57 },
  { id: 4100005, cat: 12, en: "Shadow Ronin (PS5) — P2 account", ru: "Shadow Ronin (PS5) — аккаунт П2", usd: 13.9, sales: 73 },
  { id: 4100006, cat: 12, en: "Starfall Expedition (PS4/PS5) — P3", ru: "Starfall Expedition (PS4/PS5) — П3", usd: 9.5, partner: PARTNER_A, sales: 31 },
  { id: 4100007, cat: 12, en: "Kingdoms Reforged — PS5 deluxe", ru: "Kingdoms Reforged — PS5 делюкс", usd: 18.0, sale: 25, sales: 22 },
  { id: 4100008, cat: 21, en: "Hollow Depths — global key", ru: "Hollow Depths — глобальный ключ", usd: 7.99, sales: 640 },
  { id: 4100009, cat: 21, en: "Sky Pirates Remastered — key", ru: "Sky Pirates Remastered — ключ", usd: 11.49, partner: PARTNER_B, sales: 205 },
  { id: 4100010, cat: 21, en: "Last Signal — Steam key (region free)", ru: "Last Signal — ключ Steam (без региона)", usd: 5.25, sale: 40, sales: 330 },
  { id: 4100011, cat: 21, en: "Monster Ranch Simulator — key", ru: "Monster Ranch Simulator — ключ", usd: 3.99, partner: PARTNER_A, sales: 12, stock: false },
  { id: 4100012, cat: 22, en: "Windows 11 Pro — retail license key", ru: "Windows 11 Pro — ключ лицензии retail", usd: 14.99, sales: 1520 },
  { id: 4100013, cat: 22, en: "Office 2021 Professional Plus — key", ru: "Office 2021 Professional Plus — ключ", usd: 19.99, sales: 870 },
  { id: 4100014, cat: 22, en: "Antivirus Total Security — 1 year / 3 devices", ru: "Антивирус Total Security — 1 год / 3 устройства", usd: 9.99, partner: PARTNER_B, sales: 145 },
  { id: 4100015, cat: 22, en: "VPN Unlimited — 12 months", ru: "VPN Unlimited — 12 месяцев", usd: 24.0, sale: 50, sales: 260 },
  { id: 4100016, cat: 31, en: "Music Premium — 3 months on your account", ru: "Music Premium — 3 месяца на ваш аккаунт", usd: 8.49, sales: 980 },
  { id: 4100017, cat: 31, en: "AI Assistant Plus — 1 month activation", ru: "AI Assistant Plus — активация на 1 месяц", usd: 21.0, sales: 455 },
  { id: 4100018, cat: 31, en: "Design Studio Pro — 6 months", ru: "Design Studio Pro — 6 месяцев", usd: 16.5, partner: PARTNER_A, sales: 77 },
  { id: 4100019, cat: 31, en: "Cloud Storage 2 TB — 1 year", ru: "Облако 2 ТБ — 1 год", usd: 29.0, partner: PARTNER_B, sales: 40 },
  { id: 4100020, cat: 31, en: "Game Pass style subscription — 1 month", ru: "Игровая подписка — 1 месяц", usd: 6.99, sale: 30, sales: 512 },
];

const RUB_PER_USD = 92;

function price(item: MockItem, currency: "USD" | "RUR") {
  const base = currency === "USD" ? item.usd : Math.round(item.usd * RUB_PER_USD);
  const old = item.sale ? (currency === "USD" ? +(base / (1 - item.sale / 100)).toFixed(2) : Math.round(base / (1 - item.sale / 100))) : null;
  return { price: base, old };
}

function tree(lang: "en-US" | "ru-RU", parent: number | null = null): RawCategory[] {
  return categories
    .filter((c) => c.parent === parent)
    .map((c) => ({ id: c.id, name: lang === "en-US" ? c.en : c.ru, sub: tree(lang, c.id) }));
}

const describe = (item: MockItem, lang: "en-US" | "ru-RU") =>
  lang === "en-US"
    ? `<p><strong>${item.en}</strong></p><p>Delivered automatically right after payment. Follow the activation guide included with your purchase.</p><ul><li>Instant delivery</li><li>Replacement guarantee</li><li>Support via the seller chat</li></ul>`
    : `<p><strong>${item.ru}</strong></p><p>Товар выдаётся автоматически сразу после оплаты. Инструкция по активации приложена к покупке.</p><ul><li>Моментальная выдача</li><li>Гарантия замены</li><li>Поддержка в чате с продавцом</li></ul>`;

export const mockSource: CatalogSource = {
  async fetchCategories(_sellerId, lang) {
    return tree(lang);
  },

  async fetchCategoryProducts(_sellerId, categoryId, lang, currency, page, rows = 100) {
    const inCat = items.filter((i) => i.cat === categoryId);
    const start = (page - 1) * rows;
    const products: RawListProduct[] = inCat.slice(start, start + rows).map((i) => {
      const p = price(i, currency);
      return {
        id: i.id,
        name: lang === "en-US" ? i.en : i.ru,
        price: p.price,
        oldPrice: p.old,
        salePercent: i.sale ?? null,
        isAvailable: i.stock !== false,
        sellerId: null, // the list endpoint does not reliably include it
      };
    });
    return { products, totalPages: Math.max(1, Math.ceil(inCat.length / rows)) };
  },

  async fetchProductData(productId, lang, currency): Promise<RawProductData> {
    const i = items.find((x) => x.id === productId);
    if (!i) throw new Error(`Mock product ${productId} not found`);
    const seller = i.partner ?? { id: ownId(), name: "Master Of Digital" };
    return {
      id: i.id,
      name: lang === "en-US" ? i.en : i.ru,
      info: describe(i, lang),
      addInfo: "",
      price: price(i, currency).price,
      isAvailable: i.stock !== false,
      sellerId: seller.id,
      sellerName: seller.name,
      sales: i.sales,
      goodReviews: Math.round(i.sales / 9),
      badReviews: i.sales > 300 ? 1 : 0,
      images: [],
    };
  },
};
