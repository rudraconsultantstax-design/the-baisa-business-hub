import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { signSession, verifySession } from '../lib/session.ts';

test('production sessions require a secret and reject tampering or invalid claims', () => {
  const original = { ...process.env };
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.AUTH_SECRET;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const user = { userId: 'test-user', orgId: 'test-org', name: 'Test', email: 'test@example.com', role: 'owner' };
    assert.throws(() => signSession(user), /not configured/);
    assert.equal(verifySession('payload.signature'), null);
    process.env.AUTH_SECRET = 'test-only-key-do-not-use-in-production';
    const token = signSession(user);
    assert.equal(verifySession(token)?.orgId, 'test-org');
    assert.equal(verifySession(token + '.extra'), null);
    assert.equal(verifySession(token.slice(0, -1) + '!'), null);
    function signed(claims) {
      const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
      return body + '.' + crypto.createHmac('sha256', process.env.AUTH_SECRET).update(body).digest('base64url');
    }
    assert.equal(verifySession(signed({ ...user, iat: Date.now() + 120_000 })), null);
    assert.equal(verifySession(signed({ ...user, iat: Date.now() - 31 * 86400_000 })), null);
    assert.equal(verifySession(signed({ ...user, orgId: '', iat: Date.now() })), null);
  } finally {
    for (const key of ['NODE_ENV', 'AUTH_SECRET', 'SUPABASE_SERVICE_ROLE_KEY']) {
      if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key];
    }
  }
});
