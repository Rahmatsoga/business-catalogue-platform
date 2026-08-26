const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const authRoutes = require("./routes/authRoutes");
const { publicSettingsRouter, adminSettingsRouter } = require("./routes/settingsRoutes");
const { publicCategoryRouter, adminCategoryRouter } = require("./routes/categoryRoutes");
const { publicItemRouter, adminItemRouter } = require("./routes/itemRoutes");
const { publicInquiryRouter, adminInquiryRouter } = require("./routes/inquiryRoutes");
const { adminDashboardRouter } = require("./routes/dashboardRoutes");
const { seoRouter } = require("./routes/seoRoutes");

const app = express();

// Required for secure cookies to work correctly when deployed behind a
// reverse proxy / load balancer (Render, Railway, Heroku, nginx, etc.),
// which is the normal setup in production. Without this, Express can't
// tell the original request was HTTPS, and secure cookies would silently
// fail to be set.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// --- Security headers (NFR-006) ---
// Sets a broad set of protective HTTP headers (X-Content-Type-Options,
// X-Frame-Options, etc.) with one line, rather than hand-rolling each one.
app.use(helmet());

// --- Core middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // required so the httpOnly cookie is sent/received
  })
);
app.use(express.json());
app.use(cookieParser());

// --- Strip any MongoDB operator characters ($, .) from user input (NFR-006) ---
// Prevents NoSQL injection attempts like sending { "email": { "$gt": "" } }
// instead of a normal string to try to bypass a query's intended logic.
app.use(mongoSanitize());

// --- Serve uploaded product images as static files (e.g. /uploads/items/abc123.jpg) ---
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- Health check (useful for the "does the server boot cleanly" check) ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// --- SEO basics: robots.txt and a dynamic sitemap.xml (NFR-009) ---
app.use("/", seoRouter);

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

// --- Optional single-service deployment: serve the built React app directly ---
// Set SERVE_CLIENT=true in production if you're deploying frontend+backend
// together as one service (e.g. a single Render/Railway app), rather than
// hosting the client separately (Netlify/Vercel). When enabled, this must
// come AFTER the API routes above, so API calls are never swallowed by it.
if (process.env.SERVE_CLIENT === "true") {
  const clientDistPath = path.join(__dirname, "..", "..", "client", "dist");
  app.use(express.static(clientDistPath));

  // Any route that isn't /api/* or /uploads/* falls through to the React
  // app's index.html, letting React Router handle the actual page routing
  // client-side (this is required for direct links like /catalogue to work
  // on refresh, not just when clicked from within the app).
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

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
