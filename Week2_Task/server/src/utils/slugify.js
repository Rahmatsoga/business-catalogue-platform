const slugify = require("slugify");

/**
 * Turns "Blue Ceramic Tile" into "blue-ceramic-tile".
 * If that slug is already taken, appends -2, -3, etc. until it's unique.
 *
 * @param {import("mongoose").Model} Model - the Mongoose model to check against (Category or CatalogueItem)
 * @param {string} name - the human-readable name to slugify
 * @param {string|null} excludeId - when editing an existing record, exclude its own _id from the uniqueness check
 */
async function generateUniqueSlug(Model, name, excludeId = null) {
  const base = slugify(name, { lower: true, strict: true }); // strict strips anything not a-z0-9-
  let candidate = base;
  let suffix = 2;

  // Keep trying candidate, candidate-2, candidate-3... until nothing else has it.
  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await Model.findOne(query);
    if (!existing) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

module.exports = { generateUniqueSlug };
