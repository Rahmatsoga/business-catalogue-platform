const Category = require("../models/Category");
const CatalogueItem = require("../models/CatalogueItem");
const { generateUniqueSlug } = require("../utils/slugify");
const { sanitizePlainText } = require("../utils/sanitize");

// GET /api/public/categories  (public)
// FR-006: only active categories, with item counts
async function getPublicCategories(req, res, next) {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).lean();

    // Attach a live count of active items per category (FR-006 acceptance: counts are correct)
    const counts = await CatalogueItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const withCounts = categories.map((cat) => ({
      ...cat,
      itemCount: countMap.get(String(cat._id)) || 0,
    }));

    return res.status(200).json({ success: true, data: withCounts });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/categories  (admin) - includes inactive categories too
async function getAdminCategories(req, res, next) {
  try {
    const categories = await Category.find({}).sort({ displayOrder: 1, name: 1 }).lean();

    const counts = await CatalogueItem.aggregate([{ $group: { _id: "$categoryId", count: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const withCounts = categories.map((cat) => ({
      ...cat,
      itemCount: countMap.get(String(cat._id)) || 0,
    }));

    return res.status(200).json({ success: true, data: withCounts });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/categories  (admin) — FR-033
async function createCategory(req, res, next) {
  try {
    const { name, description, imageUrl, displayOrder, parentId, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const slug = await generateUniqueSlug(Category, name);

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: sanitizePlainText(description || ""),
      imageUrl,
      displayOrder: displayOrder ?? 0,
      parentId: parentId || null,
      isActive: isActive ?? true,
    });

    return res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/categories/:id  (admin) — FR-034
async function updateCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    const { name, description, imageUrl, displayOrder, parentId, isActive } = req.body;

    // Only regenerate the slug if the name actually changed, so existing
    // public links to this category don't silently break on every edit.
    if (name && name.trim() && name.trim() !== category.name) {
      category.slug = await generateUniqueSlug(Category, name, category._id);
      category.name = name.trim();
    }

    if (description !== undefined) category.description = sanitizePlainText(description);
    if (imageUrl !== undefined) category.imageUrl = imageUrl;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (parentId !== undefined) category.parentId = parentId || null;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    return res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/categories/:id  (admin) — FR-035
// BR-007: a deleted category must not leave items pointing at a missing category
async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    const childCategoryCount = await Category.countDocuments({ parentId: category._id });
    const linkedItemCount = await CatalogueItem.countDocuments({ categoryId: category._id });

    if (childCategoryCount > 0 || linkedItemCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This category has linked items or subcategories. Reassign or remove them before deleting it.",
      });
    }

    await category.deleteOne();
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
