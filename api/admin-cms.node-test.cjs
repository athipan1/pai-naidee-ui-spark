const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cleanPlace, registerAdminCms } = require('./admin-cms.cjs');
const { createRoleGuard } = require('./security.cjs');
const { hashPassword, verifyPassword, hashToken } = require('./railway-admin-auth.cjs');

const good = { name: 'Test Place', nameLocal: 'สถานที่ทดสอบ', province: 'มุกดาหาร', category: 'Culture', description: 'description', lat: 16.5, lng: 104.7 };

test('CMS validates coordinates and HTTPS media links', () => {
  assert.equal(cleanPlace(good).errors.length, 0);
  assert.ok(cleanPlace({ ...good, lat: 90 }).errors.length > 0);
  assert.ok(cleanPlace({ ...good, imageUrl: 'javascript:alert(1)' }).errors.length > 0);
  assert.ok(cleanPlace({ ...good, name: '' }).errors.length > 0);
});

test('Admin catalog reuses public smart search and supports browsing existing places', async () => {
  const routes = new Map();
  const app = {
    get: (path, ...handlers) => routes.set(path, handlers.at(-1)),
    post() {}, put() {},
  };
  const calls = [];
  registerAdminCms(app, {
    getSql: () => { throw new Error('catalog must use shared public search'); },
    requireAdmin: (_req, _res, next) => next(),
    storage: { single: () => (_req, _res, next) => next() },
    uploadImage: async () => '',
    listPlaces: async options => {
      calls.push(options);
      return { total: 1, attractions: [{ id: 'curated-wat-phu-manorom', name: 'Wat Roi Phra Phutthabat Phu Manorom', nameLocal: 'วัดรอยพระพุทธบาทภูมโนรมย์', province: 'มุกดาหาร' }] };
    },
  });
  const route = routes.get('/api/admin/catalog');
  let body;
  await route({ query: { q: 'วัดภูมโนรมย์' } }, { json: value => { body = value; } });
  assert.equal(calls[0].search, 'วัดภูมโนรมย์');
  assert.equal(body.places[0].name_local, 'วัดรอยพระพุทธบาทภูมโนรมย์');
  await route({ query: {} }, { json: value => { body = value; } });
  assert.equal(calls[1].search, '');
  assert.equal(body.total, 1);
});

test('Admin media preview includes existing media and main image without duplicates', async () => {
  const routes = new Map();
  registerAdminCms({
    get: (path, ...handlers) => routes.set(path, handlers.at(-1)), post() {}, put() {},
  }, {
    getSql: () => async (strings) => strings[0].includes('SELECT image_url')
      ? [{ image_url: 'https://example.com/main.jpg' }]
      : [{ id: 'media-1', url: 'https://example.com/main.jpg', title: 'Same' }, { id: 'media-2', url: 'https://example.com/side.jpg', title: 'Side' }],
    listPlaces: async () => ({ attractions: [], total: 0 }),
    requireAdmin: (_req, _res, next) => next(), storage: { single: () => (_req, _res, next) => next() }, uploadImage: async () => '',
  });
  let body;
  await routes.get('/api/admin/catalog/:placeId/media')({ params: { placeId: 'known' } }, { json: value => { body = value; } });
  assert.deepEqual(body.images.map(image => image.url), ['https://example.com/main.jpg', 'https://example.com/side.jpg']);
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
