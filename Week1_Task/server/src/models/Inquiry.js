const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogueItem",
      default: null, // optional - a general inquiry may not reference an item
    },
    customerName: { type: String, required: [true, "Name is required"], trim: true },
    phone: { type: String, default: "", trim: true },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      match: [/^$|^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    subject: { type: String, default: "", trim: true },
    message: { type: String, required: [true, "Message is required"], trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "resolved", "spam"],
      default: "new",
    },
    source: {
      type: String,
      enum: ["general_form", "item_form"],
      default: "general_form",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
