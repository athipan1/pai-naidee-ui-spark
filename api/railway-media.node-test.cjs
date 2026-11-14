const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { request } = require('node:http');
const { Readable, PassThrough } = require('node:stream');
const express = require('express');
const sharp = require('sharp');
const { fixturePng } = require('./test-fixtures/image.cjs');
const { registerRailwayMedia, uploadImage } = require('./railway-media.cjs');

const legacy = '/api/media/cms/00000000-0000-4000-8000-000000000000.png';
const modern = '/api/media/cms/00000000-0000-8000-8000-000000000000.png';
const variant = modern + '?w=256';
const missing = () => Object.assign(new Error('object missing'), { name: 'NoSuchKey' });

async function fixture(t, send, options = {}) {
  const app = express();
  const events = [];
  registerRailwayMedia(app, {
    getSql: () => async () => options.unpublished ? [] : [{}],
    storage: { bucket: 'fixture', client: { send } },
    requireAdmin(req, res, next) {
      if (req.headers.authorization === 'Bearer fixture') next();
      else res.sendStatus(401);
    },
    log: event => events.push(event),
    ...options,
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return { origin, get: (path, init) => fetch(origin + path, init), events };
}

test('variants preserve original, enforce real image validation, and never upscale', async () => {
  const objects = new Map();
  const storage = { bucket: 'fixture', client: { async send({ input }) {
    objects.set(input.Key, input.Body);
  } } };
  const upload = buffer => uploadImage(storage, { mimetype: 'image/png', buffer });
  await assert.rejects(upload(fixturePng().subarray(0, 60)), { status: 400 });
  assert.equal(objects.size, 0);
  const png = fixturePng(60, 800, 450);
  const url = await upload(png);
  const filename = url.split('/').at(-1);
  assert.equal(filename[14], '8');
  assert.deepEqual(objects.get(`cms/${filename}`), png);
  for (const [width, expected] of [[256, 256], [640, 640], [1200, 800]]) {
    const encoded = objects.get(`cms/variants/v1/${filename}/${width}.webp`);
    const info = await sharp(encoded).metadata();
    assert.equal(info.format, 'webp');
    assert.equal(info.width, expected);
    assert.equal(info.height, Math.round(expected * 450 / 800));
  }
});

test('legacy, variant fallback and private access retain their cache and authorization policies', async t => {
  const keys = [];
  const { get } = await fixture(t, async ({ input }) => {
    keys.push(input.Key);
    if (input.Key.endsWith('/256.webp')) return { Body: Readable.from(['variant']), ContentLength: 7 };
    if (input.Key.includes('/variants/')) throw missing();
    return { Body: Readable.from(['original']), ContentLength: 8 };
  });
  const optimized = await get(variant);
  assert.equal(optimized.headers.get('content-type'), 'image/webp');
  assert.equal(optimized.headers.get('content-length'), '7');
  assert.match(optimized.headers.get('cache-control'), /immutable/);
  assert.equal(await optimized.text(), 'variant');
  assert.equal(await (await get(legacy + '?w=256')).text(), 'original');
  assert.equal(await (await get(modern + '?w=640')).text(), 'original');
  assert.equal(keys.filter(key => key.endsWith('/640.webp')).length, 1);
  const admin = variant.replace('/media/cms/', '/admin/media/');
  assert.equal((await get(admin)).status, 401);
  const privateImage = await get(admin, { headers: { authorization: 'Bearer fixture' } });
  assert.equal(privateImage.headers.get('cache-control'), 'private, no-store');
  assert.equal(await privateImage.text(), 'variant');

  const draft = await fixture(t, async () => assert.fail('unpublished media must not reach S3'), { unpublished: true });
  assert.equal((await draft.get(variant)).status, 404);
});

test('bounded queue rejects overflow, removes canceled clients, and releases after the stream closes', async t => {
  const bodies = [];
  const { origin, get, events } = await fixture(t, async () => {
    const body = new PassThrough();
    bodies.push(body);
    body.write('a');
    return { Body: body };
  }, { maxActive: 1, maxQueued: 1, timeoutMs: 3000 });

  const first = request(origin + legacy);
  first.on('error', error => { if (error.code !== 'ECONNRESET') throw error; });
  first.end();
  await once(first, 'response');
  const queued = request(origin + legacy);
  queued.on('error', error => { if (error.code !== 'ECONNRESET') throw error; });
  queued.end();
  await new Promise(resolve => setTimeout(resolve, 25));
  const overflow = await get(legacy);
  assert.equal(overflow.status, 503);
  assert.equal(overflow.headers.get('retry-after'), '2');
  assert.equal(bodies.length, 1);

  const closed = new Promise(resolve => bodies[0].once('close', resolve));
  first.destroy();
  await closed;
  const [response] = await once(queued, 'response');
  assert.equal(response.statusCode, 200);
  const ended = once(response, 'end');
  response.resume();
  bodies[1].end('b');
  await ended;
  assert.ok(events.some(event => event.outcome === 'disconnect'));
});

test('deadline covers S3 headers and response body, and failures free their slot', async t => {
  let storageSignal;
  let body;
  const { get, events } = await fixture(t, async (_command, { abortSignal }) => {
    if (!storageSignal) {
      storageSignal = abortSignal;
      return new Promise((_, reject) => abortSignal.addEventListener('abort', () => reject(abortSignal.reason), { once: true }));
    }
    if (!body) {
      body = new PassThrough();
      body.write('a');
      return { Body: body };
    }
    if (!body.failedOnce) {
      body.failedOnce = true;
      const failing = new PassThrough();
      setImmediate(() => failing.destroy(new Error('fixture S3 stream failed')));
      return { Body: failing };
    }
    return { Body: Readable.from(['ok']) };
  }, { maxActive: 1, timeoutMs: 150 });
  assert.equal((await get(legacy)).status, 503);
  assert.equal(storageSignal.aborted, true);
  const partial = await get(legacy);
  await assert.rejects(partial.text());
  assert.equal(body.destroyed, true);
  await assert.rejects(get(legacy).then(response => response.text()));
  assert.equal(await (await get(legacy)).text(), 'ok');
  assert.equal(events.filter(event => event.outcome === 'timeout').length, 2);
  assert.ok(events.some(event => event.outcome === 'storage_error'));
});

test('a failed variant write leaves the original available', async () => {
  const writes = [];
  const storage = { bucket: 'fixture', client: { async send({ input }) {
    writes.push(input.Key);
    if (input.Key.endsWith('/640.webp')) throw Error('fixture failure');
  } } };
  const image = await uploadImage(storage, { buffer: fixturePng(), mimetype: 'image/png' });
  assert.equal(writes[0], `cms/${image.split('/').at(-1)}`);
  assert.equal(writes.length, 4);
});

test('storage object missing returns 404 and a provider failure returns 503 without secrets', async t => {
  let error = missing();
  const { get } = await fixture(t, async () => { throw error; });
  assert.equal((await get(legacy)).status, 404);
  error = new Error('fixture-provider-secret');
  const failure = await get(legacy);
  assert.equal(failure.status, 503);
  assert.doesNotMatch(await failure.text(), /fixture-provider-secret/);
});
