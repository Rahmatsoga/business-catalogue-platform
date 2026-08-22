const jwt = require("jsonwebtoken");

function generateToken(adminId) {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function setAuthCookie(res, token) {
  const cookieName = process.env.COOKIE_NAME || "catalogue_admin_token";

  res.cookie(cookieName, token, {
    httpOnly: true, // JS on the frontend can never read this cookie - protects against XSS token theft
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
}

function clearAuthCookie(res) {
  const cookieName = process.env.COOKIE_NAME || "catalogue_admin_token";
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

module.exports = { generateToken, setAuthCookie, clearAuthCookie };
