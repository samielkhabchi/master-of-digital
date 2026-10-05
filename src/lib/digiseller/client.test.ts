import { describe, expect, it } from "vitest";
import { parseListProduct, parseProductData } from "./client";

describe("Digiseller response parsing", () => {
  it("parses a shop/products list item", () => {
    const p = parseListProduct({
      id: 5151747,
      name: "Some item",
      price: "1190.00",
      is_available: 1,
      id_seller: 1133427,
      sale_info: { common_base_price: "1590", sale_percent: 25 },
    });
    expect(p).toEqual({
      id: 5151747,
      name: "Some item",
      price: 1190,
      oldPrice: 1590,
      salePercent: 25,
      isAvailable: true,
      sellerId: 1133427,
    });
  });

  it("ignores sale info without a percent and treats is_available 0 as out of stock", () => {
    const p = parseListProduct({ id: 1, name: "x", price: 5, is_available: 0, sale_info: { common_base_price: 9 } });
    expect(p.oldPrice).toBeNull();
    expect(p.isAvailable).toBe(false);
    expect(p.sellerId).toBeNull();
  });

  it("parses products/{id}/data including seller and stats", () => {
    const d = parseProductData({
      retval: 0,
      product: {
        id: 42,
        name: "Item",
        info: "<p>hi</p>",
        add_info: "",
        price: 10,
        prices: { default: { price: 9.5, currency: "USD" } },
        is_available: 1,
        seller: { id: 777, name: "Partner" },
        statistics: { sales: 158, good_reviews: 57, bad_reviews: 0 },
        preview_imgs: [{ url: "https://img/1.jpg" }],
      },
    });
    expect(d.sellerId).toBe(777);
    expect(d.sellerName).toBe("Partner");
    expect(d.price).toBe(9.5);
    expect(d.sales).toBe(158);
    expect(d.images).toEqual(["https://img/1.jpg"]);
  });
});
