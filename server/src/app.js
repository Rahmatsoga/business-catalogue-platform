const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const { publicSettingsRouter, adminSettingsRouter } = require("./routes/settingsRoutes");

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

// --- Health check (useful for the "does the server boot cleanly" check) ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/public", publicSettingsRouter);
app.use("/api/admin", adminSettingsRouter);
// NOTE for Week 2/3: category, item, and inquiry routes will be added here
// the same way (their own routes file, mounted under /api/public/* and /api/admin/*).

// --- 404 handler for unknown API routes ---
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "The requested resource could not be found" });
});

// --- Central error handler (never leaks stack traces/paths per FR-029/8.1) ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.expose ? err.message : "Something went wrong. Please try again later.",
  });
});

module.exports = app;
