const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateContentKey,
  validateContentSection,
  validateContentUpdate,
  validateContentCreate,
} = require('../middleware/validation');

/**
 * Site content (CMS) routes.
 *
 * GET endpoints are public - the storefront renders from them on every page
 * load. Every mutating endpoint requires a valid JWT AND the admin role, so a
 * customer token cannot rewrite site copy.
 */

const adminOnly = [authenticate, authorize('admin')];

/**
 * GET /api/content
 * Public. Returns a { key: value } map by default; ?full=true returns rows
 * with type/section/label metadata for the admin editor.
 */
router.get('/', async (req, res) => {
  try {
    const full = req.query.full === 'true';
    const data = full ? await Content.getAll() : await Content.getMap();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content' });
  }
});

/**
 * GET /api/content/section/:section
 * Public. All fields for one page section.
 */
router.get('/section/:section', validateContentSection, async (req, res) => {
  try {
    const rows = await Content.getBySection(req.params.section);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get content section error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content section' });
  }
});

/**
 * GET /api/content/:key
 * Public. One field.
 */
router.get('/:key', validateContentKey, async (req, res) => {
  try {
    const row = await Content.getByKey(req.params.key);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Content key not found' });
    }
    res.json({ success: true, data: row });
  } catch (error) {
    console.error('Get content key error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content' });
  }
});

/**
 * PUT /api/content/:key
 * Admin only. Updates an existing field.
 */
router.put('/:key', adminOnly, validateContentUpdate, async (req, res) => {
  try {
    const updated = await Content.update(req.params.key, req.body.value, req.user.id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Content key not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ success: false, error: 'Failed to update content' });
  }
});

/**
 * POST /api/content
 * Admin only. Creates a new field, or updates it if the key already exists.
 */
router.post('/', adminOnly, validateContentCreate, async (req, res) => {
  try {
    const row = await Content.upsert(
      {
        key: req.body.key,
        value: req.body.value ?? '',
        type: req.body.type,
        section: req.body.section,
        label: req.body.label ?? null,
      },
      req.user.id
    );
    res.status(201).json({ success: true, data: row });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ success: false, error: 'Failed to create content' });
  }
});

/**
 * DELETE /api/content/:key
 * Admin only.
 */
router.delete('/:key', adminOnly, validateContentKey, async (req, res) => {
  try {
    const removed = await Content.remove(req.params.key);
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Content key not found' });
    }
    res.json({ success: true, data: { key: req.params.key } });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete content' });
  }
});

module.exports = router;
