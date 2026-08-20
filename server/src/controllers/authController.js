const bcrypt = require("bcryptjs");
const Administrator = require("../models/Administrator");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken, setAuthCookie, clearAuthCookie } = require("../utils/generateToken");

// POST /api/auth/login (public)
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  // .select("+passwordHash") because the schema excludes it by default
  const admin = await Administrator.findOne({ email: email.toLowerCase().trim() }).select(
    "+passwordHash"
  );

  if (!admin || admin.status !== "active") {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  const token = generateToken(admin._id);
  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    },
  });
});

// POST /api/auth/logout (admin)
const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully." });
});

// GET /api/auth/me (admin) - lets the frontend check "am I still logged in?"
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
    },
  });
});

module.exports = { login, logout, getMe };
