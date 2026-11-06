const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');
const { authRoutes, hashPassword, hashToken } = require('./railway-admin-auth.cjs');
const { registerAdminCms } = require('./admin-cms.cjs');
const { createImageUpload, registerRailwayMedia, uploadImage, MAX_IMAGE_BYTES } = require('./railway-media.cjs');
const { ensureAiSettings, MODEL_OPTIONS, registerAiSettingsRoutes } = require('./ai-model-settings.cjs');
const { registerAiHealthRoutes } = require('./ai-health-check.cjs');
const { closeDatabase, ensureSchemaTables, getSql, invalidateSearchIndex, listPlaces } = require('./postgres-db.cjs');
const { app: publicApp } = require('./railway-server.cjs');

const password = 'cms-fixture-admin-password';
const email = 'cms-admin@example.test';
const fixture = { name: 'Isolated CMS Fixture', nameLocal: 'รายการจำลอง', province: 'ชลบุรี', category: 'Culture',
  description: 'Fixture description', lat: 13.2, lng: 100.9, imageUrl: '' };

test('Admin CMS HTTP and PostgreSQL integration', async t => {
  const port = Number(process.env.CMS_TEST_DATABASE_PORT);
  assert.ok(Number.isInteger(port) && port > 0 && port <= 65535, 'CMS_TEST_DATABASE_PORT must point to the isolated local service');
  // Ignore all configured application database URLs and credentials. This suite only writes to its local fixture database.
  process.env.DATABASE_URL = `postgres://cms_test:cms_local_fixture@127.0.0.1:${port}/painaidee_cms_test?sslmode=disable`;
  process.env.PUBLIC_API_BASE_URL = 'https://cms-api.example.test';
  process.env.OPENROUTER_API_KEY = 'local-fixture-key';
  process.env.OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
  process.env.OPENROUTER_MODEL = MODEL_OPTIONS[0].id;
  process.env.AI_ALLOW_PAID_MODELS = 'false';
  process.env.AI_MODEL_FALLBACK_ENABLED = 'false';
  t.after(closeDatabase);
  const sql = getSql();
  await ensureSchemaTables(sql);
  await ensureAiSettings(getSql);
  await sql`INSERT INTO admin_users (id, email, password_hash) VALUES ('test-admin', ${email}, ${hashPassword(password)})`;
  await sql`INSERT INTO places (id, name, province, category, lat, lng) VALUES
    ('fixture-other', 'Other Fixture', 'ชลบุรี', 'Culture', 13.6, 101.1)`;

  const objects = new Map();
  let failStorage = false;
  let modelProbes = 0;
  const storage = { bucket: 'private-cms-fixture', client: { async send(command) {
    assert.equal(command.input.Bucket, 'private-cms-fixture');
    if (failStorage) throw new Error('fixture storage error with sensitive detail');
    if ('Body' in command.input) {
      assert.equal(command.input.ACL, undefined);
      objects.set(command.input.Key, command.input.Body);
      return {};
    }
    const bytes = objects.get(command.input.Key);
    if (!bytes) throw Object.assign(new Error('Fixture object missing'), { name: 'NoSuchKey' });
    return { Body: [bytes] };
  } } };
  const app = express();
  app.use(express.json());
  const requireAdmin = authRoutes(app, { getSql, limitLogin: (_req, _res, next) => next() });
  registerAdminCms(app, { getSql, listPlaces, requireAdmin, storage: createImageUpload(),
    uploadImage: file => uploadImage(storage, file), invalidateSearchIndex });
  registerRailwayMedia(app, { getSql, storage, requireAdmin });
  registerAiSettingsRoutes(app, { requireAdmin, getSql, checkModel: async model => ({ ok: true, model }) });
  registerAiHealthRoutes(app, { requireAdmin, getSql, request: async (_url, options) => {
    modelProbes++;
    const body = JSON.parse(options.body);
    assert.equal(body.model, MODEL_OPTIONS[1].id);
    assert.equal(body.provider.allow_fallbacks, false);
    return { model: body.model, choices: [{ finish_reason: 'stop', message: { content: '{"days":[{"day":1,"placeIds":["test-place"]}]}' } }], usage: { cost: 0 } };
  } });

  async function serve(application) {
    const server = application.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
    return `http://127.0.0.1:${server.address().port}`;
  }
  const [base, publicBase] = await Promise.all([serve(app), serve(publicApp)]);
  let token;
  async function request(path, { method = 'GET', body, auth = true, status = 200, origin = base } = {}) {
    const headers = auth && token ? { Authorization: `Bearer ${token}` } : {};
    if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const res = await fetch(origin + path, { method, headers, body: body instanceof FormData ? body : JSON.stringify(body) });
    assert.equal(res.status, status, `${method} ${path} returned ${res.status}, expected ${status}`);
    return res;
  }
  const admin = (path, options) => request('/api/admin' + path, options);
  const publicApi = (path, status = 200) => request(path, { status, auth: false, origin: publicBase });
  const write = (path, body, status = 200, method = 'POST') => admin(path, { method, body, status }).then(res => res.json());
  const signIn = async () => { token = (await write('/login', { email, password })).token; };
  const makeDraft = fields => write('/places', { ...fixture, ...fields }, 201);
  const publish = (draft, status = 200) => write(`/places/${draft.id}/publish`, { version: draft.version }, status);
  const upload = (type, bytes, status = 201) => {
    const body = new FormData();
    body.set('image', new Blob([bytes], { type }), 'fixture.image');
    return admin('/media', { method: 'POST', body, status });
  };

  await t.test('auth protects every admin route, rejects invalid/expired/disabled sessions and revokes logout', async () => {
    const guarded = [
      ['GET', '/me'], ['POST', '/logout'], ['GET', '/places'], ['POST', '/places'], ['PUT', '/places/x'],
      ['POST', '/places/x/publish'], ['GET', '/catalog'], ['GET', '/geocode'], ['POST', '/catalog/x/edit'],
      ['GET', '/catalog/x/aliases'], ['POST', '/catalog/x/aliases'], ['POST', '/aliases/x/review'],
      ['GET', '/catalog/x/media'], ['GET', '/media/1a111111-1111-4111-8111-111111111111.png'],
      ['POST', '/media'], ['GET', '/ai/models'], ['GET', '/ai/models/validate'], ['PUT', '/ai/models'],
      ['POST', '/ai/health-check'],
    ];
    for (const [method, path] of guarded) {
      const response = await admin(path, { method, status: 401, auth: false });
      assert.match(response.headers.get('cache-control'), /no-store/);
    }
    await write('/login', { email, password: 'invalid' }, 401);
    await signIn();
    assert.equal((await (await admin('/me')).json()).role, 'admin');
    await admin('/logout', { method: 'POST' });
    await admin('/me', { status: 401 });
    await signIn();
    await sql`UPDATE admin_sessions SET expires_at = NOW() - INTERVAL '1 minute' WHERE token_hash = ${hashToken(token)}`;
    await admin('/me', { status: 401 });
    await signIn();
    await sql`UPDATE admin_users SET disabled = TRUE WHERE id = 'test-admin'`;
    await admin('/me', { status: 401 });
    await sql`UPDATE admin_users SET disabled = FALSE WHERE id = 'test-admin'`;
    await signIn();
  });

  let placeId, imagePath;
  await t.test('draft stays private, upload validates types and size, and publication exposes the image and place', async () => {
    const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    await upload('image/jpeg', Buffer.from([255, 216, 255]));
    await upload('image/webp', Buffer.from('RIFF0000WEBP'));
    await upload('image/png', Buffer.concat([png, Buffer.alloc(MAX_IMAGE_BYTES - png.length)]));
    await upload('image/svg+xml', Buffer.from('<svg/>'), 400);
    await upload('image/png', Buffer.from('invalid'), 400);
    await upload('image/png', Buffer.alloc(MAX_IMAGE_BYTES + 1), 413);
    failStorage = true;
    const failure = await upload('image/png', png, 503);
    assert.doesNotMatch(await failure.text(), /sensitive detail/);
    failStorage = false;
    const { imageUrl } = await (await upload('image/png', png)).json();
    imagePath = new URL(imageUrl).pathname;
    const privateImage = await admin(`/media/${imagePath.split('/').at(-1)}`);
    assert.equal(privateImage.headers.get('content-type'), 'image/png');
    assert.match(privateImage.headers.get('cache-control'), /no-store/);
    assert.deepEqual(Buffer.from(await privateImage.arrayBuffer()), png);
    await request(imagePath, { status: 404, auth: false });

    await write('/places', { ...fixture, imageUrl: 'https://lh3.googleusercontent.com/places/example' }, 400);
    const draft = await makeDraft({ imageUrl });
    await publicApi(`/api/places/cms:${draft.id}`, 404);
    assert.deepEqual((await (await publicApi('/api/places?search=Isolated%20CMS%20Fixture')).json()).attractions, []);
    const staleVersion = draft.version;
    const saved = await write(`/places/${draft.id}`, { ...draft.payload, version: staleVersion, description: 'Edited fixture' }, 200, 'PUT');
    assert.notEqual(saved.version, staleVersion);
    await write(`/places/${draft.id}`, { ...draft.payload, version: staleVersion }, 409, 'PUT');
    await publish(draft, 409);
    placeId = (await publish(saved)).placeId;
    assert.equal((await publish(saved)).placeId, placeId);
    const search = await (await publicApi('/api/places?search=Isolated%20CMS%20Fixture')).json();
    assert.equal(search.attractions[0].id, placeId);
    const detail = await (await publicApi(`/api/places/${placeId}`)).json();
    assert.equal(detail.description, 'Edited fixture');
    assert.equal(detail.images[0], imageUrl);
    assert.deepEqual(Buffer.from(await (await request(imagePath, { auth: false })).arrayBuffer()), png);
  });

  await t.test('duplicate publications are serialized and an error rolls back place and draft writes', async () => {
    await publish(await makeDraft({ name: 'Near Existing Fixture', nameLocal: '', lat: 13.2001 }), 409);
    const [first, second] = await Promise.all([
      makeDraft({ name: 'Concurrent Fixture', nameLocal: '', lat: 14, lng: 101 }),
      makeDraft({ name: 'Concurrent Fixture', nameLocal: '', lat: 14.0001, lng: 101 }),
    ]);
    const results = await Promise.all([first, second].map(draft => fetch(`${base}/api/admin/places/${draft.id}/publish`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ version: draft.version }),
    })));
    assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
    await sql`ALTER TABLE media ADD CONSTRAINT cms_test_rollback CHECK (url <> 'https://example.test/fail-transaction.png')`;
    const failed = await makeDraft({ name: 'Rollback Fixture', nameLocal: '', lat: 14.5, lng: 101.5, imageUrl: 'https://example.test/fail-transaction.png' });
    await publish(failed, 503);
    await publicApi(`/api/places/cms:${failed.id}`, 404);
    const [row] = await sql`SELECT status FROM place_drafts WHERE id = ${failed.id}`;
    assert.equal(row.status, 'draft');
  });

  await t.test('existing-place edits preserve media and metadata, with microsecond conflict detection', async () => {
    await sql`UPDATE places SET tags = '["fixture-tag"]', review_count = 17 WHERE id = ${placeId}`;
    const edit = await write(`/catalog/${placeId}/edit`, {}, 201);
    assert.equal(typeof edit.payload.lat, 'number');
    assert.equal((await write(`/catalog/${placeId}/edit`, {})).id, edit.id);
    const main = 'https://example.test/new-main.png';
    const saved = await write(`/places/${edit.id}`, { ...edit.payload, imageUrl: main, version: edit.version }, 200, 'PUT');
    await publish(saved);
    const detail = await (await publicApi(`/api/places/${placeId}`)).json();
    assert.equal(detail.images[0], main);
    assert.ok(detail.images[1].endsWith(imagePath));
    assert.deepEqual(detail.tags, ['fixture-tag']);
    assert.equal(detail.reviewCount, 17);
    const next = await write(`/catalog/${placeId}/edit`, {}, 201);
    await sql`UPDATE places SET updated_at = updated_at + INTERVAL '1 microsecond' WHERE id = ${placeId}`;
    await publish(next, 409);
  });

  await t.test('approved aliases appear in search and rejected or duplicate aliases do not', async () => {
    const path = `/catalog/${placeId}/aliases`;
    const approved = { aliasName: 'Unique Synonym Fixture', language: 'en' };
    const alias = await write(path, approved, 201);
    await write(path, approved, 409);
    await write(`/aliases/${alias.id}/review`, { status: 'approved' });
    const rejected = await write(path, { aliasName: 'Unlisted Word Fixture', language: 'en' }, 201);
    await write(`/aliases/${rejected.id}/review`, { status: 'rejected' });
    const byAlias = await (await admin('/catalog?q=Unique%20Synonym%20Fixture&page=1')).json();
    assert.equal(byAlias.places[0].id, placeId);
    const rejectedAlias = (await (await admin(path)).json()).aliases.find(item => item.id === rejected.id);
    assert.equal(rejectedAlias.status, 'rejected');
    const other = await write('/catalog/fixture-other/aliases', approved, 201);
    await write(`/aliases/${other.id}/review`, { status: 'approved' }, 409);
  });

  await t.test('allowlisted model settings save and probe with a mock, with no paid call', async () => {
    assert.equal((await (await admin('/ai/models')).json()).options.length, MODEL_OPTIONS.length);
    await admin('/ai/models/validate?model=provider%2Fpaid', { status: 400 });
    const model = MODEL_OPTIONS[1].id;
    await admin(`/ai/models/validate?model=${encodeURIComponent(model)}`);
    await write('/ai/models', { model: 'provider/paid', structuredOutput: false }, 400, 'PUT');
    await write('/ai/models', { model, structuredOutput: true }, 200, 'PUT');
    assert.equal((await (await admin('/ai/models')).json()).selected.model, model);
    assert.equal((await write('/ai/health-check', {})).status, 'ok');
    await write('/ai/health-check', {}, 429);
    assert.equal(modelProbes, 1);
  });
});
