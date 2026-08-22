const fs = require('fs');
const path = require('path');
const request = require('supertest');

// Mock payment config before requiring app (matches the admin route tests).
jest.mock('../../src/config/payment', () => ({
  MercadoPago: {
    MercadoPagoClient: jest.fn(),
  },
  validateWebhookSignature: jest.fn(),
  getPaymentStatus: jest.fn(),
}));

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const app = require('../../src/app');
const { generateToken } = require('../../src/middleware/auth');
const { UPLOAD_DIR } = require('../../src/middleware/upload');

// 1x1 transparent PNG.
const PNG_FIXTURE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

describe('Upload Routes', () => {
  let adminToken;
  let customerToken;
  const written = [];

  beforeAll(() => {
    adminToken = generateToken({ id: 1, email: 'admin@test.com', role: 'admin' });
    customerToken = generateToken({ id: 2, email: 'customer@test.com', role: 'customer' });
  });

  // Remove only the files these tests created; never wipe the directory.
  afterAll(async () => {
    await Promise.all(
      written.map((name) => fs.promises.unlink(path.join(UPLOAD_DIR, name)).catch(() => {}))
    );
  });

  describe('authorization', () => {
    it('rejects an upload with no token', async () => {
      const res = await request(app).post('/api/upload').attach('image', PNG_FIXTURE, 'a.png');
      expect(res.status).toBe(401);
    });

    it('rejects an upload from a customer', async () => {
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${customerToken}`)
        .attach('image', PNG_FIXTURE, 'a.png');
      expect(res.status).toBe(403);
    });

    it('rejects listing uploads without admin role', async () => {
      const res = await request(app)
        .get('/api/upload')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('rejects a delete from a customer', async () => {
      const res = await request(app)
        .delete(`/api/upload/${'a'.repeat(32)}.png`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('admin uploads', () => {
    it('accepts a PNG and returns a public URL', async () => {
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', PNG_FIXTURE, 'photo.png');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toMatch(/^\/uploads\/[a-f0-9]{32}\.png$/);

      written.push(res.body.data.filename);
      expect(fs.existsSync(path.join(UPLOAD_DIR, res.body.data.filename))).toBe(true);
    });

    it('discards the client filename rather than trusting it', async () => {
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', PNG_FIXTURE, '../../../../etc/passwd.png');

      expect(res.status).toBe(201);
      // The stored name is server-generated, so no traversal fragment survives.
      expect(res.body.data.filename).toMatch(/^[a-f0-9]{32}\.png$/);
      expect(res.body.data.filename).not.toContain('..');
      expect(res.body.data.filename).not.toContain('passwd');

      written.push(res.body.data.filename);
    });

    it('derives the extension from the MIME type, not the upload name', async () => {
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', PNG_FIXTURE, { filename: 'x.php.png', contentType: 'image/png' });

      expect(res.status).toBe(201);
      expect(res.body.data.filename.endsWith('.png')).toBe(true);
      expect(res.body.data.filename).not.toContain('.php');

      written.push(res.body.data.filename);
    });

    it('rejects a non-image MIME type', async () => {
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('<?php echo 1; ?>'), {
          filename: 'evil.php',
          contentType: 'application/x-php',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects SVG, which can carry scripts', async () => {
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), {
          filename: 'x.svg',
          contentType: 'image/svg+xml',
        });

      expect(res.status).toBe(400);
    });

    it('rejects a file over the 5MB cap', async () => {
      const oversized = Buffer.alloc(6 * 1024 * 1024, 0);
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', oversized, { filename: 'big.png', contentType: 'image/png' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/5MB/i);
    });

    it('returns 400 when no file is attached', async () => {
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('admin delete', () => {
    it('rejects a filename outside the generated shape', async () => {
      const res = await request(app)
        .delete('/api/upload/..%2F..%2Fetc%2Fpasswd')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([400, 404]).toContain(res.status);
    });

    it('returns 404 for a well-formed name that does not exist', async () => {
      const res = await request(app)
        .delete(`/api/upload/${'b'.repeat(32)}.png`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('deletes a file it previously stored', async () => {
      const upload = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', PNG_FIXTURE, 'temp.png');

      const { filename } = upload.body.data;

      const res = await request(app)
        .delete(`/api/upload/${filename}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(fs.existsSync(path.join(UPLOAD_DIR, filename))).toBe(false);
    });
  });
});
