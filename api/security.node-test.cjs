const test = require('node:test');
const assert = require('node:assert/strict');
const { app: railwayApp } = require('./railway-server.cjs');
const {
  createRoleGuard,
  isUuid,
  validateCreatePlacePayload,
  validateTalkPayload,
  validateUpdatePlacePayload,
} = require('./security.cjs');

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
  };
}

test('role guard rejects missing bearer token', async () => {
  const supabase = { auth: { getUser: async () => ({ data: { user: null }, error: null }) } };
  const guard = createRoleGuard(supabase, ['admin']);
  const res = mockResponse();
  let nextCalled = false;

  await guard({ headers: {} }, res, () => { nextCalled = true; });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test('role guard trusts app_metadata role and allows admin', async () => {
  const supabase = {
    auth: {
      getUser: async (token) => ({
        data: { user: { id: 'u1', app_metadata: { role: token === 'good' ? 'admin' : 'viewer' } } },
        error: null,
      }),
    },
  };
  const guard = createRoleGuard(supabase, ['admin']);
  const res = mockResponse();
  let nextCalled = false;
  const req = { headers: { authorization: 'Bearer good' } };

  await guard(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.auth.role, 'admin');
});

test('role guard ignores user_metadata privileges', async () => {
  const supabase = {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'u1', app_metadata: {}, user_metadata: { role: 'admin' } } },
        error: null,
      }),
    },
  };
  const guard = createRoleGuard(supabase, ['admin']);
  const res = mockResponse();

  await guard({ headers: { authorization: 'Bearer token' } }, res, () => {});

  assert.equal(res.statusCode, 403);
});

test('place validators reject invalid coordinates and empty updates', () => {
  const create = validateCreatePlacePayload({
    placeName: 'A',
    province: 'Bangkok',
    category: 'attraction',
    coordinates: { lat: 200, lng: 100 },
  });
  assert.equal(create.ok, false);

  const update = validateUpdatePlacePayload({});
  assert.equal(update.ok, false);
});

test('talk validator enforces language and message size', () => {
  assert.equal(validateTalkPayload({ message: 'hello', language: 'en' }).ok, true);
  assert.equal(validateTalkPayload({ message: 'hello', language: 'xx' }).ok, false);
  assert.equal(validateTalkPayload({ message: 'x'.repeat(2001), language: 'en' }).ok, false);
});

test('uuid validation is strict', () => {
  assert.equal(isUuid('123e4567-e89b-42d3-a456-426614174000'), true);
  assert.equal(isUuid('../etc/passwd'), false);
});

test('Railway production app exposes no place write routes', () => {
  const routes = railwayApp._router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).filter((method) => layer.route.methods[method]),
    }));

  const placeRoutes = routes.filter(({ path }) => path === '/api/places' || path.startsWith('/api/places/'));
  assert.deepEqual(placeRoutes, [
    { path: '/api/places', methods: ['get'] },
    { path: '/api/places/suggest', methods: ['get'] },
    { path: '/api/places/nearby', methods: ['get'] },
    { path: '/api/places/:placeId', methods: ['get'] },
  ]);
  assert.equal(routes.some(({ path }) => path.startsWith('/api/admin') || path.startsWith('/api/upload')), false);
});

test('Railway app rejects unauthenticated place writes without contacting the database', async (t) => {
  const server = railwayApp.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  for (const [method, path] of [
    ['POST', '/api/places'],
    ['PUT', '/api/places/test-place'],
    ['PATCH', '/api/places/test-place'],
    ['DELETE', '/api/places/test-place'],
    ['POST', '/api/upload'],
    ['POST', '/api/admin/places'],
  ]) {
    await t.test(`${method} ${path} is unavailable`, async () => {
      const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
        method,
        headers: { 'content-type': 'application/json' },
        body: method === 'DELETE' ? undefined : JSON.stringify({ name: 'should-not-be-created' }),
      });
      assert.equal(response.status, 404);
    });
  }
});
