const Inquiry = require("../models/Inquiry");
const CatalogueItem = require("../models/CatalogueItem");
const { sanitizePlainText } = require("../utils/sanitize");

// POST /api/public/inquiries  (public) — FR-021, FR-022, FR-024
async function createInquiry(req, res, next) {
  try {
    const { customerName, phone, email, subject, message, itemId, website, source } = req.body;

    // --- Honeypot spam trap (FR-024) ---
    // "website" is a hidden field real visitors never see or fill in (hidden with CSS in the
    // form). Bots that auto-fill every field they find will fill this one in too. If it has
    // anything in it, we quietly pretend success instead of telling the bot it was caught —
    // that way the bot doesn't learn to try again differently.
    if (website) {
      return res.status(201).json({ success: true, message: "Thank you, your inquiry has been sent." });
    }

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    if ((!phone || !phone.trim()) && (!email || !email.trim())) {
      return res.status(400).json({ success: false, message: "Please provide a phone number or an email address" });
    }

    let validatedItemId = null;
    if (itemId) {
      const item = await CatalogueItem.findOne({ _id: itemId, isActive: true });
      if (!item) {
        return res.status(400).json({ success: false, message: "Selected item is no longer available" });
      }
      validatedItemId = item._id;
    }

    const inquiry = await Inquiry.create({
      itemId: validatedItemId,
      customerName: sanitizePlainText(customerName.trim()),
      phone: phone?.trim() || "",
      email: email?.trim() || "",
      subject: sanitizePlainText(subject?.trim() || ""),
      message: sanitizePlainText(message.trim()),
      source: validatedItemId ? "item_form" : source === "whatsapp" ? "whatsapp" : "general_form",
    });

    return res.status(201).json({ success: true, data: { id: inquiry._id }, message: "Thank you, your inquiry has been sent." });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/inquiries?status=&page=  (admin) — FR-044
async function getAdminInquiries(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = 15;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .populate("itemId", "name slug")
        .sort({ createdAt: -1 }) // FR-044: newest first
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: inquiries,
      pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/inquiries/:id/status  (admin) — FR-046
async function updateInquiryStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ["new", "contacted", "resolved", "spam"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }

    return res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/inquiries/:id  (admin) — FR-047
async function deleteInquiry(req, res, next) {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "The requested item could not be found" });
    }
    return res.status(200).json({ success: true, message: "Inquiry deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { createInquiry, getAdminInquiries, updateInquiryStatus, deleteInquiry };
