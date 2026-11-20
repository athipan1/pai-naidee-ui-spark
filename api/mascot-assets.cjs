const { createHash } = require('node:crypto');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

const approvedAssets = [
  ['elephant.glb', 'model/gltf-binary', 1750840, '7a57a070bddba4cb4ae6fd3f955b3c4cda23cd4c35d064194234f609c7a7114d'],
  ['elephant.webp', 'image/webp', 10020, '6d33c7eae9c88b47e34effc66c11e1b27b6ac3e34186b76075822019acc33530'],
];

async function loadAsset(storage, name, expectedSize, sha256) {
  const signal = AbortSignal.timeout(5000);
  const object = await storage.client.send(new GetObjectCommand({
    Bucket: storage.bucket,
    Key: 'mascot/' + name,
  }), { abortSignal: signal });
  try {
    if (!object.Body || object.ContentLength !== expectedSize) throw new Error('Unexpected mascot size');
    const chunks = [];
    let length = 0;
    for await (const chunk of object.Body) {
      signal.throwIfAborted();
      length += chunk.length;
      if (length > expectedSize) throw new Error('Mascot exceeds approved size');
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks, length);
    if (length !== expectedSize || createHash('sha256').update(bytes).digest('hex') !== sha256) {
      throw new Error('Unexpected mascot digest');
    }
    return bytes;
  } finally {
    object.Body?.destroy?.();
  }
}

function registerMascotAssets(app, storage) {
  for (const [name, type, size, sha256] of approvedAssets) {
    // Cache only verified bytes. Other bucket keys are never used by this route.
    let pending;
    const path = '/api/media/mascot/' + sha256.slice(0, 12) + '/' + name;
    app.get(path, async (_req, res) => {
      if (!storage) return res.status(503).end();
      try {
        pending ??= loadAsset(storage, name, size, sha256).catch(error => {
          pending = undefined;
          throw error;
        });
        const bytes = await pending;
        res.set({
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'Content-Type': type,
          'X-Content-Type-Options': 'nosniff',
          ETag: '"' + sha256 + '"',
        }).send(bytes);
      } catch {
        if (!res.headersSent) res.status(503).end();
      }
    });
  }
}

module.exports = { registerMascotAssets };
