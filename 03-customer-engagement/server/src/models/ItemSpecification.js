const mongoose = require("mongoose");

// Same reasoning as ItemImage: specifications (size, color, material...)
// only ever exist attached to one item, so they're embedded, not a
// separate top-level collection.
const itemSpecificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "Color"
    value: { type: String, required: true, trim: true }, // e.g. "Matte White"
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

module.exports = itemSpecificationSchema;
