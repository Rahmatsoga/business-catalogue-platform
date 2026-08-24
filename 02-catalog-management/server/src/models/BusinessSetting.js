const mongoose = require("mongoose");

/**
 * BusinessSetting holds ONE document for the whole deployment
 * (this app is "one business per deployment" per SRS section 2.3).
 * We enforce a single document using a fixed singleton key.
 */
const businessSettingSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: "MAIN",
      unique: true,
      immutable: true,
    },

    // --- Business profile (FR-002, FR-048) ---
    businessName: { type: String, required: true, trim: true, default: "My Business" },
    description: { type: String, trim: true, default: "" },
    logoUrl: { type: String, default: "" },
    address: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    whatsappNumber: { type: String, trim: true, default: "" },
    workingHours: { type: String, trim: true, default: "" },
    mapUrl: { type: String, trim: true, default: "" },
    socialLinks: {
      facebook: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
    },

    // --- Appearance (FR-049) ---
    primaryColor: { type: String, default: "#0d9488" }, // teal, matches SYNEXUS branding
    secondaryColor: { type: String, default: "#0f172a" },
    heroTitle: { type: String, trim: true, default: "" },
    heroText: { type: String, trim: true, default: "" },
    heroImageUrl: { type: String, default: "" },

    // --- SEO (FR-050) ---
    seoTitle: { type: String, trim: true, default: "" },
    seoDescription: { type: String, trim: true, default: "" },
    seoShareImageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// BR-005: at least one of phone, email, or whatsapp must be set.
// We validate this at the controller/service layer instead of a hard
// schema-level `required`, because on first app boot the settings document
// is created empty and the admin fills it in through the Settings screen.

module.exports = mongoose.model("BusinessSetting", businessSettingSchema);
