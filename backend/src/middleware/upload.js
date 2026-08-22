const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

/**
 * Image upload middleware for the admin panel.
 *
 * Security posture:
 * - Filenames are generated server-side from a random id. The client-supplied
 *   name is never used for the path, so traversal ("../../etc/passwd") and
 *   double-extension tricks ("x.php.jpg") cannot influence where a file lands.
 * - Extension is derived from the whitelisted MIME type, not from the upload.
 * - Only image MIME types are accepted, and a size cap is enforced by multer.
 * - Files land in a directory served as static assets with no execution, so an
 *   uploaded script is bytes on disk, not a handler.
 */

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

// MIME type -> canonical extension. The value side is what we write to disk.
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': null, // explicitly rejected below - SVG can carry scripts
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Total bytes the uploads directory may hold. Per-file caps alone do not bound
// disk usage: 5MB x unlimited uploads still fills the volume. This is a coarse
// guard against a runaway client or a compromised admin session, not a quota
// system - it is checked before accepting a file, so the ceiling can be
// exceeded by at most one file.
const MAX_TOTAL_BYTES = 200 * 1024 * 1024; // 200 MB

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Sum the bytes currently stored in the uploads directory.
 */
async function currentUsageBytes() {
  const entries = await fs.promises.readdir(UPLOAD_DIR, { withFileTypes: true });
  const sizes = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        try {
          const stat = await fs.promises.stat(path.join(UPLOAD_DIR, entry.name));
          return stat.size;
        } catch {
          // File vanished between readdir and stat - it contributes nothing.
          return 0;
        }
      })
  );
  return sizes.reduce((total, size) => total + size, 0);
}

/**
 * Reject the upload when the directory is already at its ceiling.
 *
 * Runs before multer so a rejected request never writes to disk. A failure to
 * read the directory is treated as "allow": losing the guard is preferable to
 * locking the owner out of their own admin panel over a transient fs error.
 */
async function enforceDiskQuota(req, res, next) {
  try {
    const used = await currentUsageBytes();
    if (used + MAX_FILE_SIZE > MAX_TOTAL_BYTES) {
      return res.status(507).json({
        success: false,
        error:
          'Limite de armazenamento atingido. Apague imagens antigas antes de enviar novas.',
      });
    }
  } catch (error) {
    console.error('Disk quota check failed, allowing upload:', error.message);
  }
  next();
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = ALLOWED_TYPES[file.mimetype];
    if (!ext) {
      return cb(new Error('Unsupported image type'));
    }
    // Random name: no part of the client's filename reaches the filesystem.
    const id = crypto.randomBytes(16).toString('hex');
    cb(null, `${id}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = ALLOWED_TYPES[file.mimetype];
  if (!ext) {
    // Covers both unknown types and SVG, which is mapped to null on purpose:
    // it is an image to browsers but can embed <script>, so it is not allowed.
    return cb(new Error('Only JPG, PNG, WebP and GIF images are allowed'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

/**
 * Translate multer's errors into the API's JSON error shape. Without this an
 * oversized upload surfaces as an unhandled 500 instead of a clear 400.
 */
function handleUploadErrors(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 5MB or smaller'
        : 'Upload failed: ' + err.message;
    return res.status(400).json({ success: false, error: message });
  }

  if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }

  next();
}

module.exports = {
  upload,
  handleUploadErrors,
  enforceDiskQuota,
  currentUsageBytes,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  MAX_TOTAL_BYTES,
};
