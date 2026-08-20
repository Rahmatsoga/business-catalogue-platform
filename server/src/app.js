const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const publicRoutes = require("./routes/publicRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// --- Core middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true, // required so the browser sends/receives the httpOnly cookie
  })
);
app.use(express.json());
app.use(cookieParser());

// --- Health check (useful for confirming the server boots correctly) ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running." });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);

// --- 404 + centralized error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
