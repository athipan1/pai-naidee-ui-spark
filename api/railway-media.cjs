const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Readable } = require('node:stream');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

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

const IMAGE_TYPES = Object.freeze({ jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' });
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const filenamePattern = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;
class InvalidImageError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function createImageUpload() {
  return multer({
    storage: multer.memoryStorage(),
    // Busboy rejects files that reach its limit. The image validator still enforces exactly 5 MiB.
    limits: { fileSize: MAX_IMAGE_BYTES + 1, files: 1, fields: 0 },
    fileFilter: (_req, file, cb) => cb(null, Object.values(IMAGE_TYPES).includes(file.mimetype)),
  });
}

function publicMediaUrl(filename) {
  const base = process.env.PUBLIC_API_BASE_URL || 'https://painaidee-api-production.up.railway.app';
  return `${base.replace(/\/$/, '')}/api/media/cms/${filename}`;
}

function registerRailwayMedia(app, { getSql, storage, requireAdmin }) {
  const sendImage = publishedOnly => async (req, res) => {
    const filename = req.params.filename;
    const match = filenamePattern.exec(filename);
    if (!match) return res.status(404).end();
    if (!storage) return res.status(503).json({ error: 'Image storage unavailable.' });
    try {
      if (publishedOnly) {
        const sql = getSql();
        const found = await sql`SELECT 1 FROM media WHERE url = ${publicMediaUrl(filename)} AND type = 'image' LIMIT 1`;
        if (!found.length) return res.status(404).end();
      }
      const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: `cms/${filename}` }));
      res.setHeader('Content-Type', IMAGE_TYPES[match[1]]);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', publishedOnly ? 'public, max-age=3600' : 'private, no-store');
      Readable.from(object.Body).on('error', () => res.destroy()).pipe(res);
    } catch (error) {
      if (error?.name === 'NoSuchKey') return res.status(404).end();
      console.error('Railway image download failed.');
      if (!res.headersSent) res.status(503).json({ error: 'Image currently unavailable.' });
    }
  };
  app.get('/api/media/cms/:filename', sendImage(true));
  app.get('/api/admin/media/:filename', requireAdmin, sendImage(false));
}

async function uploadImage(storage, file) {
  if (!storage) throw new Error('Railway Storage Bucket is not configured.');
  const ext = Object.keys(IMAGE_TYPES).find(key => IMAGE_TYPES[key] === file.mimetype);
  if (!ext) throw new InvalidImageError('Unsupported image format.');
  const bytes = file.buffer;
  if (!Buffer.isBuffer(bytes)) throw new InvalidImageError('Image bytes are missing.');
  if (bytes.length > MAX_IMAGE_BYTES) throw new InvalidImageError('Image must be at most 5 MB.', 413);
  const valid = ext === 'jpg' ? bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : ext === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!valid) throw new InvalidImageError('Image bytes do not match its file type.');
  const filename = `${randomUUID()}.${ext}`;
  await storage.client.send(new PutObjectCommand({ Bucket: storage.bucket, Key: `cms/${filename}`, Body: bytes, ContentType: file.mimetype }));
  return publicMediaUrl(filename);
}

module.exports = { createRailwayMediaStorage, registerRailwayMedia, uploadImage, createImageUpload, InvalidImageError, MAX_IMAGE_BYTES };
