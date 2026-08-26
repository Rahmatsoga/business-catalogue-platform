const fs = require("fs");
const path = require("path");
const CatalogueItem = require("../models/CatalogueItem");
const Category = require("../models/Category");
const { generateUniqueSlug } = require("../utils/slugify");
const { sanitizePlainText } = require("../utils/sanitize");

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 48;

// GET /api/public/items?search=&category=&page=&pageSize=&sort=&availability=&featured=&priceMin=&priceMax=  (public)
// FR-008 grid, FR-009 search, FR-010 filters, FR-011 sort, FR-012 pagination
async function getPublicItems(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const filter = { isActive: true };

    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category, isActive: true });
      // If the category slug doesn't match anything active, return an empty
      // result set rather than accidentally showing unfiltered items.
      filter.categoryId = category ? category._id : null;
    }

    if (req.query.search && req.query.search.trim()) {
      filter.$text = { $search: req.query.search.trim() };
    }

    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }

    // FR-010: availability filter
    if (req.query.availability) {
      filter.availability = req.query.availability;
    }

    // FR-010: price range filter — only meaningful for items with a numeric priceMin
    // (items priced "Contact for Price" or "Hidden" are excluded once a range is set,
    // since they have no number to compare against).
    // IMPORTANT: query params can arrive as an empty string ("") when a filter field
    // exists in the URL but was never filled in — Number("") is 0, NOT "not a number",
    // so we must explicitly treat "" the same as "not provided" here.
    const priceMinRaw = req.query.priceMin;
    const priceMaxRaw = req.query.priceMax;
    const priceMin = priceMinRaw !== undefined && priceMinRaw !== "" ? Number(priceMinRaw) : null;
    const priceMax = priceMaxRaw !== undefined && priceMaxRaw !== "" ? Number(priceMaxRaw) : null;
    if (priceMin !== null && !Number.isNaN(priceMin)) {
      filter.priceMin = { ...(filter.priceMin || {}), $gte: priceMin };
    }
    if (priceMax !== null && !Number.isNaN(priceMax)) {
      filter.priceMin = { ...(filter.priceMin || {}), $lte: priceMax };
    }

    // FR-011: sort options
    const sortMap = {
      latest: { createdAt: -1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      price_asc: { priceMin: 1 },
      price_desc: { priceMin: -1 },
    };
    const sortBy = sortMap[req.query.sort] || sortMap.latest;

    const [items, total] = await Promise.all([
      CatalogueItem.find(filter)
        .populate("categoryId", "name slug")
        .sort(sortBy)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      CatalogueItem.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/public/items/:slug  (public) — FR-014, FR-018 related items
async function getPublicItemBySlug(req, res, next) {
  try {
    const item = await CatalogueItem.findOne({ slug: req.params.slug, isActive: true }).populate(
      "categoryId",
      "name slug"
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    const relatedItems = await CatalogueItem.find({
      categoryId: item.categoryId,
      isActive: true,
      _id: { $ne: item._id },
    })
      .limit(4)
      .select("name slug images priceType priceMin priceMax")
      .lean();

    return res.status(200).json({ success: true, data: { item, relatedItems } });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/items?search=&category=&status=&page=  (admin) — FR-043
async function getAdminItems(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const filter = {};
    if (req.query.category) filter.categoryId = req.query.category;
    if (req.query.status === "active") filter.isActive = true;
    if (req.query.status === "inactive") filter.isActive = false;
    if (req.query.search && req.query.search.trim()) {
      filter.$text = { $search: req.query.search.trim() };
    }

    const [items, total] = await Promise.all([
      CatalogueItem.find(filter)
        .populate("categoryId", "name slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      CatalogueItem.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/items/:id  (admin) - full record for editing
async function getAdminItemById(req, res, next) {
  try {
    const item = await CatalogueItem.findById(req.params.id).populate("categoryId", "name slug");
    if (!item) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/items  (admin) — FR-037
async function createItem(req, res, next) {
  try {
    const {
      name, categoryId, sku, summary, description,
      priceType, priceMin, priceMax, availability, tags,
      specifications, isFeatured, isActive,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Item name is required" });
    }
    if (!categoryId) {
      return res.status(400).json({ success: false, message: "Every item must belong to a category" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: "Selected category does not exist" });
    }

    const slug = await generateUniqueSlug(CatalogueItem, name);

    const item = await CatalogueItem.create({
      name: name.trim(),
      slug,
      categoryId,
      sku: sku?.trim() || undefined, // undefined (not "") so the sparse unique index doesn't collide on blanks
      summary: sanitizePlainText(summary || ""),
      description: sanitizePlainText(description || ""),
      priceType: priceType || "fixed",
      priceMin: priceMin === "" || priceMin === undefined ? null : priceMin,
      priceMax: priceMax === "" || priceMax === undefined ? null : priceMax,
      availability: availability || "unspecified",
      tags: Array.isArray(tags) ? tags : [],
      specifications: Array.isArray(specifications) ? specifications : [],
      isFeatured: !!isFeatured,
      isActive: isActive ?? true,
    });

    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "This SKU or URL slug is already in use" });
    }
    next(err);
  }
}

// PUT /api/admin/items/:id  (admin) — FR-038
async function updateItem(req, res, next) {
  try {
    const item = await CatalogueItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    const {
      name, categoryId, sku, summary, description,
      priceType, priceMin, priceMax, availability, tags,
      specifications, isFeatured, isActive,
    } = req.body;

    if (name && name.trim() && name.trim() !== item.name) {
      item.slug = await generateUniqueSlug(CatalogueItem, name, item._id);
      item.name = name.trim();
    }

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ success: false, message: "Selected category does not exist" });
      }
      item.categoryId = categoryId;
    }

    if (sku !== undefined) item.sku = sku?.trim() || undefined;
    if (summary !== undefined) item.summary = sanitizePlainText(summary);
    if (description !== undefined) item.description = sanitizePlainText(description);
    if (priceType !== undefined) item.priceType = priceType;
    if (priceMin !== undefined) item.priceMin = priceMin === "" ? null : priceMin;
    if (priceMax !== undefined) item.priceMax = priceMax === "" ? null : priceMax;
    if (availability !== undefined) item.availability = availability;
    if (tags !== undefined) item.tags = Array.isArray(tags) ? tags : [];
    if (specifications !== undefined) item.specifications = Array.isArray(specifications) ? specifications : [];
    if (isFeatured !== undefined) item.isFeatured = !!isFeatured;
    if (isActive !== undefined) item.isActive = isActive;

    await item.save();
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "This SKU or URL slug is already in use" });
    }
    next(err);
  }
}

// DELETE /api/admin/items/:id  (admin) — FR-039, removes stored images too
async function deleteItem(req, res, next) {
  try {
    const item = await CatalogueItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    item.images.forEach((img) => deleteImageFile(img.filePath));

    await item.deleteOne();
    return res.status(200).json({ success: true, message: "Item deleted" });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/items/:id/status  (admin) — FR-040 activate/deactivate, FR-041 featured
async function updateItemStatus(req, res, next) {
  try {
    const item = await CatalogueItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    if (req.body.isActive !== undefined) item.isActive = req.body.isActive;
    if (req.body.isFeatured !== undefined) item.isFeatured = req.body.isFeatured;

    await item.save();
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/items/:id/images  (admin) — FR-042, uses multer (req.files)
async function uploadItemImages(req, res, next) {
  try {
    const item = await CatalogueItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: "No image files were received" });
    }

    const startingOrder = item.images.length;
    const hasPrimaryAlready = item.images.some((img) => img.isPrimary);

    files.forEach((file, index) => {
      item.images.push({
        filePath: `/uploads/items/${file.filename}`,
        altText: item.name,
        displayOrder: startingOrder + index,
        // Automatically make the very first image ever uploaded the primary one.
        isPrimary: !hasPrimaryAlready && startingOrder + index === 0,
      });
    });

    await item.save();
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/items/:id/images/:imageId  (admin) — FR-042
async function deleteItemImage(req, res, next) {
  try {
    const item = await CatalogueItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    const image = item.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    const wasPrimary = image.isPrimary;
    deleteImageFile(image.filePath);
    image.deleteOne();

    // If we just removed the primary image, promote the next one so the
    // gallery always has a primary image when at least one image remains.
    if (wasPrimary && item.images.length > 0) {
      item.images[0].isPrimary = true;
    }

    await item.save();
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/items/:id/images/:imageId/primary  (admin) — FR-042
async function setPrimaryImage(req, res, next) {
  try {
    const item = await CatalogueItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    const target = item.images.id(req.params.imageId);
    if (!target) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    item.images.forEach((img) => {
      img.isPrimary = String(img._id) === String(target._id);
    });

    await item.save();
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

// Helper: safely remove an uploaded file from disk (never crash the request if it's already gone)
function deleteImageFile(filePath) {
  try {
    const absolutePath = path.join(__dirname, "..", "..", filePath.replace(/^\/+/, ""));
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error("[upload] Failed to delete image file:", err.message);
  }
}

module.exports = {
  getPublicItems,
  getPublicItemBySlug,
  getAdminItems,
  getAdminItemById,
  createItem,
  updateItem,
  deleteItem,
  updateItemStatus,
  uploadItemImages,
  deleteItemImage,
  setPrimaryImage,
};
