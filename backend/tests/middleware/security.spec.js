const express = require('express');
const request = require('supertest');

/**
 * Rate limiter tests.
 *
 * The limiters are skipped when NODE_ENV=test so that suites driving many
 * logins against one fixture account do not trip them. That skip would also
 * hide a regression in the limiters themselves, so this file mounts them on a
 * throwaway app with the flag cleared and exercises them directly.
 */

describe('Rate limiters', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    // Cleared before requiring the module: the limiters read this at request
    // time via skip(), but keeping it unset for the whole file is simpler.
    process.env.NODE_ENV = 'ratelimit-test';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  // Each test needs a limiter with its own counter store, so the module is
  // re-required under an isolated registry rather than shared across tests.
  const freshLimiters = () => {
    let mod;
    jest.isolateModules(() => {
      mod = require('../../src/middleware/security');
    });
    return mod;
  };

  const appWith = (limiter, method = 'post') => {
    const app = express();
    app.use(express.json());
    app[method]('/probe', limiter, (req, res) => res.status(200).json({ ok: true }));
    return app;
  };

  describe('authLimiter', () => {
    it('blocks after 5 attempts against the same account', async () => {
      const { authLimiter } = freshLimiters();
      const app = appWith(authLimiter);
      const body = { email: 'victim@test.com', password: 'WrongPass123' };

      const statuses = [];
      for (let i = 0; i < 7; i += 1) {
        const res = await request(app).post('/probe').send(body);
        statuses.push(res.status);
      }

      expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
      expect(statuses.slice(5)).toEqual([429, 429]);
    });

    it('keys on the account, so one blocked email does not lock out another', async () => {
      const { authLimiter } = freshLimiters();
      const app = appWith(authLimiter);

      for (let i = 0; i < 6; i += 1) {
        await request(app).post('/probe').send({ email: 'victim@test.com', password: 'x' });
      }

      const blocked = await request(app)
        .post('/probe')
        .send({ email: 'victim@test.com', password: 'x' });
      const other = await request(app)
        .post('/probe')
        .send({ email: 'bystander@test.com', password: 'x' });

      expect(blocked.status).toBe(429);
      expect(other.status).toBe(200);
    });

    it('treats casing as the same account, so case cannot mint fresh buckets', async () => {
      const { authLimiter } = freshLimiters();
      const app = appWith(authLimiter);

      const variants = [
        'victim@test.com',
        'VICTIM@test.com',
        'Victim@Test.com',
        'vIcTiM@test.com',
        'victim@TEST.COM',
        'VicTIM@tesT.cOm',
      ];

      const statuses = [];
      for (const email of variants) {
        const res = await request(app).post('/probe').send({ email, password: 'x' });
        statuses.push(res.status);
      }

      // Six spellings of one address: the sixth must still be refused.
      expect(statuses[5]).toBe(429);
    });

    it('does not count GET requests', async () => {
      const { authLimiter } = freshLimiters();
      const app = appWith(authLimiter, 'get');

      const statuses = [];
      for (let i = 0; i < 8; i += 1) {
        const res = await request(app).get('/probe');
        statuses.push(res.status);
      }

      expect(statuses.every((s) => s === 200)).toBe(true);
    });
  });

  describe('uploadLimiter', () => {
    it('blocks after 20 uploads from the same IP', async () => {
      const { uploadLimiter } = freshLimiters();
      const app = appWith(uploadLimiter);

      const statuses = [];
      for (let i = 0; i < 22; i += 1) {
        const res = await request(app).post('/probe').send({});
        statuses.push(res.status);
      }

      expect(statuses.filter((s) => s === 200)).toHaveLength(20);
      expect(statuses.slice(20)).toEqual([429, 429]);
    });
  });
});
