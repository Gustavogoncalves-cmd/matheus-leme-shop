const fs = require('fs');
const path = require('path');

const {
  enforceDiskQuota,
  currentUsageBytes,
  UPLOAD_DIR,
  MAX_TOTAL_BYTES,
} = require('../../src/middleware/upload');

/**
 * Disk quota guard tests.
 *
 * Per-file size caps do not bound total disk usage, so uploads are refused once
 * the directory is near its ceiling. These tests write real files into the real
 * uploads directory and clean up after themselves; every fixture is prefixed so
 * a failed run cannot delete genuine uploads.
 */

const FIXTURE_PREFIX = '_spec_quota_';

// Sparse files: truncate() reserves the size without writing the bytes, so a
// 200MB fixture costs no real disk and the test stays fast.
const writeSparse = (name, bytes) => {
  const fd = fs.openSync(path.join(UPLOAD_DIR, name), 'w');
  fs.ftruncateSync(fd, bytes);
  fs.closeSync(fd);
};

const cleanFixtures = () => {
  for (const entry of fs.readdirSync(UPLOAD_DIR)) {
    if (entry.startsWith(FIXTURE_PREFIX)) {
      fs.unlinkSync(path.join(UPLOAD_DIR, entry));
    }
  }
};

const mockRes = () => ({
  status(code) {
    this.code = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

describe('enforceDiskQuota', () => {
  beforeEach(cleanFixtures);
  afterAll(cleanFixtures);

  it('allows an upload when the directory has room', async () => {
    const res = mockRes();
    const next = jest.fn();

    await enforceDiskQuota({}, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.code).toBeUndefined();
  });

  it('refuses with 507 once the directory is at its ceiling', async () => {
    writeSparse(`${FIXTURE_PREFIX}full.bin`, MAX_TOTAL_BYTES);

    const res = mockRes();
    const next = jest.fn();

    await enforceDiskQuota({}, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.code).toBe(507);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Limite de armazenamento');
  });

  it('reserves headroom for one max-size file rather than waiting for a full disk', async () => {
    // Just under the limit, but with less than one 5MB file of room left.
    writeSparse(`${FIXTURE_PREFIX}near.bin`, MAX_TOTAL_BYTES - 1024);

    const res = mockRes();
    const next = jest.fn();

    await enforceDiskQuota({}, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.code).toBe(507);
  });

  it('allows the upload when the directory cannot be read', async () => {
    // Losing the guard is preferable to locking the owner out of the panel over
    // a transient fs error, so a failed check must fall through to next().
    const spy = jest.spyOn(fs.promises, 'readdir').mockRejectedValue(new Error('EIO'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = mockRes();
    const next = jest.fn();

    await enforceDiskQuota({}, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.code).toBeUndefined();

    spy.mockRestore();
    errSpy.mockRestore();
  });
});

describe('currentUsageBytes', () => {
  beforeEach(cleanFixtures);
  afterAll(cleanFixtures);

  it('sums the sizes of the files present', async () => {
    const before = await currentUsageBytes();

    writeSparse(`${FIXTURE_PREFIX}a.bin`, 1024);
    writeSparse(`${FIXTURE_PREFIX}b.bin`, 2048);

    const after = await currentUsageBytes();

    expect(after - before).toBe(3072);
  });
});
