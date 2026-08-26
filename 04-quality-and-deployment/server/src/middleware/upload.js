const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per image

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "items");

// Guarantee this folder exists every time the server starts, rather than
// assuming it's already on disk. Empty folders don't reliably survive being
// zipped/unzipped or cloned in every tool, so we create it defensively here
// instead of depending on a placeholder file surviving the trip.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Random filename so nobody can guess/overwrite another item's images,
    // and so re-uploading a file with the same original name doesn't collide.
    const uniqueSuffix = crypto.randomBytes(12).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, or WebP images are allowed"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

module.exports = upload;
