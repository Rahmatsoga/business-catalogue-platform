const mongoose = require("mongoose");
const itemImageSchema = require("./ItemImage");
const itemSpecificationSchema = require("./ItemSpecification");

const PRICE_TYPES = ["fixed", "range", "starting_from", "contact_for_price", "hidden"];

const catalogueItemSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Every item must belong to exactly one active category (BR-002)"],
    },
    name: { type: String, required: true, trim: true },
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
      sparse: true, // BR-003: SKU unique only WHEN provided
    },
    summary: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },

    // --- Pricing (FR-016) ---
    priceType: {
      type: String,
      enum: PRICE_TYPES,
      default: "fixed",
    },
    priceMin: { type: Number, min: 0, default: null },
    priceMax: { type: Number, min: 0, default: null },

    availability: {
      type: String,
      enum: ["in_stock", "out_of_stock", "made_to_order", "unspecified"],
      default: "unspecified",
    },
    tags: [{ type: String, trim: true, lowercase: true }],

    images: [itemImageSchema],
    specifications: [itemSpecificationSchema],

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Supports search (FR-009) and admin filters (FR-043)
catalogueItemSchema.index({ name: "text", summary: "text", description: "text", tags: "text" });
catalogueItemSchema.index({ categoryId: 1, isActive: 1 });
catalogueItemSchema.index({ isFeatured: 1, isActive: 1 });

// Business rule: max price can't be lower than min price
catalogueItemSchema.pre("validate", function (next) {
  if (this.priceMin != null && this.priceMax != null && this.priceMax < this.priceMin) {
    return next(new Error("Maximum price cannot be lower than minimum price"));
  }
  next();
});

module.exports = mongoose.model("CatalogueItem", catalogueItemSchema);
module.exports.PRICE_TYPES = PRICE_TYPES;
