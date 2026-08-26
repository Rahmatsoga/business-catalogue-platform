const mongoose = require("mongoose");
const CatalogueItem = require("../models/CatalogueItem");

// NOTE: .validate() only runs schema-level and pre("validate") checks -
// it does NOT require an active database connection, so this test can run
// completely standalone (no MongoDB needed).
describe("CatalogueItem price range validation", () => {
  const fakeCategoryId = new mongoose.Types.ObjectId();

  test("rejects a price range where max is lower than min", async () => {
    const item = new CatalogueItem({
      name: "Broken Range Item",
      slug: "broken-range-item",
      categoryId: fakeCategoryId,
      priceType: "range",
      priceMin: 50,
      priceMax: 10, // invalid: lower than priceMin
    });

    await expect(item.validate()).rejects.toThrow(/Maximum price cannot be lower than minimum price/);
  });

  test("accepts a valid ascending price range", async () => {
    const item = new CatalogueItem({
      name: "Valid Range Item",
      slug: "valid-range-item",
      categoryId: fakeCategoryId,
      priceType: "range",
      priceMin: 10,
      priceMax: 50,
    });

    await expect(item.validate()).resolves.toBeUndefined();
  });

  test("accepts a fixed price with no priceMax set at all", async () => {
    const item = new CatalogueItem({
      name: "Fixed Price Item",
      slug: "fixed-price-item",
      categoryId: fakeCategoryId,
      priceType: "fixed",
      priceMin: 25,
    });

    await expect(item.validate()).resolves.toBeUndefined();
  });

  test("rejects an item with no category (BR-002: every item needs exactly one category)", async () => {
    const item = new CatalogueItem({
      name: "No Category Item",
      slug: "no-category-item",
      priceType: "fixed",
      priceMin: 10,
    });

    await expect(item.validate()).rejects.toThrow();
  });
});
