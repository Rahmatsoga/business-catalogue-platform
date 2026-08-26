const { generateUniqueSlug } = require("../utils/slugify");

// A tiny fake "Model" that behaves like Mongoose's findOne, backed by an
// in-memory array instead of a real database. This lets us test the
// uniqueness logic in generateUniqueSlug() completely in isolation.
function makeFakeModel(existingSlugs) {
  return {
    findOne: jest.fn(async ({ slug }) => {
      return existingSlugs.includes(slug) ? { _id: "fake-id", slug } : null;
    }),
  };
}

describe("generateUniqueSlug", () => {
  test("converts a plain name into a lowercase, hyphenated slug", async () => {
    const model = makeFakeModel([]);
    const slug = await generateUniqueSlug(model, "Blue Ceramic Tile");
    expect(slug).toBe("blue-ceramic-tile");
  });

  test("strips special characters not allowed in a slug", async () => {
    const model = makeFakeModel([]);
    const slug = await generateUniqueSlug(model, "50% Off! Tiles & More???");
    expect(slug).toMatch(/^[a-z0-9-]+$/); // only lowercase letters, numbers, hyphens
  });

  test("appends -2 when the base slug is already taken", async () => {
    const model = makeFakeModel(["blue-ceramic-tile"]);
    const slug = await generateUniqueSlug(model, "Blue Ceramic Tile");
    expect(slug).toBe("blue-ceramic-tile-2");
  });

  test("keeps incrementing until it finds a free slug", async () => {
    const model = makeFakeModel(["mouse", "mouse-2", "mouse-3"]);
    const slug = await generateUniqueSlug(model, "Mouse");
    expect(slug).toBe("mouse-4");
  });

  test("excludes the item's own _id when editing (so saving with the same name doesn't collide with itself)", async () => {
    const model = {
      findOne: jest.fn(async (query) => {
        // Simulate: "mouse" exists, but belongs to the very item being edited
        if (query.slug === "mouse" && query._id && query._id.$ne === "item-123") {
          return null; // excluded correctly, so no collision
        }
        return null;
      }),
    };
    const slug = await generateUniqueSlug(model, "Mouse", "item-123");
    expect(slug).toBe("mouse");
    expect(model.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "mouse", _id: { $ne: "item-123" } })
    );
  });
});
