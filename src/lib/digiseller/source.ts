import { config } from "@/lib/config";
import * as client from "./client";
import { mockSource } from "./mock";

/** The subset of the Digiseller API the sync needs; swappable for tests and demos. */
export interface CatalogSource {
  fetchCategories: typeof client.fetchCategories;
  fetchCategoryProducts: typeof client.fetchCategoryProducts;
  fetchProductData: typeof client.fetchProductData;
}

export const liveSource: CatalogSource = {
  fetchCategories: client.fetchCategories,
  fetchCategoryProducts: client.fetchCategoryProducts,
  fetchProductData: client.fetchProductData,
};

export function getSource(): CatalogSource {
  return config.mock ? mockSource : liveSource;
}
