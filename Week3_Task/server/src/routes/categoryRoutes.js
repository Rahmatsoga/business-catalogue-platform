const express = require("express");
const { requireAdmin } = require("../middleware/auth");
const {
  getPublicCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const publicCategoryRouter = express.Router();
publicCategoryRouter.get("/categories", getPublicCategories);

const adminCategoryRouter = express.Router();
adminCategoryRouter.get("/categories", requireAdmin, getAdminCategories);
adminCategoryRouter.post("/categories", requireAdmin, createCategory);
adminCategoryRouter.put("/categories/:id", requireAdmin, updateCategory);
adminCategoryRouter.delete("/categories/:id", requireAdmin, deleteCategory);

module.exports = { publicCategoryRouter, adminCategoryRouter };
