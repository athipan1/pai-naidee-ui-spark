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
  async function approveFixture(draft) {
    const before = await (await admin(`/places/${draft.id}/review`)).json();
    if (before.state === 'PUBLISHED' || before.state === 'APPROVED') return;
    const sourceUrl = 'https://fixture.example.test/source';
    const rights = {licenseName:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',checkedAt:new Date().toISOString()};
    const evidence = {source:{...rights,namespace:'fixture',id:draft.id,name:'Isolated test operator',url:sourceUrl},
      coordinate:{...rights,sourceUrl,kind:'vehicle_entrance',publicAccessUrl:sourceUrl},
      media:draft.payload.imageUrl?{...rights,url:draft.payload.imageUrl,sourcePage:sourceUrl,photographer:'Fixture artist'}:{},
      detailSourceUrl:sourceUrl,duplicateResolutions:[]};
    // The same real review API used by the UI; synthetic evidence exists only in the local fixture DB.
    delete evidence.media.checkedAt;
    let review = await write(`/places/${draft.id}/evidence`,{version:draft.version,revision:before.revision,evidence},200,'PUT');
    const report = await (await admin(`/places/${draft.id}/review`)).json();
    evidence.duplicateResolutions = report.report.duplicate.matches.filter(m => m.placeId !== draft.target_place_id && m.confidence !== 'identifier_match').map(m => ({placeId:m.placeId,note:'Distinct isolated fixture for regression testing',sourceUrl}));
    if(evidence.duplicateResolutions.length) review = await write(`/places/${draft.id}/evidence`,{version:draft.version,revision:review.revision,evidence},200,'PUT');
    if(draft.payload.imageUrl) review = await write(`/places/${draft.id}/probe-media`,{revision:review.revision});
    for(const action of ['verify','request_review','approve']) {
      review = await write(`/places/${draft.id}/review-transition`,{action,revision:review.revision});
      assert.equal(review.state,{verify:'VERIFIED',request_review:'REVIEW_PENDING',approve:'APPROVED'}[action],JSON.stringify(review));
    }
  }
  const publish = async (draft,status=200) => {
    if(status===200||status===503) await approveFixture(draft);
    return write(`/places/${draft.id}/publish`,{version:draft.version},status);
  };
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
    await approveFixture(first); await approveFixture(second);
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
    const main = (await (await upload('image/png',fixturePng(180))).json()).imageUrl;
    const saved = await write(`/places/${edit.id}`, { ...edit.payload, imageUrl: main, version: edit.version }, 200, 'PUT');
    await publish(saved);
    const detail = await (await publicApi(`/api/places/${placeId}`)).json();
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

  await t.test('publication requires evidence and explicit approval, and rejects exact duplicate names', async () => {
    const first=await makeDraft({name:'Direct publication fixture',nameLocal:'รายการเผยแพร่ตรง',lat:15.2,lng:102.4});
    await write(`/places/${first.id}/publish`,{version:first.version},409);
    const result=await publish(first);
    assert.equal(result.published,true);
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
});
