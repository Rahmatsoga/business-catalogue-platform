const express = require("express");
const { requireAdmin } = require("../middleware/auth");
const { getDashboardSummary } = require("../controllers/dashboardController");

const adminDashboardRouter = express.Router();
adminDashboardRouter.get("/dashboard/summary", requireAdmin, getDashboardSummary);

module.exports = { adminDashboardRouter };
