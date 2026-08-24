const jwt = require("jsonwebtoken");
const Administrator = require("../models/Administrator");

function signToken(adminId) {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

// POST /api/auth/login  (public)
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  // .select("+passwordHash") because the schema hides it by default
  const admin = await Administrator.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");

  if (!admin || admin.status !== "active") {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = signToken(admin._id);
  res.cookie("token", token, cookieOptions());

  return res.status(200).json({
    success: true,
    data: { id: admin._id, name: admin.name, email: admin.email },
  });
}

// POST /api/auth/logout  (admin)
function logout(req, res) {
  res.clearCookie("token", cookieOptions());
  return res.status(200).json({ success: true, message: "Logged out" });
}

// GET /api/auth/me  (admin) - lets the frontend check "am I still logged in?"
function me(req, res) {
  return res.status(200).json({
    success: true,
    data: { id: req.admin._id, name: req.admin.name, email: req.admin.email },
  });
}

module.exports = { login, logout, me };
