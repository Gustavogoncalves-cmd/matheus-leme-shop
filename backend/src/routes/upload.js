const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  upload,
  handleUploadErrors,
  enforceDiskQuota,
  currentUsageBytes,
  UPLOAD_DIR,
  MAX_TOTAL_BYTES,
} = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/security');

/**
 * Image upload routes. Admin only - there is no public write path here.
 */

const adminOnly = [authenticate, authorize('admin')];

/**
 * POST /api/upload
 * Multipart form with a single "image" field. Returns the public URL.
 */
router.post(
  '/',
  adminOnly,
  uploadLimiter,
  enforceDiskQuota,
  upload.single('image'),
  handleUploadErrors,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    res.status(201).json({
      success: true,
      data: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }
);

/**
 * GET /api/upload
 * Admin only. Lists uploaded images so the panel can offer a picker.
 */
router.get('/', adminOnly, async (req, res) => {
  try {
    const entries = await fs.promises.readdir(UPLOAD_DIR, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
        .map(async (entry) => {
          const stat = await fs.promises.stat(path.join(UPLOAD_DIR, entry.name));
          return {
            url: `/uploads/${entry.name}`,
            filename: entry.name,
            size: stat.size,
            uploaded_at: stat.mtime,
          };
        })
    );

    files.sort((a, b) => b.uploaded_at - a.uploaded_at);

    // The panel shows remaining space so the owner can clean up before hitting
    // the ceiling instead of discovering it on a failed upload.
    const used = await currentUsageBytes();

    res.json({
      success: true,
      data: files,
      storage: { used_bytes: used, limit_bytes: MAX_TOTAL_BYTES },
    });
  } catch (error) {
    console.error('List uploads error:', error);
    res.status(500).json({ success: false, error: 'Failed to list uploads' });
  }
});

/**
 * DELETE /api/upload/:filename
 * Admin only. The filename is matched against the exact shape this server
 * generates (32 hex chars + known extension), so no client-supplied path
 * fragment can escape the uploads directory.
 */
router.delete('/:filename', adminOnly, async (req, res) => {
  const { filename } = req.params;

  if (!/^[a-f0-9]{32}\.(jpg|png|webp|gif)$/.test(filename)) {
    return res.status(400).json({ success: false, error: 'Invalid filename' });
  }

  try {
    await fs.promises.unlink(path.join(UPLOAD_DIR, filename));
    res.json({ success: true, data: { filename } });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    console.error('Delete upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete file' });
  }
});

module.exports = router;
