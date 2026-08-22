const jwt = require("jsonwebtoken");
const Administrator = require("../models/Administrator");

/**
 * requireAdmin: reads the JWT from the httpOnly cookie (set at login),
 * verifies it, and attaches the logged-in admin to req.admin.
 * If anything is missing/invalid, it responds 401 instead of calling next().
 */
async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "You are not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Administrator.findById(decoded.id);

    if (!admin || admin.status !== "active") {
      return res.status(401).json({ success: false, message: "Your session has expired or you are not authorized" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Your session has expired or you are not authorized" });
  }
}

module.exports = { requireAdmin };
