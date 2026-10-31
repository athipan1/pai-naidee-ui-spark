const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Readable } = require('node:stream');
const { randomUUID } = require('node:crypto');

function createRailwayMediaStorage(env = process.env) {
  const bucket = env.AWS_S3_BUCKET_NAME;
  const endpoint = env.AWS_ENDPOINT_URL;
  const region = env.AWS_DEFAULT_REGION || 'sin';
  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
  if (![bucket, endpoint, accessKeyId, secretAccessKey].every(Boolean)) return null;
  const client = new S3Client({ region, endpoint, forcePathStyle: env.AWS_S3_URL_STYLE === 'path',
    credentials: { accessKeyId, secretAccessKey }, });
  return { client, bucket };
}

function registerRailwayMedia(app, { getSql, storage }) {
  app.get('/api/media/cms/:filename', async (req, res) => {
    if (!storage) return res.status(503).json({ error: 'Image storage unavailable.' });
    const filename = req.params.filename;
    if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(filename)) return res.status(404).end();
    const base = process.env.PUBLIC_API_BASE_URL || 'https://painaidee-api-production.up.railway.app';
    const publicUrl = `${base.replace(/\/$/, '')}/api/media/cms/${filename}`;
    try {
      const sql = getSql();
      const found = await sql`SELECT 1 FROM media WHERE url = ${publicUrl} LIMIT 1`;
      if (!found.length) return res.status(404).end();
      const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: `cms/${filename}` }));
      res.setHeader('Content-Type', object.ContentType || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      Readable.from(object.Body).on('error', () => res.destroy()).pipe(res);
    } catch (error) {
      console.error('Railway image download failed:', error?.message);
      if (!res.headersSent) res.status(503).json({ error: 'Image currently unavailable.' });
    }
  });
}

async function uploadImage(storage, file) {
  if (!storage) throw new Error('Railway Storage Bucket is not configured.');
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.mimetype];
  if (!ext) throw new Error('Unsupported image format.');
  const bytes = file.buffer;
  const valid = ext === 'jpg' ? bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : ext === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!valid) throw new Error('Image bytes do not match its file type.');
  const filename = `${randomUUID()}.${ext}`;
  await storage.client.send(new PutObjectCommand({ Bucket: storage.bucket, Key: `cms/${filename}`, Body: bytes, ContentType: file.mimetype }));
  const base = process.env.PUBLIC_API_BASE_URL || 'https://painaidee-api-production.up.railway.app';
  return `${base.replace(/\/$/, '')}/api/media/cms/${filename}`;
}

module.exports = { createRailwayMediaStorage, registerRailwayMedia, uploadImage };
