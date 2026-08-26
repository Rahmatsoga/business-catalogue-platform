import { describe, test, expect } from "vitest";
import { formatPrice } from "../priceFormat";

describe("formatPrice", () => {
  test("formats a fixed price with two decimal places", () => {
    expect(formatPrice({ priceType: "fixed", priceMin: 33.7, priceMax: null })).toBe("$33.70");
  });

  test("formats a fixed price that is a whole number", () => {
    expect(formatPrice({ priceType: "fixed", priceMin: 50, priceMax: null })).toBe("$50.00");
  });

  test("formats a price range with both bounds", () => {
    expect(formatPrice({ priceType: "range", priceMin: 10, priceMax: 20 })).toBe("$10.00 – $20.00");
  });

  test("formats 'starting from' with only a minimum price", () => {
    expect(formatPrice({ priceType: "starting_from", priceMin: 23, priceMax: null })).toBe("Starting from $23.00");
  });

  test("shows 'Contact for Price' regardless of price fields", () => {
    expect(formatPrice({ priceType: "contact_for_price", priceMin: null, priceMax: null })).toBe("Contact for Price");
  });

  test("returns null for a hidden price (deliberately shows nothing)", () => {
    expect(formatPrice({ priceType: "hidden", priceMin: 99, priceMax: null })).toBeNull();
  });

  // This directly covers the Week 3 bug: priceMin === 0 is a legitimate
  // price (e.g. a free sample), and must NOT be treated the same as
  // "no price set". `!= null` (not strict !==) correctly allows 0 through
  // while still catching both null and undefined.
  test("treats a price of exactly 0 as a valid, displayable price", () => {
    expect(formatPrice({ priceType: "fixed", priceMin: 0, priceMax: null })).toBe("$0.00");
  });

  test("shows 'Price unavailable' for fixed price with no priceMin set", () => {
    expect(formatPrice({ priceType: "fixed", priceMin: null, priceMax: null })).toBe("Price unavailable");
  });

  test("shows 'Price unavailable' for a range missing its upper bound", () => {
    expect(formatPrice({ priceType: "range", priceMin: 10, priceMax: null })).toBe("Price unavailable");
  });

  test("falls back to 'Price unavailable' for an unrecognized/missing priceType", () => {
    expect(formatPrice({ priceType: "not_a_real_type", priceMin: 10, priceMax: null })).toBe("Price unavailable");
  });
});
