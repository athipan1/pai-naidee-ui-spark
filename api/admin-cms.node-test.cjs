const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cleanPlace } = require('./admin-cms.cjs');
const { createRoleGuard } = require('./security.cjs');
const { hashPassword, verifyPassword, hashToken } = require('./railway-admin-auth.cjs');

const good = { name: 'Test Place', nameLocal: 'สถานที่ทดสอบ', province: 'มุกดาหาร', category: 'Culture', description: 'description', lat: 16.5, lng: 104.7 };

test('CMS validates coordinates and HTTPS media links', () => {
  assert.equal(cleanPlace(good).errors.length, 0);
  assert.ok(cleanPlace({ ...good, lat: 90 }).errors.length > 0);
  assert.ok(cleanPlace({ ...good, imageUrl: 'javascript:alert(1)' }).errors.length > 0);
  assert.ok(cleanPlace({ ...good, name: '' }).errors.length > 0);
});

test('admin role guard denies anonymous access before any database interaction', async () => {
  const guard = createRoleGuard({ auth: { getUser: () => { throw new Error('must not call auth without token'); } } }, ['admin']);
  let status = 0;
  await guard({ headers: {} }, { status: code => { status = code; return { json() {} }; } }, () => assert.fail('No anonymous access'));
  assert.equal(status, 401);
});

test('Railway passwords use salted scrypt; session secrets are hashed', () => {
  const password = 'AnActualLongPassword123!';
  const first = hashPassword(password);
  const second = hashPassword(password);
  assert.notEqual(first, second);
  assert.equal(verifyPassword(password, first), true);
  assert.equal(verifyPassword('wrong-password', first), false);
  assert.equal(verifyPassword('wrong-password', undefined), false);
  assert.notEqual(hashToken('random-token-secret'), 'random-token-secret');
});
