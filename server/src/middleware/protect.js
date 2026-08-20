const jwt = require("jsonwebtoken");
const Administrator = require("../models/Administrator");

/**
 * Verifies the JWT stored in the httpOnly cookie.
 * If valid, attaches the admin (minus password) to req.admin and continues.
 * If missing/invalid, rejects with 401 before the request reaches the controller.
 */
async function protect(req, res, next) {
  try {
    const cookieName = process.env.COOKIE_NAME || "catalogue_admin_token";
    const token = req.cookies[cookieName];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired or you are not authorized.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Administrator.findById(decoded.id);

    if (!admin || admin.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired or you are not authorized.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Your session has expired or you are not authorized.",
    });
  }
}

module.exports = protect;
