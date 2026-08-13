const multer = require("multer");

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Multer's fileFilter only sees the Content-Type header the *client* sent —
 * trivial to spoof (rename a .php/.svg/.html file to photo.jpg). This checks
 * the actual file signature ("magic bytes") of the first few bytes instead,
 * which is what the file really is regardless of what it claims to be.
 */
function sniffImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  const b = buffer;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "image/gif";
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) return "image/webp";
  return null;
}

const EXT_BY_MIME = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };

const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // First-pass check on the client-declared type, purely to reject obviously
    // wrong uploads early. The authoritative check happens after the buffer
    // is fully received, in validateImageBuffer below.
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WEBP, or GIF images are allowed."));
    }
    cb(null, true);
  },
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});

/** Run after multer, before the route handler. Verifies the file content matches an allowed image type. */
function validateImageBuffer(req, res, next) {
  if (!req.file) return res.status(400).json({ error: "No file received." });
  const realType = sniffImageType(req.file.buffer);
  if (!realType) {
    return res.status(400).json({ error: "That file doesn't look like a valid JPEG, PNG, WEBP, or GIF image." });
  }
  req.file.detectedMimetype = realType;
  req.file.detectedExt = EXT_BY_MIME[realType];
  next();
}

module.exports = { uploadAvatar, validateImageBuffer };
