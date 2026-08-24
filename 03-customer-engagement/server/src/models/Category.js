const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
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
    description: { type: String, trim: true, default: "" },
    imageUrl: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ parentId: 1, displayOrder: 1 });

module.exports = mongoose.model("Category", categorySchema);
