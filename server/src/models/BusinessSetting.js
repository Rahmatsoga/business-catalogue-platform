const mongoose = require("mongoose");

/**
 * BusinessSetting is intentionally a SINGLE document per deployment.
 * This is the mechanism that makes the codebase reusable across
 * different businesses: swap this one document, get a different site.
 */
const businessSettingSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      default: "My Business",
    },
    logoUrl: { type: String, default: "" },
    description: { type: String, default: "", trim: true },

    contact: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },

    address: { type: String, default: "" },
    workingHours: { type: String, default: "" },
    mapUrl: { type: String, default: "" },

    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      other: { type: String, default: "" },
    },

    appearance: {
      primaryColor: { type: String, default: "#0F766E" },
      secondaryColor: { type: String, default: "#0891B2" },
      heroTitle: { type: String, default: "" },
      heroText: { type: String, default: "" },
      heroImageUrl: { type: String, default: "" },
    },

    seo: {
      defaultTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      shareImageUrl: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessSetting", businessSettingSchema);
