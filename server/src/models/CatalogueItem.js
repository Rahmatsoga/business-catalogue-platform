const mongoose = require("mongoose");

// Each item can have multiple images; one is flagged as primary (used on cards)
const itemImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    altText: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

// Flexible key-value specs, e.g. { label: "Size", value: "60x60 cm" }
const itemSpecificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: true }
);

const catalogueItemSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "An item must belong to a category"],
    },
    name: { type: String, required: [true, "Item name is required"], trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"],
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // allows many docs with no SKU while still enforcing uniqueness when present
    },
    summary: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },

    // Flexible pricing - see SRS FR-016
    priceType: {
      type: String,
      enum: ["fixed", "range", "starting_from", "contact_for_price", "hidden"],
      default: "contact_for_price",
    },
    priceMin: { type: Number, min: 0, default: null },
    priceMax: { type: Number, min: 0, default: null },

    availability: {
      type: String,
      enum: ["in_stock", "out_of_stock", "made_to_order"],
      default: "in_stock",
    },

    tags: [{ type: String, trim: true, lowercase: true }],

    images: [itemImageSchema],
    specifications: [itemSpecificationSchema],

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index to support name/SKU/description/tags search (Week 2 feature, defined now)
catalogueItemSchema.index({ name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("CatalogueItem", catalogueItemSchema);
