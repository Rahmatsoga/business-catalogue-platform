const BusinessSetting = require("../models/BusinessSetting");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Because BusinessSetting is a single-document collection, we always fetch
 * "the first document" and create it with defaults if it doesn't exist yet
 * (e.g. on a brand new deployment, before the admin has configured anything).
 */
async function getOrCreateSettings() {
  let settings = await BusinessSetting.findOne();
  if (!settings) {
    settings = await BusinessSetting.create({});
  }
  return settings;
}

// GET /api/public/settings (public)
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.status(200).json({ success: true, data: settings });
});

// GET /api/admin/settings (admin)
const getAdminSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.status(200).json({ success: true, data: settings });
});

// PUT /api/admin/settings (admin)
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();

  const allowedFields = [
    "businessName",
    "logoUrl",
    "description",
    "contact",
    "address",
    "workingHours",
    "mapUrl",
    "social",
    "appearance",
    "seo",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  });

  await settings.save();

  res.status(200).json({
    success: true,
    message: "Settings updated successfully.",
    data: settings,
  });
});

module.exports = { getPublicSettings, getAdminSettings, updateSettings };
