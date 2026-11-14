import { createRequire } from 'node:module';
import { once } from 'node:events';
import { Readable } from 'node:stream';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);
const express = require('../../api/node_modules/express');
const { registerRailwayMedia } = require(process.env.MEDIA_CACHE_BASELINE_MODULE || '../../api/railway-media.cjs');
const { fixturePng } = require('../../api/test-fixtures/image.cjs');
const baseline = Boolean(process.env.MEDIA_CACHE_BASELINE_MODULE);
const first = '1a111111-1111-4111-8111-111111111111.png';
const replacement = '2a111111-1111-4111-8111-111111111111.png';
const mediaPath = '/api/media/cms/';
const original = fixturePng(90);
const updated = fixturePng(160);
const tag = (name: string) => `"${name}"`;

test('browser reuses fresh bytes, revalidates reloads, and only downloads a replacement when the primary changes', async ({ page, request }, testInfo) => {
  const app = express();
  let published = first;
  const responses: Array<{ status: number; length: number; validator?: string }> = [];
  app.use(mediaPath, (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => {
    res.once('finish', () => responses.push({
      status: res.statusCode, length: res.statusCode === 200 ? Number(res.getHeader('Content-Length')) : 0,
      ...(req.headers['if-none-match'] && { validator: req.headers['if-none-match'] }),
    }));
    next();
  });
  registerRailwayMedia(app, {
    getSql: () => async (_parts: unknown, url: string) => url.endsWith(published) ? [{}] : [],
    requireAdmin: (_req: unknown, res: import('node:http').ServerResponse) => { res.statusCode = 401; res.end(); },
    log: () => {},
    storage: { bucket: 'fixture', client: { async send({ input }: { input: { Key: string; IfNoneMatch?: string } }) {
      const name = input.Key.split('/').at(-1)!;
      if (input.IfNoneMatch === tag(name)) throw { $metadata: { httpStatusCode: 304 } };
      const bytes = name === first ? original : updated;
      return { Body: Readable.from([bytes]), ContentLength: bytes.length, ETag: tag(name) };
    } } },
  });
  app.get('/away', (_req: unknown, res: { send: (html: string) => void }) => res.send('<main>Away</main>'));
  app.get('/detail', (_req: unknown, res: { set: (key: string, value: string) => void; send: (html: string) => void }) => {
    res.set('Cache-Control', 'no-store');
    res.send(`<!doctype html><img id="hero" src="${mediaPath}${published}" width="800" height="450" alt="Fixture hero">`);
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing fixture address');
  const root = `http://127.0.0.1:${address.port}`;
  const hero = page.getByRole('img', { name: 'Fixture hero' });
  const metrics: Record<string, unknown> = {};
  async function sample(label: string, start: number) {
    await expect(hero).toHaveJSProperty('naturalWidth', 800);
    const entry = await hero.evaluate((image: HTMLImageElement) => {
      const item = performance.getEntriesByName(image.src).at(-1) as PerformanceResourceTiming | undefined;
      return item && { transferSize: item.transferSize, encodedBodySize: item.encodedBodySize, duration: item.duration };
    });
    metrics[label] = { responses: responses.slice(start), browser: entry };
  }

  try {
    await page.goto(root + '/detail');
    await sample('cold', 0);
    expect(responses).toEqual([{ status: 200, length: original.length }]);
    let start = responses.length;
    await page.goto(root + '/away');
    await page.goto(root + '/detail');
    await sample('warm', start);
    expect(responses.slice(start)).toEqual([]);

    start = responses.length;
    await page.reload();
    await sample('reload', start);
    const reloadResponses = responses.slice(start);
    start = responses.length;
    // Force the browser to revalidate the cached representation even on
    // engines that reuse fresh subresources on a normal document reload.
    const forced = await hero.evaluate(async (image: HTMLImageElement) => {
      const response = await fetch(image.src, { cache: 'no-cache' });
      return { status: response.status, decodedBytes: (await response.arrayBuffer()).byteLength };
    });
    expect(forced).toEqual({ status: 200, decodedBytes: original.length });
    metrics.forced = responses.slice(start);
    const [forcedResponse] = responses.slice(start);
    expect(responses.length - start).toBe(1);
    // WebKit can use a different cached entry for fetch than for <img>.
    // Validate the response against the actual validator sent by the browser.
    expect(forcedResponse).toMatchObject(!baseline && forcedResponse.validator === tag(first) ?
      { status: 304, length: 0 } : { status: 200, length: original.length });
    if (baseline) {
      await testInfo.attach('cache-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
      console.log(testInfo.project.name, JSON.stringify(metrics));
      return;
    }
    // Engines may reuse a fresh subresource on reload or revalidate with the origin.
    expect(reloadResponses.every(response => response.status === 304 && response.length === 0)).toBe(true);
    // Explicit conditional GET verifies the origin contract in every browser
    // project, even if the engine chose an unconditional network request.
    const revalidated = await request.get(root + mediaPath + first, { headers: { 'If-None-Match': tag(first) } });
    expect(revalidated.status()).toBe(304);
    expect((await revalidated.body()).byteLength).toBe(0);

    start = responses.length;
    published = replacement;
    await page.reload();
    await expect(hero).toHaveAttribute('src', mediaPath + replacement);
    await sample('replacement', start);
    expect(responses.slice(start)).toEqual([{ status: 200, length: updated.length }]);
    const removed = await request.get(root + mediaPath + first, { headers: { 'If-None-Match': tag(first) } });
    expect(removed.status()).toBe(404);
    expect(removed.headers()['cache-control']).toContain('no-store');
    await testInfo.attach('cache-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
    console.log(testInfo.project.name, JSON.stringify(metrics));
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
