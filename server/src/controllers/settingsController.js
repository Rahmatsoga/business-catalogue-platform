const BusinessSetting = require("../models/BusinessSetting");

// Helper: there is always exactly one settings document (singleton pattern).
// If it doesn't exist yet (first boot), create it with defaults.
async function getOrCreateSettings() {
  let settings = await BusinessSetting.findOne({ singletonKey: "MAIN" });
  if (!settings) {
    settings = await BusinessSetting.create({ singletonKey: "MAIN" });
  }
  return settings;
}

// GET /api/public/settings  (public)
async function getPublicSettings(req, res, next) {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/settings  (admin)
async function getAdminSettings(req, res, next) {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/settings  (admin)
async function updateSettings(req, res, next) {
  try {
    const settings = await getOrCreateSettings();

    // Only allow known, safe fields to be updated (never singletonKey/_id/etc.)
    const allowedFields = [
      "businessName", "description", "logoUrl", "address", "phone", "email",
      "whatsappNumber", "workingHours", "mapUrl", "socialLinks",
      "primaryColor", "secondaryColor", "heroTitle", "heroText", "heroImageUrl",
      "seoTitle", "seoDescription", "seoShareImageUrl",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    // BR-005: at least one contact method must be configured
    if (!settings.phone && !settings.email && !settings.whatsappNumber) {
      return res.status(400).json({
        success: false,
        message: "At least one of phone, email, or WhatsApp number must be configured",
      });
    }

    await settings.save();
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPublicSettings, getAdminSettings, updateSettings };
