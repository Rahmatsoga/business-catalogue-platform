const CatalogueItem = require("../models/CatalogueItem");
const Category = require("../models/Category");
const Inquiry = require("../models/Inquiry");

// GET /api/admin/dashboard/summary  (admin) — FR-030, FR-031
async function getDashboardSummary(req, res, next) {
  try {
    const [activeItems, inactiveItems, categoryCount, newInquiries, recentInquiries] = await Promise.all([
      CatalogueItem.countDocuments({ isActive: true }),
      CatalogueItem.countDocuments({ isActive: false }),
      Category.countDocuments({}),
      Inquiry.countDocuments({ status: "new" }),
      Inquiry.find({}).populate("itemId", "name slug").sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        counts: { activeItems, inactiveItems, categoryCount, newInquiries },
        recentInquiries,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboardSummary };
