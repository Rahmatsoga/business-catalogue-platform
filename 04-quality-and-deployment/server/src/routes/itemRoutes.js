const express = require("express");
const { requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
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
} = require("../controllers/itemController");

const publicItemRouter = express.Router();
publicItemRouter.get("/items", getPublicItems);
publicItemRouter.get("/items/:slug", getPublicItemBySlug);

const adminItemRouter = express.Router();
adminItemRouter.get("/items", requireAdmin, getAdminItems);
adminItemRouter.get("/items/:id", requireAdmin, getAdminItemById);
adminItemRouter.post("/items", requireAdmin, createItem);
adminItemRouter.put("/items/:id", requireAdmin, updateItem);
adminItemRouter.delete("/items/:id", requireAdmin, deleteItem);
adminItemRouter.patch("/items/:id/status", requireAdmin, updateItemStatus);

adminItemRouter.post("/items/:id/images", requireAdmin, upload.array("images", 8), uploadItemImages);
adminItemRouter.delete("/items/:id/images/:imageId", requireAdmin, deleteItemImage);
adminItemRouter.patch("/items/:id/images/:imageId/primary", requireAdmin, setPrimaryImage);

module.exports = { publicItemRouter, adminItemRouter };
