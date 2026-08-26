const express = require("express");
const rateLimit = require("express-rate-limit");
const { requireAdmin } = require("../middleware/auth");
const {
  createInquiry,
  getAdminInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require("../controllers/inquiryController");

// FR-024: server-side rate limiting on the public inquiry endpoint.
// 8 submissions per 15 minutes per IP is generous for a real customer, but
// stops a script from flooding the inquiry list.
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many inquiries submitted. Please try again later." },
});

const publicInquiryRouter = express.Router();
publicInquiryRouter.post("/inquiries", inquiryLimiter, createInquiry);

const adminInquiryRouter = express.Router();
adminInquiryRouter.get("/inquiries", requireAdmin, getAdminInquiries);
adminInquiryRouter.patch("/inquiries/:id/status", requireAdmin, updateInquiryStatus);
adminInquiryRouter.delete("/inquiries/:id", requireAdmin, deleteInquiry);

module.exports = { publicInquiryRouter, adminInquiryRouter };
