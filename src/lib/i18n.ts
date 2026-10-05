export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Each storefront locale is pinned to one Digiseller language and currency. */
export const localeSettings = {
  en: { lang: "en-US", currency: "USD", apiCurrency: "USD" },
  ru: { lang: "ru-RU", currency: "RUB", apiCurrency: "RUR" },
} as const;

export type Currency = (typeof localeSettings)[Locale]["currency"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function formatPrice(amount: number | null | undefined, locale: Locale): string {
  if (amount == null) return "—";
  const { currency } = localeSettings[locale];
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "RUB" ? 0 : 2,
  }).format(amount);
}

const dict = {
  en: {
    tagline: "Licenses, keys & subscriptions — delivered instantly",
    catalog: "Catalog",
    search: "Search products",
    searchResults: "Search results",
    nothingFound: "Nothing found. Try another search.",
    myPurchases: "My purchases",
    support: "Support",
    buy: "Buy now",
    outOfStock: "Out of stock",
    allCategories: "All categories",
    popular: "Popular right now",
    newArrivals: "Fresh in the catalog",
    browseCategories: "Browse categories",
    viewAll: "View all",
    sort: "Sort",
    sortPopular: "Popular",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortName: "Name",
    price: "Price",
    min: "Min",
    max: "Max",
    inStockOnly: "In stock only",
    apply: "Apply",
    reset: "Reset",
    items: "items",
    sales: "Sales",
    reviews: "Reviews",
    seller: "Seller",
    description: "Description",
    moreInfo: "Additional information",
    home: "Home",
    sold: "sold",
    instantDelivery: "Instant delivery",
    instantDeliveryText: "Your key or account arrives right after payment.",
    securePayment: "Secure checkout",
    securePaymentText: "Payments are processed by Digiseller with buyer protection.",
    humanSupport: "Real support",
    humanSupportText: "Questions? Message us on Telegram.",
    checkoutNote:
      "Checkout, payment and delivery are handled by Digiseller. Your purchase appears in “My purchases” — log in there with the email you used at checkout.",
    officialStore: "Master Of Digital",
    partnerStore: "Partner seller",
    heroTitle: "Your digital library, unlocked.",
    heroText:
      "Game keys, accounts, software licenses and subscriptions — picked, checked and delivered automatically.",
    heroCta: "Explore the catalog",
    emptyCatalog: "The catalog is syncing. Please check back in a few minutes.",
    footerRights: "All trademarks belong to their respective owners.",
    notFound: "Page not found",
    backHome: "Back to home",
    lastSync: "Catalog updated",
    sale: "Sale",
    positive: "Positive",
  },
  ru: {
    tagline: "Лицензии, ключи и подписки — моментальная доставка",
    catalog: "Каталог",
    search: "Поиск товаров",
    searchResults: "Результаты поиска",
    nothingFound: "Ничего не найдено. Попробуйте другой запрос.",
    myPurchases: "Мои покупки",
    support: "Поддержка",
    buy: "Купить",
    outOfStock: "Нет в наличии",
    allCategories: "Все категории",
    popular: "Популярное сейчас",
    newArrivals: "Новое в каталоге",
    browseCategories: "Категории",
    viewAll: "Смотреть все",
    sort: "Сортировка",
    sortPopular: "Популярные",
    sortPriceAsc: "Сначала дешевле",
    sortPriceDesc: "Сначала дороже",
    sortName: "По названию",
    price: "Цена",
    min: "От",
    max: "До",
    inStockOnly: "Только в наличии",
    apply: "Применить",
    reset: "Сбросить",
    items: "товаров",
    sales: "Продаж",
    reviews: "Отзывы",
    seller: "Продавец",
    description: "Описание",
    moreInfo: "Дополнительная информация",
    home: "Главная",
    sold: "продано",
    instantDelivery: "Моментальная доставка",
    instantDeliveryText: "Ключ или аккаунт приходит сразу после оплаты.",
    securePayment: "Безопасная оплата",
    securePaymentText: "Платежи обрабатывает Digiseller с защитой покупателя.",
    humanSupport: "Живая поддержка",
    humanSupportText: "Есть вопросы? Напишите нам в Telegram.",
    checkoutNote:
      "Оформление, оплату и доставку выполняет Digiseller. Покупка появится в разделе «Мои покупки» — войдите туда по email, указанному при оплате.",
    officialStore: "Master Of Digital",
    partnerStore: "Партнёрский продавец",
    heroTitle: "Цифровые товары без ожидания.",
    heroText:
      "Ключи игр, аккаунты, лицензии и подписки — проверенные предложения с автоматической доставкой.",
    heroCta: "Открыть каталог",
    emptyCatalog: "Каталог синхронизируется. Загляните через пару минут.",
    footerRights: "Все товарные знаки принадлежат их владельцам.",
    notFound: "Страница не найдена",
    backHome: "На главную",
    lastSync: "Каталог обновлён",
    sale: "Скидка",
    positive: "Положительных",
  },
} satisfies Record<Locale, Record<string, string>>;

export type Messages = (typeof dict)["en"];

export function t(locale: Locale): Messages {
  return dict[locale];
}
