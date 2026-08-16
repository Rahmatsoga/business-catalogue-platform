const mongoose = require("mongoose");

/**
 * ItemImage is modeled as a SUBDOCUMENT (embedded array) inside
 * CatalogueItem rather than its own top-level collection.
 * Why: images always belong to exactly one item, are always read
 * together with the item, and rarely queried on their own -- so
 * embedding avoids an extra query/join for something that acts like
 * a "row in a details table" (this is a normal Mongoose pattern for
 * tight parent/child relationships).
 */
const itemImageSchema = new mongoose.Schema(
  {
    filePath: { type: String, required: true }, // e.g. /uploads/items/abc123.jpg
    altText: { type: String, trim: true, default: "" },
    displayOrder: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = itemImageSchema;
