const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogueItem",
      default: null, // optional: a general inquiry has no related item
    },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, default: "" },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "resolved", "spam"],
      default: "new",
    },
    source: {
      type: String,
      enum: ["general_form", "item_form", "whatsapp"],
      default: "general_form",
    },
  },
  { timestamps: true }
);

inquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
