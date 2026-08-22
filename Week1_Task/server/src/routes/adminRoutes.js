const express = require("express");
const { getAdminSettings, updateSettings } = require("../controllers/settingsController");
const protect = require("../middleware/protect");

const router = express.Router();

// All routes below require a valid admin session.
// More admin routes (categories, items, inquiries) are added in Weeks 2-3.
router.get("/settings", protect, getAdminSettings);
router.put("/settings", protect, updateSettings);

module.exports = router;
