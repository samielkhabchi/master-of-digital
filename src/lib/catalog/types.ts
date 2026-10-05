export type Localized = { en: string; ru: string };
export type Prices = { USD: number | null; RUB: number | null };

export type Ownership = "own" | "partner" | "unknown";

export interface Category {
  id: number;
  parentId: number | null;
  name: Localized;
  /** Position in the Digiseller shop tree, used to keep the seller's ordering. */
  order: number;
}

export interface Product {
  id: number;
  name: Localized;
  categoryIds: number[];
  price: Prices;
  /** Price before discount, when Digiseller reports a sale. */
  oldPrice: Prices;
  salePercent: number | null;
  isAvailable: boolean;
  sellerId: number | null;
  sellerName: string | null;
  ownership: Ownership;
  sales: number | null;
  goodReviews: number | null;
  badReviews: number | null;
  /** Position in the seller's shop listing; lower = shown first. */
  order: number;
  /** First time this product appeared in a sync (ISO). */
  firstSeenAt: string;
  /** Last time per-item details (seller, stats) were fetched (ISO). */
  detailsFetchedAt: string | null;
}

export interface Catalog {
  syncedAt: string | null;
  sellerId: number;
  categories: Category[];
  products: Product[];
}

export interface SyncReport {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  categories: number;
  products: number;
  added: number[];
  removed: number[];
  own: number;
  partner: number;
  unknown: number;
  errors: string[];
}

/** Full item info fetched live for the product page. */
export interface ProductDetails {
  id: number;
  name: string;
  info: string;
  addInfo: string;
  price: number | null;
  sellerId: number | null;
  sellerName: string | null;
  isAvailable: boolean;
  images: string[];
}
