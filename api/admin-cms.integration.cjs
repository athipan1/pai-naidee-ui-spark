const { seedPlaceMedia } = require('./seed-place-media.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');
const { authRoutes, hashPassword, hashToken } = require('./railway-admin-auth.cjs');
const { registerAdminCms } = require('./admin-cms.cjs');
const { classifyCandidates, readExisting } = require('./google-place-discovery.cjs');
const { signCandidate: signGeoapifyCandidate } = require('./geoapify-place-discovery.cjs');
const { registerQualityReview } = require('./place-quality-review.cjs');
const { registerGoogleVerification } = require('./google-place-verification.cjs');
const { registerPlaceReviewWorkflow } = require('./place-review-workflow.cjs');
const { applyPlaceReviewSchema } = require('./place-review-schema.cjs');
const {fixturePng}=require('./test-fixtures/image.cjs');
const {registerProvinceReviewPipeline}=require('./province-review-pipeline.cjs');
const {boundaryPlan,storeApprovedBoundary}=require('./import-province-boundary.cjs');
const { createImageUpload, registerRailwayMedia, uploadImage, MAX_IMAGE_BYTES, verifyDraftMedia } = require('./railway-media.cjs');
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
    const etag = '"' + require('node:crypto').createHash('sha256').update(bytes).digest('hex') + '"';
    if (command.input.IfNoneMatch === etag) throw { $metadata: { httpStatusCode: 304 } };
    return { Body: [bytes], ETag: etag, ContentLength: bytes.length };
  } } };
  const app = express();
  app.use(express.json());
  const requireAdmin = authRoutes(app, { getSql, limitLogin: (_req, _res, next) => next() });
  registerAdminCms(app, { getSql, listPlaces, requireAdmin, storage: createImageUpload(),
    uploadImage: file => uploadImage(storage, file), invalidateSearchIndex,
    verifyMedia: (url, known) => verifyDraftMedia(storage, url, known),
    enrichDraft: async ({province,candidateName})=>candidateName==='หาดแหลมเจริญ'&&province==='ระยอง'
      ? {status:'matched',englishNameFound:true,
        source:{name:'Tourism Authority of Thailand — Open Data',url:'https://datacatalog.tat.or.th/dataset/tourist-attraction',id:'tat-fixture-2026',license:'Open Data Common'},
        fields:{name:'Laem Charoen Beach',nameLocal:'หาดแหลมเจริญ'}}
      : {status:'no_match'},
    enrichGeoapify:async ({province,candidateName})=>
      province==='ระยอง'&&candidateName==='ชื่อชั่วคราวจาก Google'
        ? {status:'geoapify_matched',englishNameFound:true,
           fields:{name:'Rayong Community Market',nameLocal:'ตลาดชุมชนระยอง'},
           source:{name:'Geoapify / OpenStreetMap',url:'https://www.geoapify.com/',
             id:'geoapify-fixture-rayong',license:'ODbL 1.0',
             attribution:'© OpenStreetMap contributors'},
           suggestion:{lat:12.65,lng:101.25,label:'ตลาดชุมชนระยอง, ระยอง',
             source:'Geoapify',confidence:0.94}}
        : {status:'geoapify_no_match'} });
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
      ['POST', '/places/x/publish'], ['GET', '/places/x/duplicate-resolution'], ['POST', '/places/x/duplicate-resolution'], ['GET', '/catalog'], ['GET', '/taxonomy'], ['GET', '/geocode'], ['POST', '/catalog/x/edit'],
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
    const referenced = await write('/places/google-reference',{placeId:'ChIJisolatedDraftRef1234',province:'ระยอง'},201);
    const row = (await (await admin('/places')).json()).drafts.find(d => d.id === referenced.id);
    assert.equal(row.payload.province,'ระยอง','draft must keep selected province');
    const duplicateRecords = await readExisting(getSql, 'ระยอง', true);
    const draftRecord = duplicateRecords.find(record => record.id === row.id);
    assert.equal(draftRecord.isDraft, true);
    assert.deepEqual(draftRecord.external_ids, [{source:'google_places',id:'ChIJisolatedDraftRef1234'}]);
    assert.equal(draftRecord.lat, null);
    assert.equal(draftRecord.lng, null);
    assert.ok(!(await readExisting(getSql, 'ชลบุรี', true)).some(record => record.id === row.id));
    const again = await write('/places/google-reference',{placeId:'ChIJisolatedDraftRef1234',province:'ระยอง'},200);
    assert.equal(again.id,referenced.id,'same province is idempotent');
    await write('/places/google-reference',{placeId:'ChIJisolatedDraftRef1234',province:'ชลบุรี'},409);
    await write('/places/google-reference',{placeId:'ChIJdifferentTestRef1234'},400);
    const saved = await write(`/places/${row.id}`,{...row.payload,name:'ชื่อที่ยืนยันแล้ว',version:row.version},200,'PUT');
    assert.equal(saved.payload.googlePlaceId,'ChIJisolatedDraftRef1234');
    assert.equal(saved.payload.lat,null); assert.equal(saved.payload.lng,null);
  });

  await t.test('Google reference draft auto-fills only independently sourced fields and preserves attribution on edit',async()=>{
    const created=await write('/places/google-reference',{
      placeId:'ChIJAutoFillReference1234',province:'ระยอง',candidateName:'หาดแหลมเจริญ'
    },201);
    assert.equal(created.autoFillStatus,'matched');
    assert.equal(created.coordinatesRequired,true);
    assert.equal(created.draft.payload.name,'Laem Charoen Beach');
    assert.equal(created.draft.payload.nameLocal,'หาดแหลมเจริญ');
    assert.equal(created.draft.payload.category,'');
    assert.equal(created.draft.payload.description,'');
    assert.equal(created.draft.payload.lat,null);
    assert.equal(created.draft.payload.lng,null);
    assert.equal(created.draft.payload.autoFillSource.id,'tat-fixture-2026');
    assert.equal(created.draft.payload.googlePlaceId,'ChIJAutoFillReference1234');
    const edited=await write(`/places/${created.id}`,{
      ...created.draft.payload,name:'Verified Independent Name',version:created.draft.version
    },200,'PUT');
    assert.equal(edited.payload.name,'Verified Independent Name');
    assert.equal(edited.payload.autoFillSource.id,'tat-fixture-2026');
    assert.equal(edited.payload.lat,null,'editing a name-only draft keeps coordinates empty');
    assert.equal(edited.payload.category,'','editing a name-only draft keeps category unselected');
    const again=await write('/places/google-reference',{
      placeId:'ChIJAutoFillReference1234',province:'ระยอง',candidateName:'หาดแหลมเจริญ'
    },200);
    assert.equal(again.autoFillStatus,'existing_preserved');
    assert.equal(again.draft.payload.name,'Verified Independent Name');
    const fallback=await write('/places/google-reference',{
      placeId:'ChIJNoMatchReference1234',province:'ระยอง',candidateName:'สถานที่ไม่มีข้อมูล'
    },201);
    assert.equal(fallback.autoFillStatus,'no_match');
    assert.equal(fallback.draft.payload.name,'รอยืนยันชื่อสถานที่');
    assert.equal(fallback.draft.payload.lat,null);
    assert.equal(fallback.draft.payload.autoFillSource,undefined);
  });

  await t.test('TAT-miss uses Geoapify name fallback but only proposes coordinates until Admin confirms them',async()=>{
    const first=await write('/places/google-reference',{
      placeId:'ChIJGeoFallbackReview1234',province:'ระยอง',candidateName:'ชื่อชั่วคราวจาก Google'
    },201);
    assert.equal(first.autoFillStatus,'geoapify_matched');
    assert.equal(first.coordinatesRequired,true);
    assert.equal(first.draft.payload.name,'Rayong Community Market');
    assert.equal(first.draft.payload.nameLocal,'ตลาดชุมชนระยอง');
    assert.equal(first.draft.payload.category,'');
    assert.equal(first.draft.payload.description,'');
    assert.equal(first.draft.payload.lat,null);
    assert.equal(first.draft.payload.lng,null);
    assert.equal(first.draft.payload.autoFillSource.id,'geoapify-fixture-rayong');
    assert.equal(first.draft.payload.autoFillSource.attribution,'© OpenStreetMap contributors');
    assert.equal(first.geoapifySuggestion.lat,12.65);
    assert.equal(first.geoapifySuggestion.lng,101.25);
    assert.equal(JSON.stringify(first.draft.payload).includes('ชื่อชั่วคราวจาก Google'),false);
    const edited=await write('/places/'+first.id,{
      ...first.draft.payload,name:'Verified Admin Name',version:first.draft.version
    },200,'PUT');
    assert.equal(edited.payload.name,'Verified Admin Name');
    assert.equal(edited.payload.autoFillSource.id,'geoapify-fixture-rayong');
    assert.equal(edited.payload.lat,null);
    const second=await write('/places/google-reference',{
      placeId:'ChIJGeoFallbackReview1234',province:'ระยอง',candidateName:'ชื่อชั่วคราวจาก Google'
    },200);
    assert.equal(second.autoFillStatus,'existing_preserved');
    assert.equal(second.geoapifySuggestion,null);
    assert.equal(second.draft.payload.name,'Verified Admin Name');
  });

  await t.test('Geoapify Discovery requires signed Admin review, checks duplicates and keeps coordinates unconfirmed',async()=>{
    const previousKey=process.env.GEOAPIFY_API_KEY;
    const key='isolated-geoapify-token-key-example';
    process.env.GEOAPIFY_API_KEY=key;
    try{
      const id='51a1f444490668134059dc0a96dfac6c';
      const item={id,name:'Rayong Sunset Viewpoint',nameLocal:'จุดชมพระอาทิตย์ระยอง',
        province:'ระยอง',lat:12.432,lng:101.234};
      const candidateToken=signGeoapifyCandidate(item,'test-admin',key);
      await write('/places/geoapify-reference',{province:'ชลบุรี',candidateToken},400);
      await write('/places/geoapify-reference',{province:'ระยอง',candidateToken:candidateToken+'x'},400);
      const created=await write('/places/geoapify-reference',{province:'ระยอง',candidateToken},201);
      assert.equal(created.autoFillStatus,'geoapify_matched');
      assert.equal(created.coordinatesRequired,true);
      assert.equal(created.draft.payload.name,'Rayong Sunset Viewpoint');
      assert.equal(created.draft.payload.nameLocal,'จุดชมพระอาทิตย์ระยอง');
      assert.equal(created.draft.payload.lat,null);
      assert.equal(created.draft.payload.lng,null);
      assert.equal(created.draft.payload.category,'');
      assert.equal(created.draft.payload.autoFillSource.name,'Geoapify / OpenStreetMap');
      assert.equal(created.draft.payload.autoFillSource.attribution,'© OpenStreetMap contributors');
      assert.equal(created.draft.payload.autoFillSource.id,'geoapify-'+id);
      assert.equal(created.geoapifySuggestion.lat,12.432);
      assert.equal(created.geoapifySuggestion.lng,101.234);
      const repeated=await write('/places/geoapify-reference',{province:'ระยอง',candidateToken},200);
      assert.equal(repeated.existing,true);
      assert.equal(repeated.id,created.id);
      assert.equal(repeated.geoapifySuggestion,null);
      const edited=await write('/places/'+created.id,{
        ...created.draft.payload,name:'Verified independent name',version:created.draft.version
      },200,'PUT');
      assert.equal(edited.payload.name,'Verified independent name');
      assert.equal(edited.payload.autoFillSource.id,'geoapify-'+id);
      assert.equal(edited.payload.lat,null);
      const reused=await write('/places/geoapify-reference',{province:'ระยอง',candidateToken},200);
      assert.equal(reused.draft.payload.name,'Verified independent name','never overwrite Admin edits');
      const alreadyPublished=signGeoapifyCandidate({
        ...item,id:'51b2f444490668134059dc0a96dfac6e',province:'ชลบุรี',
        name:'Other Fixture',nameLocal:'รายการจำลอง',lat:13.6,lng:101.1
      },'test-admin',key);
      await write('/places/geoapify-reference',{province:'ชลบุรี',candidateToken:alreadyPublished},409);
    }finally{
      if(previousKey===undefined)delete process.env.GEOAPIFY_API_KEY;
      else process.env.GEOAPIFY_API_KEY=previousKey;
    }
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
    await upload('image/jpeg', Buffer.from([255, 216, 255]), 400);
    await upload('image/webp', Buffer.from('RIFF0000WEBP'), 400);
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
    const privateThumb = await admin(`/media/${imagePath.split('/').at(-1)}?w=256`);
    assert.equal(privateThumb.headers.get('content-type'), 'image/webp');
    assert.equal(privateThumb.headers.get('cache-control'), 'private, no-store');
    await privateThumb.arrayBuffer();
    await request(`${imagePath}?w=256`, { auth: false, status: 404 });
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
    const publishedThumb = await request(`${imagePath}?w=256`, { auth: false });
    assert.equal(publishedThumb.headers.get('content-type'), 'image/webp');
    assert.equal(publishedThumb.headers.get('cache-control'), 'private, max-age=3600, must-revalidate');
    await publishedThumb.arrayBuffer();
    const revalidatedThumb = await fetch(base + imagePath + '?w=256', {
      headers: { 'If-None-Match': publishedThumb.headers.get('etag') },
    });
    assert.equal(revalidatedThumb.status, 304);
    assert.equal((await revalidatedThumb.arrayBuffer()).byteLength, 0);
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
    const previous = await request(imagePath, { auth: false });
    const previousTag = previous.headers.get('etag');
    assert.ok(previousTag);
    await previous.arrayBuffer();
    const removal = await write(`/catalog/${placeId}/edit`, {}, 201);
    const removalDraft = await write(`/places/${removal.id}`, {
      ...removal.payload, version: removal.version, removedImageUrls: [new URL(imagePath, 'https://cms-api.example.test').href],
    }, 200, 'PUT');
    await publish(removalDraft);
    const withdrawn = await fetch(base + imagePath, { headers: { 'If-None-Match': previousTag } });
    assert.equal(withdrawn.status, 404);
    const privateOriginal = await admin(`/media/${imagePath.split('/').at(-1)}`);
    assert.equal(privateOriginal.status, 200);
    await privateOriginal.arrayBuffer();

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

  await t.test('fresh Admin lookup, stable hybrid pages and public cache invalidation', async () => {
    const query = new URLSearchParams({search: 'Consistency Garden'});
    const readPublic = async () => (await publicApi(`/api/places?${query}`)).json();
    const readAdmin = async (params) => (await admin(`/catalog?${new URLSearchParams(params)}`)).json();
    assert.equal((await readPublic()).total, 0); // warm this process's search cache
    await sql`INSERT INTO places (id, name, name_local, province, province_en, category, lat, lng)
      SELECT 'phase2-' || n, 'Consistency Garden ' || n, 'สวนทดสอบ ' || n,
        'เชียงราย', NULL, 'Nature', 19.8, 99.7 FROM generate_series(1, 35) AS n`;
    const params = { q: 'Consistency Garden', province: 'ChiangRai', category: 'Nature' };
    const first = await readAdmin({ ...params, page: '1' });
    const second = await readAdmin({ ...params, page: '2' });
    assert.equal(first.total, 35);
    assert.equal(second.total, 35);
    assert.deepEqual([first.places.length, second.places.length], [30, 5]);
    assert.equal(new Set([...first.places, ...second.places].map(row => row.id)).size, 35);
    assert.deepEqual((await readAdmin({ q: 'phase2-1' })).places[0]?.id, 'phase2-1');
    assert.deepEqual((await readAdmin({ q: 'Consistency Garden 1', category: 'Culture' })).places, []);
    assert.deepEqual((await readAdmin({ q: 'Consistency Garden 1', province: 'Nan' })).places, []);
    assert.equal((await readAdmin({ q: 'Consistncy Garden 1' })).places[0]?.id, 'phase2-1');
    assert.equal((await readPublic()).total, 0, 'independent database change may take up to the public TTL');
    const fresh = await makeDraft({ name: 'Unambiguous Orchard Chiang Rai', nameLocal: 'สวนผลไม้ตัวอย่าง',
      province: 'เชียงราย', category: 'Nature', lat: 19.81, lng: 99.72 });
    query.set('search', fresh.payload.name);
    assert.equal((await readPublic()).total, 0);
    const {placeId: publishedId} = await publish(fresh);
    assert.equal((await readPublic()).attractions[0]?.id, publishedId);
    const edit = await write(`/catalog/${publishedId}/edit`, {}, 201);
    const changed = await write(`/places/${edit.id}`, { ...edit.payload, version: edit.version,
      name: 'Renamed Forest Path', nameLocal: 'เส้นทางป่าทดสอบ', province: 'น่าน',
      category: 'Park', categories: ['Park'], description: 'violet-ridge-marker' }, 200, 'PUT');
    await publish(changed);
    assert.equal((await readPublic()).attractions.some(row => row.id === publishedId), false);
    query.set('search', 'violet-ridge-marker');
    query.set('category', 'Park');
    query.set('province', 'Nan');
    assert.equal((await readPublic()).attractions[0]?.id, publishedId);
    assert.equal((await readAdmin({ q: 'Renamed Forest Path', province: 'Nan', category: 'Park' })).places[0]?.id, publishedId);
  });

  await t.test('approved aliases appear in search and rejected or duplicate aliases do not', async () => {
    const path = `/catalog/${placeId}/aliases`;
    const approved = { aliasName: 'Unique Synonym Fixture', language: 'en' };
    const alias = await write(path, approved, 201);
    await write(path, approved, 409);
    const suggestionUrl = '/api/places/suggest?q=Unique%20Synonym%20Fixture';
    assert.deepEqual((await (await publicApi(suggestionUrl)).json()).suggestions, []);
    await write(`/aliases/${alias.id}/review`, { status: 'approved' });
    assert.equal((await (await publicApi(suggestionUrl)).json()).suggestions[0]?.id, placeId);
    const rejected = await write(path, { aliasName: 'Unlisted Word Fixture', language: 'en' }, 201);
    await write(`/aliases/${rejected.id}/review`, { status: 'rejected' });
    const byAlias = await (await admin('/catalog?q=Unique%20Synonym%20Fixture&page=1')).json();
    assert.equal(byAlias.places[0].id, placeId);
    const rejectedAlias = (await (await admin(path)).json()).aliases.find(item => item.id === rejected.id);
    assert.equal(rejectedAlias.status, 'rejected');
    const other = await write('/catalog/fixture-other/aliases', approved, 201);
    await write(`/aliases/${other.id}/review`, { status: 'approved' }, 409);
  });

  await t.test('duplicate resolution preserves identity, edits, media, and replay receipts', async () => {
    const main = (await (await upload('image/png', fixturePng(130))).json()).imageUrl;
    const extra = (await (await upload('image/png', fixturePng(131))).json()).imageUrl;
    const target = await makeDraft({ name: 'Resolution fixture', nameLocal: 'สถานที่อ้างอิง',
      imageUrl: main, description: 'Published Thai detail', descriptionEn: 'Published English detail', tags: ['Water'] });
    const { placeId: targetId } = await publish(target);
    await sql`UPDATE media SET creator_name = 'Fixture Photographer', license_name = 'Fixture license' WHERE place_id = ${targetId}`;
    const source = await makeDraft({ name: 'Resolution fixture', nameLocal: 'สถานที่ปรับใหม่',
      imageUrl: extra, description: '', descriptionEn: 'Replacement English detail', tags: ['water', 'Trail'] });
    const duplicate = await publish(source, 409);
    assert.equal(duplicate.code, 'DUPLICATE_PLACE');
    assert.equal(duplicate.conflictType, 'EXACT_NAME_MATCH');
    assert.equal(duplicate.existingPlaces[0].placeId, targetId);
    assert.equal(duplicate.existingPlaces[0].imageUrl, main);
    await publish(await makeDraft({ name: 'Resolution fixture', nameLocal: 'สถานที่อ้างอิง', province: 'ระยอง' }));
    assert.equal((await publish({ ...source, version: '1900000000.000001' }, 409)).code, 'DRAFT_VERSION_CONFLICT');

    const path = `/places/${source.id}/duplicate-resolution`;
    await admin(`${path}?targetPlaceId=fixture-other`, { status: 409 });
    const compare = () => admin(`${path}?targetPlaceId=${encodeURIComponent(targetId)}`).then(res => res.json());
    const selection = compared => ({
      targetPlaceId: targetId, sourceVersion: compared.sourceVersion, targetVersion: compared.targetVersion,
      galleryVersion: compared.galleryVersion, editVersion: compared.existingEdit?.version ?? null,
      choices: { nameLocal: 'draft', descriptionEn: 'draft', tags: 'merge' }, imageUrls: [extra], primaryImage: extra,
    });
    const initial = await compare();
    assert.equal(initial.existingEdit, null, 'opening the comparison does not create a draft');
    assert.deepEqual(initial.gallery, [main]);
    const review = await write(path, { ...selection(initial), preview: true });
    assert.equal(review.preview.description, 'Published Thai detail');
    assert.equal(review.preview.imageUrls.length, 2);
    assert.equal((await compare()).existingEdit, null, 'preview is read-only');
    assert.equal((await write(path, { ...selection(initial), choices: { description: 'draft' } }, 400)).code, 'INVALID_SELECTION');
    assert.equal((await write(path, { ...selection(initial), confirmGoogleIdentity: true }, 400)).code, 'GOOGLE_IDENTITY_NOT_CONFIRMABLE');

    const open = await write(`/catalog/${targetId}/edit`, {}, 201);
    assert.equal((await write(path, selection(initial), 409)).code, 'EDIT_DRAFT_VERSION_CONFLICT');
    const current = await write(`/places/${open.id}`,
      { ...open.payload, version: open.version, description: 'Pending Thai edit' }, 200, 'PUT');
    const compared = await compare();
    assert.equal(compared.existingEdit.version, current.version);
    const invalid = await write(path, { ...selection(compared), imageUrls: ['https://example.test/not-in-source.png'] }, 400);
    assert.equal(invalid.code, 'INVALID_MEDIA_REFERENCE');
    await sql`UPDATE media SET license_name = 'Latest fixture license' WHERE place_id = ${targetId}`;
    assert.equal((await write(path, selection(compared), 409)).code, 'GALLERY_VERSION_CONFLICT');
    const final = selection(await compare());
    await sql`ALTER TABLE place_drafts ADD CONSTRAINT duplicate_receipt_fixture CHECK (NOT (payload ? '_duplicateReceipt'))`;
    try { await write(path, final, 503); }
    finally { await sql`ALTER TABLE place_drafts DROP CONSTRAINT duplicate_receipt_fixture`; }
    assert.equal((await compare()).existingEdit.version, current.version, 'failed receipt rolls back the edit change');
    const results = await Promise.all([write(path, final), write(path, final)]);
    assert.equal(results[0].draft.id, current.id);
    assert.equal(results[1].draft.id, current.id);
    assert.equal(results.filter(item => item.replayed).length, 1);
    const merged = results[0].draft;
    assert.deepEqual(merged.payload.tags, ['Water', 'Trail']);
    assert.equal(merged.payload.description, 'Pending Thai edit');
    assert.equal(merged.payload.descriptionEn, 'Replacement English detail');
    assert.equal(merged.payload.imageUrl, extra);
    const before = (await sql`SELECT count(*) AS count FROM places`)[0].count;
    assert.equal((await publish(merged)).placeId, targetId);
    assert.equal((await sql`SELECT count(*) AS count FROM places`)[0].count, before);
    const rows = await sql`SELECT url, creator_name, license_name FROM media WHERE place_id = ${targetId} ORDER BY url`;
    assert.equal(rows.length, 2);
    assert.deepEqual(rows.find(row => row.url === main), { url: main, creator_name: 'Fixture Photographer', license_name: 'Latest fixture license' });
    assert.ok(objects.has(`cms/${new URL(main).pathname.split('/').pop()}`));
    assert.ok(objects.has(`cms/${new URL(extra).pathname.split('/').pop()}`));
    const [sourceRow] = await sql`SELECT status, payload FROM place_drafts WHERE id = ${source.id}`;
    assert.equal(sourceRow.status, 'draft');
    assert.equal(sourceRow.payload.nameLocal, source.payload.nameLocal);
    const linked = await admin(path).then(res => res.json());
    assert.equal(linked.linkedDraft.id, merged.id);
    assert.equal(linked.linkedDraft.status, 'published');
    assert.equal((await write(path, final)).draft.id, merged.id);
    const detail = await (await publicApi(`/api/places/${targetId}`)).json();
    assert.equal(detail.nameLocal, 'สถานที่ปรับใหม่');
    assert.equal(detail.descriptionEn, 'Replacement English detail');
    assert.equal(detail.publishedPrimaryImage, extra);
    const query = encodeURIComponent('สถานที่ปรับใหม่');
    assert.equal((await (await publicApi(`/api/places?search=${query}`)).json()).attractions[0].id, targetId);
    assert.equal((await (await admin(`/catalog?q=${query}`)).json()).places[0].id, targetId);
    const [event] = await sql`SELECT evidence FROM place_review_events WHERE draft_id = ${merged.id} AND action = 'direct_publish'`;
    assert.deepEqual(event.evidence.sourceDraftIds, [source.id]);
  });

  await t.test('resolution creates one edit draft and rechecks published and gallery versions', async () => {
    const { placeId } = await publish(await makeDraft({ name: 'Fresh resolution fixture', nameLocal: 'ทดสอบร่างแก้ไขใหม่',
      descriptionEn: 'Keep legacy English detail' }));
    const source = await makeDraft({ name: 'Fresh resolution fixture', nameLocal: 'ทดสอบร่างแก้ไขใหม่', description: 'Updated fixture' });
    const path = `/places/${source.id}/duplicate-resolution`;
    const compare = () => admin(`${path}?targetPlaceId=${encodeURIComponent(placeId)}`).then(res => res.json());
    const selection = compared => ({
      targetPlaceId: placeId, sourceVersion: compared.sourceVersion, targetVersion: compared.targetVersion,
      galleryVersion: compared.galleryVersion, editVersion: null, choices: { description: 'draft' }, imageUrls: [],
    });
    const first = await compare();
    await sql`UPDATE places SET updated_at = updated_at + INTERVAL '1 microsecond' WHERE id = ${placeId}`;
    assert.equal((await write(path, selection(first), 409)).code, 'TARGET_PLACE_VERSION_CONFLICT');
    const final = selection(await compare());
    const { draft } = await write(path, final, 201);
    assert.equal(draft.target_place_id, placeId);
    assert.equal(draft.payload.descriptionEn, 'Keep legacy English detail');
    assert.equal((await write(path, final)).draft.id, draft.id);
    await sql`INSERT INTO media (id,place_id,url,title) VALUES ('gallery-after-transfer',${placeId},
      'https://fixture.example.test/later-image.jpg','Newly associated media')`;
    assert.equal((await publish(draft, 409)).code, 'GALLERY_VERSION_CONFLICT');
    const comparison = await admin(`/places/${draft.id}/reconcile`).then(res => res.json());
    assert.equal(comparison.stale, true);
    const refreshed = await write(`/places/${draft.id}/reconcile`, { version: draft.version,
      expectedPlaceVersion: comparison.placeVersion, expectedGalleryVersion: comparison.galleryVersion,
      selectedFields: ['description'], retainGallery: true });
    assert.equal((await publish(refreshed)).placeId, placeId);
    assert.equal((await sql`SELECT count(*) AS count FROM media WHERE place_id = ${placeId}`)[0].count, '1');
  });

  await t.test('duplicate resolution links only explicitly confirmed Google identities, atomically and once', async () => {
    const primary = (await (await upload('image/png', fixturePng(132))).json()).imageUrl;
    const name = 'Google identity resolution fixture';
    const nameLocal = 'สถานที่ทดสอบยืนยันรหัสกูเกิล';
    const original = await makeDraft({ name, nameLocal, imageUrl: primary, description: 'Original' });
    const { placeId } = await publish(original);
    const originalMedia = await sql`SELECT id, url FROM media WHERE place_id = ${placeId}`;
    const ids = ['ChIJStagedUnconfirmed123', 'ChIJConfirmedForDuplicate123', 'ChIJConcurrentClaim123'];
    const [unconfirmed, confirmed, contested] = ids;
    const otherTableOwner = 'fixture-other';
    const count = (await sql`SELECT count(*) AS count FROM places`)[0].count;

    const resolve = async (googlePlaceId, confirmGoogleIdentity) => {
      const reference = await write('/places/google-reference', { placeId: googlePlaceId, province: fixture.province }, 201);
      const source = await write(`/places/${reference.id}`, { ...fixture, name, nameLocal, description: googlePlaceId,
        version: reference.draft.version }, 200, 'PUT');
      const conflict = await publish(source, 409);
      assert.equal(conflict.conflictType, 'EXACT_NAME_MATCH');
      assert.equal(conflict.existingPlaces[0].placeId, placeId);
      const path = `/places/${source.id}/duplicate-resolution`;
      const compared = await (await admin(`${path}?targetPlaceId=${encodeURIComponent(placeId)}`)).json();
      const selection = { targetPlaceId: placeId, sourceVersion: compared.sourceVersion, targetVersion: compared.targetVersion,
        galleryVersion: compared.galleryVersion, editVersion: null, choices: { description: 'draft' }, imageUrls: [],
        ...(confirmGoogleIdentity && { confirmGoogleIdentity }),
        // The client can confirm, but cannot supply the identity being linked.
        googlePlaceId: 'ChIJUntrustedClientValue123',
        _duplicateEdit: { externalIds: [{ namespace: 'tat', external_id: 'not-verified' }] },
      };
      const preview = await write(path, { ...selection, preview: true });
      assert.equal(compared.googlePlaceIdForReview, googlePlaceId);
      assert.equal(preview.confirmedGoogleId, confirmGoogleIdentity ? googlePlaceId : null);
      assert.equal(preview.preview.description, googlePlaceId);
      const { draft } = await write(path, selection, 201);
      assert.equal((await write(path, selection)).draft.id, draft.id);
      assert.equal((await sql`SELECT external_id FROM place_external_ids WHERE external_id = ${googlePlaceId}`).length, 0);
      return draft;
    };

    await publish(await resolve(unconfirmed, false));
    assert.equal((await sql`SELECT external_id FROM place_external_ids WHERE place_id = ${placeId}`).length, 0);

    const draft = await resolve(confirmed, true);
    const saved = await write(`/places/${draft.id}`, { ...draft.payload, version: draft.version,
      googlePlaceId: 'ChIJUntrustedEditValue123', _duplicateEdit: {} }, 200, 'PUT');
    const results = await Promise.all([publish(saved), publish(saved)]);
    assert.deepEqual(results.map(result => result.placeId), [placeId, placeId]);
    const records = await sql`SELECT namespace, external_id, place_id, reviewed_by FROM place_external_ids WHERE place_id = ${placeId}`;
    assert.deepEqual([...records], [{ namespace: 'google_places', external_id: confirmed, place_id: placeId, reviewed_by: 'test-admin' }]);
    const events = await sql`SELECT evidence FROM place_review_events WHERE draft_id = ${saved.id} AND action = 'direct_publish'`;
    assert.equal(events.length, 1);
    assert.deepEqual(events[0].evidence.googleIdentityConfirmations, [{ id: confirmed, confirmedBy: 'test-admin' }]);

    const found = classifyCandidates([{ placeId: confirmed, name: 'Renamed upstream', lat: null, lng: null, holds: [] }],
      await readExisting(getSql, fixture.province, true))[0];
    assert.equal(found.duplicateStatus, 'existing_place');
    assert.ok(found.duplicateMatches.some(match => match.placeId === placeId && match.reason === 'google_place_id'));
    const blocked = await write('/places/google-reference', { placeId: confirmed, province: 'ระยอง' }, 409);
    assert.equal(blocked.placeId, placeId);

    const pending = await resolve(contested, true);
    // Simulate a claim after the ownership SELECT, inside the isolated DB.
    // The publish must unwind even after it has begun changing the target.
    await sql.unsafe(`CREATE FUNCTION cms_test_late_identity_claim() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN IF NEW.description = 'ChIJConcurrentClaim123' THEN
        INSERT INTO place_external_ids(namespace, external_id, place_id, reviewed_by)
          VALUES ('google_places', 'ChIJConcurrentClaim123', 'fixture-other', 'test-admin');
      END IF; RETURN NEW; END $$`);
    await sql`CREATE TRIGGER cms_test_late_identity_claim BEFORE UPDATE OF description ON places
      FOR EACH ROW EXECUTE FUNCTION cms_test_late_identity_claim()`;
    try {
      assert.equal((await publish(pending, 409)).code, 'EXTERNAL_IDENTITY_CONFLICT');
    } finally {
      await sql`DROP TRIGGER cms_test_late_identity_claim ON places`;
      await sql`DROP FUNCTION cms_test_late_identity_claim()`;
    }
    const [current] = await sql`SELECT description, image_url FROM places WHERE id = ${placeId}`;
    assert.deepEqual(current, { description: confirmed, image_url: primary });
    assert.equal((await sql`SELECT status FROM place_drafts WHERE id = ${pending.id}`)[0].status, 'draft');
    assert.equal((await sql`SELECT id FROM place_review_events WHERE draft_id = ${pending.id}`).length, 0);
    assert.equal((await sql`SELECT external_id FROM place_external_ids WHERE external_id = ${contested}`).length, 0);

    await sql`INSERT INTO place_external_ids(namespace, external_id, place_id, reviewed_by)
      VALUES ('google_places', ${contested}, ${otherTableOwner}, 'test-admin')`;
    assert.equal((await publish(pending, 409)).code, 'EXTERNAL_IDENTITY_CONFLICT');
    assert.equal((await sql`SELECT place_id FROM place_external_ids WHERE external_id = ${contested}`)[0].place_id, otherTableOwner);
    assert.equal((await sql`SELECT count(*) AS count FROM places`)[0].count, count);
    assert.deepEqual(await sql`SELECT id, url FROM media WHERE place_id = ${placeId}`, originalMedia);
  });

  await t.test('duplicate candidates distinguish external identity and ambiguous names', async () => {
    const target = await publish(await makeDraft({ name: 'Ambiguous fixture', nameLocal: 'ชื่อร่วมตัวอย่าง' }));
    await sql`INSERT INTO places (id,name,province,category,lat,lng)
      VALUES ('second-duplicate-fixture','Ambiguous fixture','ชลบุรี','Culture',13.2,100.9)`;
    await sql`INSERT INTO place_external_ids(namespace,external_id,place_id,reviewed_by)
      VALUES ('google_places','external-identity-fixture',${target.placeId},'test-admin')`;
    const source = await makeDraft({ name: 'Ambiguous fixture', nameLocal: 'ชื่อร่วมตัวอย่าง' });
    const ambiguous = await publish(source, 409);
    assert.equal(ambiguous.conflictType, 'MULTIPLE_CONFLICT_CANDIDATES');
    assert.equal(ambiguous.existingPlaces.length, 2);
    assert.ok(ambiguous.existingPlaces.every(item => item.canResolve));
    const identity = await makeDraft({ name: 'External identity fixture', nameLocal: 'ชื่อเฉพาะรหัสภายนอก' });
    await sql`UPDATE place_drafts SET payload = payload || '{"googlePlaceId":"external-identity-fixture"}'::jsonb WHERE id = ${identity.id}`;
    const external = await publish(identity, 409);
    assert.equal(external.conflictType, 'EXTERNAL_IDENTITY_MATCH');
    assert.equal(external.existingPlaces[0].placeId, target.placeId);
    assert.deepEqual(external.existingPlaces[0].reasons, ['EXTERNAL_IDENTITY_MATCH']);
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
