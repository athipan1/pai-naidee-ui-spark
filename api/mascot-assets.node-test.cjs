const assert = require('node:assert/strict');
const { once } = require('node:events');
const { Readable } = require('node:stream');
const { test } = require('node:test');
const express = require('express');
const { registerMascotAssets } = require('./mascot-assets.cjs');

test('mascot delivery only reads approved keys and rejects replaced objects', async () => {
  const keys = [];
  const app = express();
  registerMascotAssets(app, {
    bucket: 'test-bucket',
    client: { send: async ({ input }) => {
      keys.push(input.Key);
      return { ContentLength: 10020, Body: Readable.from([Buffer.alloc(10020)]) };
    } },
  });
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const base = 'http://127.0.0.1:' + server.address().port + '/api/media/mascot';
    assert.equal((await fetch(base + '/6d33c7eae9c8/private.blend')).status, 404);
    assert.deepEqual(keys, []);
    for (let attempt = 0; attempt < 2; attempt++) {
      assert.equal((await fetch(base + '/6d33c7eae9c8/elephant.webp')).status, 503);
    }
    assert.deepEqual(keys, ['mascot/elephant.webp', 'mascot/elephant.webp']);
  } finally {
    server.close();
  }
});
