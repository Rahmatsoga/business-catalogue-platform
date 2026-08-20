const express = require("express");
const { getPublicSettings } = require("../controllers/settingsController");

const router = express.Router();

// More public routes (categories, items) are added in Week 2
router.get("/settings", getPublicSettings);

module.exports = router;
