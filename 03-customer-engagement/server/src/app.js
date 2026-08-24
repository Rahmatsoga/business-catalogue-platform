const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");

const authRoutes = require("./routes/authRoutes");
const { publicSettingsRouter, adminSettingsRouter } = require("./routes/settingsRoutes");
const { publicCategoryRouter, adminCategoryRouter } = require("./routes/categoryRoutes");
const { publicItemRouter, adminItemRouter } = require("./routes/itemRoutes");
const { publicInquiryRouter, adminInquiryRouter } = require("./routes/inquiryRoutes");
const { adminDashboardRouter } = require("./routes/dashboardRoutes");

const app = express();

// --- Core middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // required so the httpOnly cookie is sent/received
  })
);
app.use(express.json());
app.use(cookieParser());

// --- Serve uploaded product images as static files (e.g. /uploads/items/abc123.jpg) ---
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- Health check (useful for the "does the server boot cleanly" check) ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/public", publicSettingsRouter);
app.use("/api/public", publicCategoryRouter);
app.use("/api/public", publicItemRouter);
app.use("/api/public", publicInquiryRouter);
app.use("/api/admin", adminSettingsRouter);
app.use("/api/admin", adminCategoryRouter);
app.use("/api/admin", adminItemRouter);
app.use("/api/admin", adminInquiryRouter);
app.use("/api/admin", adminDashboardRouter);

// --- 404 handler for unknown API routes ---
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "The requested resource could not be found" });
});

// --- Central error handler (never leaks stack traces/paths per FR-029/8.1) ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Multer errors (bad file type, file too large) get a clear 400 instead of a generic 500.
  if (err instanceof multer.MulterError || /Only JPEG, PNG, or WebP/.test(err.message)) {
    return res.status(400).json({ success: false, message: err.message });
  }

  console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.expose ? err.message : "Something went wrong. Please try again later.",
  });
});

module.exports = app;
