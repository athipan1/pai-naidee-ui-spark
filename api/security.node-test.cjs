const test = require('node:test');
const assert = require('node:assert/strict');
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
