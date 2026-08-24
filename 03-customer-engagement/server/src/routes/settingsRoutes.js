const express = require("express");
const { requireAdmin } = require("../middleware/auth");
const {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
} = require("../controllers/settingsController");

// Two small routers, mounted at different base paths in app.js:
//   publicSettingsRouter -> /api/public/settings
//   adminSettingsRouter  -> /api/admin/settings
const publicSettingsRouter = express.Router();
publicSettingsRouter.get("/settings", getPublicSettings);

const adminSettingsRouter = express.Router();
adminSettingsRouter.get("/settings", requireAdmin, getAdminSettings);
adminSettingsRouter.put("/settings", requireAdmin, updateSettings);

module.exports = { publicSettingsRouter, adminSettingsRouter };
