const { seedPlaceMedia } = require('./seed-place-media.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');
const { authRoutes, hashPassword, hashToken } = require('./railway-admin-auth.cjs');
const { registerAdminCms } = require('./admin-cms.cjs');
const { registerQualityReview } = require('./place-quality-review.cjs');
const { registerGoogleVerification } = require('./google-place-verification.cjs');
const { registerPlaceReviewWorkflow } = require('./place-review-workflow.cjs');
const { applyPlaceReviewSchema } = require('./place-review-schema.cjs');
const {fixturePng}=require('./test-fixtures/image.cjs');
const {registerProvinceReviewPipeline}=require('./province-review-pipeline.cjs');
const {boundaryPlan,storeApprovedBoundary}=require('./import-province-boundary.cjs');
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
  const [migrationBaseline]=await sql`SELECT to_regclass('public.place_reviews') AS review_table`;
  assert.equal(migrationBaseline.review_table,null,'API startup must not apply the review release migration');
  await applyPlaceReviewSchema(sql);
  await applyPlaceReviewSchema(sql); // migration is idempotent on the isolated service
  await ensureAiSettings(getSql);
  await sql`INSERT INTO admin_users (id, email, password_hash) VALUES ('test-admin', ${email}, ${hashPassword(password)})`;
  await sql`INSERT INTO places (id, name, province, category, lat, lng) VALUES
    ('fixture-other', 'Other Fixture', 'ชลบุรี', 'Culture', 13.6, 101.1)`;

  const geometry={outer:[[{lat:5,lon:97},{lat:21,lon:97},{lat:21,lon:106},{lat:5,lon:106},{lat:5,lon:97}]],inner:[]};
  // Synthetic boundary is isolated fixture geometry, never Production evidence.
  await sql`INSERT INTO province_review_boundaries(province,iso_code,geometry,source_url,license_name,reviewed_by)
    VALUES('ชลบุรี','TEST-20',${sql.json(geometry)},'https://fixture.example.test/boundary','fixture only','test-admin')`;

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
  registerQualityReview(app, { getSql, requireAdmin });
  registerGoogleVerification(app, { getSql, requireAdmin });
  registerPlaceReviewWorkflow(app, {getSql,requireAdmin,mediaStorage:storage});
  registerProvinceReviewPipeline(app,{getSql,requireAdmin});
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
    assert.equal(res.status, status, `${method} ${path} returned ${res.status}, expected ${status}: ${res.status===status?'':await res.clone().text()}`);
    return res;
  }
  const admin = (path, options) => request('/api/admin' + path, options);
  const publicApi = (path, status = 200) => request(path, { status, auth: false, origin: publicBase });
  const write = (path, body, status = 200, method = 'POST') => admin(path, { method, body, status }).then(res => res.json());
  const signIn = async () => { token = (await write('/login', { email, password })).token; };
  const makeDraft = fields => write('/places', { ...fixture, ...fields }, 201);
  const publish = (draft,status=200) => write(`/places/${draft.id}/publish`,{version:draft.version},status);
  const upload = (type, bytes, status = 201) => {
    const body = new FormData();
    body.set('image', new Blob([bytes], { type }), 'fixture.image');
    return admin('/media', { method: 'POST', body, status });
  };

  await t.test('auth protects every admin route, rejects invalid/expired/disabled sessions and revokes logout', async () => {
    const guarded = [
      ['GET', '/me'], ['POST', '/logout'], ['GET', '/places'], ['POST', '/places'], ['PUT', '/places/x'],
      ['POST', '/places/x/publish'], ['GET', '/catalog'], ['GET', '/taxonomy'], ['GET', '/geocode'], ['POST', '/catalog/x/edit'],
      ['GET', '/catalog/x/aliases'], ['POST', '/catalog/x/aliases'], ['POST', '/aliases/x/review'],
      ['GET', '/catalog/x/media'], ['GET', '/media/1a111111-1111-4111-8111-111111111111.png'],
      ['POST', '/media'], ['GET', '/ai/models'], ['GET', '/ai/models/validate'], ['PUT', '/ai/models'],
      ['POST', '/ai/health-check'],
      ['GET', '/places/x/quality-review'], ['GET', '/google-verification/status'], ['POST', '/google-verification'],
      ['GET','/places/x/review'],['PUT','/places/x/evidence'],['POST','/places/x/probe-media'],['POST','/places/x/review-transition'],
      ['GET','/candidate-queue'],['GET','/province-quality'],['POST','/province-import-jobs'],['GET','/province-import-jobs/x'],['POST','/province-import-jobs/x/resume'],
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

  await t.test('name-only drafts persist null coordinates and preserve Google reference IDs on editing', async () => {
    const minimal = await write('/places', {name:'Name only fixture'}, 201);
    assert.equal(minimal.payload.lat,null); assert.equal(minimal.payload.lng,null);
    await write(`/places/${minimal.id}/publish`,{version:minimal.version},400);
    const referenced = await write('/places/google-reference',{placeId:'ChIJisolatedDraftRef1234'},201);
    const row = (await (await admin('/places')).json()).drafts.find(d => d.id === referenced.id);
    const saved = await write(`/places/${row.id}`,{...row.payload,name:'ชื่อที่ยืนยันแล้ว',version:row.version},200,'PUT');
    assert.equal(saved.payload.googlePlaceId,'ChIJisolatedDraftRef1234');
    assert.equal(saved.payload.lat,null); assert.equal(saved.payload.lng,null);
  });

  await t.test('candidate review uses live SQL rows, exports safely and cannot publish or mutate a draft', async () => {
    const draft=await makeDraft({name:'Quality fixture',nameLocal:'คุณภาพจำลอง'});
    const [before]=await sql`SELECT payload,updated_at FROM place_drafts WHERE id=${draft.id}`;
    const review=await (await admin(`/places/${draft.id}/quality-review`)).json();
    assert.equal(review.mode,'read_only');assert.equal(review.publishAllowed,false);
    assert.equal(review.provinceGate,'NEEDS_REVIEW');assert.ok(review.holds.includes('source_license_unverified'));
    assert.equal(review.baselineCount,1);
    const csv=await admin(`/places/${draft.id}/quality-review?format=csv`);
    assert.match(csv.headers.get('content-type'),/text\/csv/);
    assert.match(await csv.text(),/Quality|คุณภาพ/);
    const [after]=await sql`SELECT payload,updated_at FROM place_drafts WHERE id=${draft.id}`;
    assert.deepEqual(after,before);
    await admin('/places/not-found/quality-review',{status:404});
  });

  let placeId, imagePath;
  await t.test('draft stays private, upload validates types and size, and publication exposes the image and place', async () => {
    const png = fixturePng();
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
    await publish(await makeDraft({ name: 'Near Existing Fixture', nameLocal: 'สถานที่ใกล้กัน', lat: 13.2001 }));
    const [first, second] = await Promise.all([
      makeDraft({ name: 'Concurrent Fixture', nameLocal: 'รายการทดสอบพร้อมกัน', lat: 14, lng: 101 }),
      makeDraft({ name: 'Concurrent Fixture', nameLocal: 'รายการทดสอบพร้อมกัน', lat: 14.0001, lng: 101 }),
    ]);
    const results = await Promise.all([first, second].map(draft => fetch(`${base}/api/admin/places/${draft.id}/publish`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ version: draft.version }),
    })));
    assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
    const badImage=(await (await upload('image/png',fixturePng(120))).json()).imageUrl;
    const failed=await makeDraft({name:'Rollback Fixture',nameLocal:'รายการย้อนกลับ',lat:14.5,lng:101.5,imageUrl:badImage});
    await sql`ALTER TABLE media ADD CONSTRAINT cms_test_rollback CHECK (title <> 'Rollback Fixture')`;
    await publish(failed,503);
    await publicApi(`/api/places/cms:${failed.id}`, 404);
    const [row] = await sql`SELECT status FROM place_drafts WHERE id = ${failed.id}`;
    assert.equal(row.status, 'draft');
  });

  await t.test('existing-place edits preserve media and metadata, with microsecond conflict detection', async () => {
    await sql`UPDATE places SET tags = '["fixture-tag"]', review_count = 17 WHERE id = ${placeId}`;
    const edit = await write(`/catalog/${placeId}/edit`, {}, 201);
    assert.equal(typeof edit.payload.lat, 'number');
    assert.equal((await write(`/catalog/${placeId}/edit`, {})).id, edit.id);
    await sql`INSERT INTO place_publication_details(place_id,evidence,reviewed_by) VALUES(${placeId},${sql.json({navigation:{lat:13.2,lng:100.9,kind:'vehicle_entrance'},district:'Historical proof'})},'test-admin')`;
    const main = (await (await upload('image/png',fixturePng(180))).json()).imageUrl;
    const saved = await write(`/places/${edit.id}`, { ...edit.payload, imageUrl: main, version: edit.version }, 200, 'PUT');
    await publish(saved);
    const detail = await (await publicApi(`/api/places/${placeId}`)).json();
    assert.equal(detail.navigation,null); assert.equal(detail.placeFacts,null);
    const [historical]=await sql`SELECT evidence FROM place_publication_details WHERE place_id=${placeId}`;
    assert.equal(historical.evidence.district,'Historical proof');assert.equal(historical.evidence.qualityReviewPerformed,false);
    assert.equal(detail.images[0], main);
    assert.equal(detail.image, main);
    assert.equal(detail.publishedPrimaryImage, main);
    const publicListResponse = await publicApi('/api/places?search=Isolated%20CMS%20Fixture');
    assert.match(publicListResponse.headers.get('cache-control'), /no-store/);
    const publicList = await publicListResponse.json();
    assert.equal(publicList.attractions.find(p => p.id === placeId).image, main);
    assert.deepEqual(detail.mediaCredits, publicList.attractions.find(p => p.id === placeId).mediaCredits);

    assert.ok(detail.images[1].endsWith(imagePath));
    assert.deepEqual(detail.tags, ['fixture-tag']);
    assert.equal(detail.reviewCount, 17);
    // An Admin may intentionally remove all images; a later startup must not
    // restore an older seeded gallery merely because image_url is empty.
    await sql`UPDATE places SET image_url=NULL WHERE id=${placeId}`;
    const beforeSeed = await sql`SELECT id,url FROM media WHERE place_id=${placeId} ORDER BY id`;
    const restored = await seedPlaceMedia(sql,{id:'wikimedia:removed-fixture',placeId,url:'https://example.test/removed.jpg'});
    assert.equal(restored,false);
    assert.deepEqual(await sql`SELECT id,url FROM media WHERE place_id=${placeId} ORDER BY id`,beforeSeed);
    await sql`UPDATE places SET image_url=${main} WHERE id=${placeId}`;

    // A deterministic sub-millisecond external edit must be detected by the
    // comparison UI as well as by the locked publish transaction.
    await sql`UPDATE places SET updated_at = date_trunc('second', updated_at) + INTERVAL '123400 microseconds'
      WHERE id = ${placeId}`;
    const next = await write(`/catalog/${placeId}/edit`, {}, 201);
    const [draftBaseline] = await sql`SELECT target_updated_at FROM place_drafts WHERE id = ${next.id}`;
    await write(`/places/${next.id}`, { ...next.payload, lat: 99, lng: 100.9, version: next.version }, 400, 'PUT');
    const extra = (await (await upload('image/png', fixturePng(210))).json()).imageUrl;
    const edited = await write(`/places/${next.id}`, { ...next.payload, version: next.version,
      description: 'Updated visitor details', lat: 13.34567, lng: 100.98765,
      imageUrl: extra, imageUrls: [extra, main] }, 200, 'PUT');
    const [beforeCount] = await sql`SELECT COUNT(*)::int AS count FROM places`;
    await sql`UPDATE places SET category = 'Nature', updated_at = updated_at + INTERVAL '1 microsecond'
      WHERE id = ${placeId}`;
    await publish(edited, 409);
    const comparison = await (await admin(`/places/${next.id}/reconcile`)).json();
    assert.equal(comparison.stale, true);
    assert.match(comparison.placeVersion, /^\d{1,12}\.\d{6}$/);
    assert.equal(comparison.latest.category, 'Nature');
    assert.equal(comparison.draft.lat, 13.34567);
    assert.equal(new Date(comparison.placeUpdatedAt).getTime(), draftBaseline.target_updated_at.getTime(),
      'The old millisecond-only comparison would miss this conflict');

    const retain = { version: edited.version, expectedPlaceVersion: comparison.placeVersion,
      selectedFields: ['description', 'lat', 'lng', 'imageUrl'], retainGallery: true };
    await write(`/places/${next.id}/reconcile`, { ...retain, selectedFields: ['lat'] }, 400);
    await write(`/places/${next.id}/reconcile`, { ...retain, selectedFields: ['categories'] }, 400);
    // Simulate another admin updating the place after the comparison opened.
    await sql`UPDATE places SET updated_at = updated_at + INTERVAL '1 microsecond' WHERE id = ${placeId}`;
    await write(`/places/${next.id}/reconcile`, retain, 409);
    const latest = await (await admin(`/places/${next.id}/reconcile`)).json();
    const reconciled = await write(`/places/${next.id}/reconcile`,
      { ...retain, expectedPlaceVersion: latest.placeVersion });
    assert.equal(reconciled.payload.description, 'Updated visitor details');
    assert.equal(reconciled.payload.lat, 13.34567);
    assert.equal(reconciled.payload.lng, 100.98765);
    assert.equal(reconciled.payload.category, 'Nature');
    assert.ok(reconciled.payload.imageUrls.includes(extra));
    assert.equal((await (await admin(`/places/${next.id}/reconcile`)).json()).stale, false,
      'A reconciled draft must preserve the exact PostgreSQL timestamp before publishing');
    assert.equal((await publish(reconciled)).placeId, placeId);
    const [afterCount] = await sql`SELECT COUNT(*)::int AS count FROM places`;
    assert.equal(afterCount.count, beforeCount.count);
    const updated = await (await publicApi(`/api/places/${placeId}`)).json();
    assert.equal(updated.description, 'Updated visitor details');
    assert.equal(updated.coordinates.lat, 13.34567);
    assert.equal(updated.coordinates.lng, 100.98765);
    assert.equal(updated.category, 'Nature');
    assert.equal(updated.images[0], extra);
    assert.ok(updated.images.includes(main));
  });

  await t.test('tag suggestions, publishing, clearing and legacy draft preservation use the same place', async () => {
    const taxonomy = await (await admin('/taxonomy')).json();
    assert.ok(taxonomy.categories.includes('Nature'));
    assert.ok(taxonomy.tags.includes('fixture-tag'));

    const before = await (await publicApi(`/api/places/${placeId}`)).json();
    assert.deepEqual(before.tags, ['fixture-tag']);
    const edit = await write(`/catalog/${placeId}/edit`, {}, 201);
    assert.deepEqual(edit.payload.tags, ['fixture-tag']);
    const saved = await write(`/places/${edit.id}`, {
      ...edit.payload, tags: ['Viewpoint', 'ทะเลหมอก'], version: edit.version,
    }, 200, 'PUT');
    const [countBefore] = await sql`SELECT COUNT(*)::int AS count FROM places`;
    assert.equal((await publish(saved)).placeId, placeId);
    const published = await (await publicApi(`/api/places/${placeId}`)).json();
    assert.deepEqual(published.tags, ['Viewpoint', 'ทะเลหมอก']);
    const [countAfter] = await sql`SELECT COUNT(*)::int AS count FROM places`;
    assert.equal(countAfter.count, countBefore.count, 'republishing tags must update the same place');

    const clear = await write(`/catalog/${placeId}/edit`, {}, 201);
    const empty = await write(`/places/${clear.id}`, { ...clear.payload, tags: [], version: clear.version }, 200, 'PUT');
    await publish(empty);
    assert.deepEqual((await (await publicApi(`/api/places/${placeId}`)).json()).tags, []);

    await sql`UPDATE places SET tags = ${sql.json(['keep-my-tag'])} WHERE id = ${placeId}`;
    const legacy = await write(`/catalog/${placeId}/edit`, {}, 201);
    await sql`UPDATE place_drafts SET payload = payload - 'tags' WHERE id = ${legacy.id}`;
    const oldPayload = { ...legacy.payload };
    delete oldPayload.tags;
    const legacySaved = await write(`/places/${legacy.id}`, { ...oldPayload, description: 'Legacy draft update', version: legacy.version }, 200, 'PUT');
    assert.equal(Object.hasOwn(legacySaved.payload, 'tags'), false);
    await publish(legacySaved);
    assert.deepEqual((await (await publicApi(`/api/places/${placeId}`)).json()).tags, ['keep-my-tag']);

    const conflict = await write(`/catalog/${placeId}/edit`, {}, 201);
    const changed = await write(`/places/${conflict.id}`, { ...conflict.payload, tags: ['ภูเขา'], version: conflict.version }, 200, 'PUT');
    await sql`UPDATE places SET tags = ${sql.json(['external-edit'])},
      updated_at = GREATEST(clock_timestamp(), updated_at + INTERVAL '1 microsecond') WHERE id = ${placeId}`;
    await publish(changed, 409);
    const comparison = await (await admin(`/places/${conflict.id}/reconcile`)).json();
    assert.equal(comparison.stale, true);
    assert.ok(comparison.fields.includes('tags'));
    assert.deepEqual(comparison.latest.tags, ['external-edit']);
    const reconciled = await write(`/places/${conflict.id}/reconcile`, {
      version: changed.version, expectedPlaceVersion: comparison.placeVersion,
      selectedFields: ['tags'], retainGallery: false,
    });
    await publish(reconciled);
    assert.deepEqual((await (await publicApi(`/api/places/${placeId}`)).json()).tags, ['ภูเขา']);
  });

  await t.test('multi-category republish updates one place and all public filters while preserving legacy drafts', async () => {
    const edit = await write(`/catalog/${placeId}/edit`, {}, 201);
    const categories = ['Beach', 'Nature', 'Island'];
    const saved = await write(`/places/${edit.id}`, { ...edit.payload, category: 'Beach', categories, version: edit.version }, 200, 'PUT');
    const [before] = await sql`SELECT COUNT(*)::int AS count FROM places`;
    await publish(saved);
    const detail = await (await publicApi(`/api/places/${placeId}`)).json();
    assert.equal(detail.category, 'Beach');
    assert.deepEqual(detail.categories, categories);
    for (const category of categories) {
      const results = await (await publicApi(`/api/places?category=${category}&limit=50`)).json();
      assert.ok(results.attractions.some(place => place.id === placeId), `${category} should find the published place`);
    }
    const [after] = await sql`SELECT COUNT(*)::int AS count FROM places`;
    assert.equal(after.count, before.count, 'republishing must not create a duplicate');

    const legacy = await write(`/catalog/${placeId}/edit`, {}, 201);
    await sql`UPDATE place_drafts SET payload = payload - 'categories' WHERE id = ${legacy.id}`;
    const oldPayload = { ...legacy.payload };
    delete oldPayload.categories;
    const legacySaved = await write(`/places/${legacy.id}`, { ...oldPayload, description: 'Legacy categories unchanged', version: legacy.version }, 200, 'PUT');
    await publish(legacySaved);
    assert.deepEqual((await (await publicApi(`/api/places/${placeId}`)).json()).categories, categories);
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

  await t.test('admin publishes without evidence or approval, logs an honest direct decision, and rejects exact duplicates', async () => {
    const first=await makeDraft({name:'Direct publication fixture',nameLocal:'รายการเผยแพร่ตรง',lat:15.2,lng:102.4});
    const before=await (await admin(`/places/${first.id}/review`)).json();
    assert.equal(before.state,'DISCOVERED'); assert.equal(before.evidence,null);
    const result=await publish(first);
    assert.equal(result.published,true);
    await publish(first); // Idempotent retry must not duplicate the audit.
    const events=await sql`SELECT actor_id,action,from_state,to_state,evidence FROM place_review_events WHERE draft_id=${first.id}`;
    assert.equal(events.length,1);assert.equal(events[0].action,'direct_publish');assert.equal(events[0].actor_id,'test-admin');
    assert.equal(events[0].from_state,'DISCOVERED');assert.equal(events[0].to_state,'PUBLISHED');
    assert.equal(events[0].evidence.qualityReviewPerformed,false);
    const [published]=await sql`SELECT verified_at FROM places WHERE id=${result.placeId}`;
    assert.equal(published.verified_at,null);
    const detail=await (await publicApi('/api/places/'+result.placeId)).json();
    assert.equal(detail.navigation,null);assert.equal(detail.placeFacts,null);
    const duplicate=await makeDraft({name:'Direct publication fixture',nameLocal:'รายการเผยแพร่ตรง',lat:15.3,lng:102.5});
    await publish(duplicate,409);
    const [row]=await sql`SELECT status FROM place_drafts WHERE id=${duplicate.id}`;
    assert.equal(row.status,'draft');
  });

  await t.test('two-province bounded jobs resume safely, keep data private and require individual human approvals', async () => {
    await sql`INSERT INTO province_review_boundaries(province,iso_code,geometry,source_url,license_name,reviewed_by)
      VALUES('เชียงใหม่','TEST-50',${sql.json(geometry)},'https://fixture.example.test/boundary','fixture only','test-admin')`;
    const [before]=await sql`SELECT COUNT(*)::int AS count FROM places`;
    const source={namespace:'fixture',name:'Fixture source',url:'https://fixture.example.test/source',licenseName:'Operator permission',permissionUrl:'https://fixture.example.test/permission',checkedAt:new Date().toISOString()};
    const coordinate={sourceUrl:'https://fixture.example.test/coordinate',licenseName:'Operator permission',permissionUrl:'https://fixture.example.test/permission',kind:'vehicle_entrance',publicAccessUrl:'https://fixture.example.test/access',checkedAt:new Date().toISOString()};
    for(const [province,count,latBase] of [['ชลบุรี',7,17],['เชียงใหม่',1,18]]) {
      const body={province,requestKey:'fixture-job-'+province,candidates:Array.from({length:count},(_,i)=>({payload:{...fixture,name:'Batch '+province+' '+i,nameLocal:'รายการชุด '+province+' '+i,province,lat:latBase+i*0.01,lng:103.2},
        evidence:{source:{...source,id:province+'-'+i},coordinate,detailSourceUrl:'https://fixture.example.test/source'}}))};
      // Stable ASCII idempotency keys, independent of translated labels.
      body.requestKey='fixture-job-'+latBase;
      const job=await write('/province-import-jobs',body);
      assert.equal((await write('/province-import-jobs',body)).id,job.id);
      await write('/province-import-jobs',{...body,candidates:body.candidates.slice(0,1).map(c=>({...c,payload:{...c.payload,name:'Different input'}}))},409);
      let resumed=await write(`/province-import-jobs/${job.id}/resume`,{});
      assert.equal(resumed.next_index,Math.min(5,count));
      if(count>5)resumed=await write(`/province-import-jobs/${job.id}/resume`,{});
      assert.equal(resumed.state,'REVIEW_PENDING');assert.equal(resumed.next_index,count);
      assert.equal((await write(`/province-import-jobs/${job.id}/resume`,{})).next_index,count);
      assert.ok(resumed.result.every(r=>r.state==='REVIEW_PENDING'&&r.publicationAllowed===false),JSON.stringify(resumed.result));
      const queue=await (await admin('/candidate-queue?province='+encodeURIComponent(province)+'&page=1')).json();
      assert.ok(queue.candidates.length>=count);
    }
    const [after]=await sql`SELECT COUNT(*)::int AS count FROM places`;assert.equal(after.count,before.count);
    const dashboard=await (await admin('/province-quality')).json();assert.equal(dashboard.provinces.length,77);assert.equal(dashboard.automaticImport,false);
    assert.equal(dashboard.completenessClaim,null);
  });

  await t.test('approved boundary configuration is idempotent, admin-only and cannot overwrite geometry or place rows', async () => {
    // Synthetic geometry tests storage mechanics only; never Production evidence.
    const raw={type:'relation',id:999,tags:{'name:th':'จังหวัดระยอง','ISO3166-2':'TH-21',admin_level:'4',boundary:'administrative'},
      members:[{type:'way',role:'outer',geometry:geometry.outer[0]}]};
    const plan=boundaryPlan(raw,'ระยอง');
    const [before]=await sql`SELECT COUNT(*)::int AS count FROM places`;
    await assert.rejects(storeApprovedBoundary(sql,plan,'missing-admin'));
    assert.equal((await storeApprovedBoundary(sql,plan,'test-admin')).status,'approved_boundary_stored');
    assert.equal((await storeApprovedBoundary(sql,plan,'test-admin')).status,'unchanged');
    const changed=structuredClone(raw);changed.members[0].geometry[1].lat=20;
    await assert.rejects(storeApprovedBoundary(sql,boundaryPlan(changed,'ระยอง'),'test-admin'),/No overwrite/);
    const [saved]=await sql`SELECT geometry FROM province_review_boundaries WHERE province='ระยอง'`;
    assert.deepEqual(saved.geometry,plan.geometry);
    const [after]=await sql`SELECT COUNT(*)::int AS count FROM places`;assert.equal(after.count,before.count);
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
  await t.test('nearby radius query is bounded, stable, public-only and excludes canonical IDs', async () => {
    // Only isolated fixture records. Never use application/Production database credentials.
    const center={lat:18,lng:99};
    await sql`INSERT INTO places(id,name,province,category,lat,lng) VALUES
      ('nearby-center','Center','เชียงใหม่','Nature',18,99),
      ('nearby-same-a','Same point','เชียงใหม่','Nature',18,99),
      ('nearby-same-b','Same point','เชียงใหม่','Nature',18,99),
      ('nearby-invalid','Invalid','เชียงใหม่','Nature',0,0),
      ('nearby-swapped','Swapped','เชียงใหม่','Nature',99,18),
      ('nearby-null','No coordinates','เชียงใหม่','Nature',NULL,NULL)`;
    for (const km of [2.99,3.01,4.99,5.01,9.99,10.01,19.99,20.01]) {
      const latitude=center.lat + km/6371*180/Math.PI;
      await sql`INSERT INTO places(id,name,province,category,lat,lng)
        VALUES(${'nearby-km-'+km},'Distance fixture','เชียงใหม่','Nature',${latitude},${center.lng})`;
    }
    await sql`INSERT INTO place_drafts(id,payload,author_id,status)
      VALUES('nearby-private',${sql.json({name:'Private nearby',lat:18,lng:99})},'test-admin','draft')`;
    // A large out-of-bounds catalogue must not cause media lookups for all rows.
    await sql`INSERT INTO places(id,name,province,category,lat,lng)
      SELECT 'nearby-far-'||n,'Far fixture','ชลบุรี','Nature',13,100 FROM generate_series(1,500) n`;
    for (const radius of [3,5,10,20]) {
      const payload=await (await publicApi(`/api/places/nearby?lat=18&lng=99&radiusKm=${radius}&excludeId=nearby-center&limit=30`)).json();
      const ids=payload.attractions.map(p=>p.id);
      assert.ok(!ids.includes('nearby-center') && !ids.includes('nearby-private'));
      assert.ok(!ids.some(id=>/invalid|swapped|null|far/.test(id)));
      assert.equal(new Set(ids).size,ids.length);
      assert.deepEqual(ids.slice(0,2),['nearby-same-a','nearby-same-b']);
      assert.ok(ids.includes('nearby-km-'+(radius-0.01).toFixed(2).replace(/0$/,'')));
      assert.ok(!ids.includes('nearby-km-'+(radius+0.01)));
      for (const [i,p] of payload.attractions.entries()) {
        assert.ok(p.distanceKm<=radius);
        if(i) assert.ok(p.distanceKm>=payload.attractions[i-1].distanceKm);
        assert.ok(!('payload' in p) && !('author_id' in p) && !('password_hash' in p));
      }
    }
    const limited=await (await publicApi('/api/places/nearby?lat=18&lng=99&radiusKm=20&limit=1')).json();
    assert.equal(limited.attractions.length,1); assert.equal(limited.hasMore,true);
    const injection=encodeURIComponent("' OR 1=1 --");
    const safe=await (await publicApi(`/api/places/nearby?lat=18&lng=99&radiusKm=3&excludeId=${injection}`)).json();
    assert.ok(safe.attractions.length>0);
    await publicApi('/api/places/nearby?lat=18%3BSELECT&lng=99',400);
    await publicApi('/api/places/nearby?lat=18&lat=19&lng=99',400);
    // Clean up only this fixture's rows so other suites remain independent.
    await sql`DELETE FROM place_drafts WHERE id='nearby-private'`;
    await sql`DELETE FROM places WHERE id LIKE 'nearby-%'`;
  });

});
