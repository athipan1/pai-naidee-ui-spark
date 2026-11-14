const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { randomUUID } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const multer = require('multer');
const sharp = require('sharp');

function createRailwayMediaStorage(env = process.env) {
  const bucket = env.AWS_S3_BUCKET_NAME;
  const endpoint = env.AWS_ENDPOINT_URL;
  const region = env.AWS_DEFAULT_REGION || 'sin';
  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
  if (![bucket, endpoint, accessKeyId, secretAccessKey].every(Boolean)) return null;
  const client = new S3Client({
    region, endpoint, forcePathStyle: env.AWS_S3_URL_STYLE === 'path',
    credentials: { accessKeyId, secretAccessKey },
    maxAttempts: 2,
  });
  return { client, bucket };
}

const IMAGE_TYPES = Object.freeze({ jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' });
const FORMATS = { jpg: 'jpeg', png: 'png', webp: 'webp' };
const IMAGE_WIDTHS = [256, 640, 1200];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const filenamePattern = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

class InvalidImageError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

class MediaBusyError extends Error {}

function createImageUpload() {
  return multer({
    storage: multer.memoryStorage(),
    // Busboy rejects files that reach its limit. The image validator still enforces exactly 5 MiB.
    limits: { fileSize: MAX_IMAGE_BYTES + 1, files: 1, fields: 0, parts: 2 },
    fileFilter: (_req, file, cb) => cb(null, Object.values(IMAGE_TYPES).includes(file.mimetype)),
  });
}

function publicMediaUrl(filename) {
  const base = process.env.PUBLIC_API_BASE_URL || 'https://painaidee-api-production.up.railway.app';
  return `${base.replace(/\/$/, '')}/api/media/cms/${filename}`;
}

function variantKey(filename, width) {
  return `cms/variants/v1/${filename}/${width}.webp`;
}

function isMissingObject(error) {
  return error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404;
}

// Hold the slot through the end of the object stream, including backpressure.
function createReadQueue(maxActive, maxQueued) {
  let active = 0;
  const waiting = new Set();
  function release() {
    const next = waiting.values().next().value;
    if (next) next();
    else active--;
  }
  return {
    get stats() { return { active, queued: waiting.size }; },
    async acquire(signal) {
      signal.throwIfAborted();
      if (active < maxActive) {
        active++;
        return release;
      }
      if (waiting.size >= maxQueued) throw new MediaBusyError();
      return new Promise((resolve, reject) => {
        const start = () => {
          waiting.delete(start);
          signal.removeEventListener('abort', abort);
          resolve(release);
        };
        const abort = () => {
          waiting.delete(start);
          reject(signal.reason);
        };
        waiting.add(start);
        signal.addEventListener('abort', abort, { once: true });
      });
    },
  };
}

function registerRailwayMedia(app, {
  getSql, storage, requireAdmin, maxActive = 16, maxQueued = 32, timeoutMs = 12_000,
  log = (event) => console.warn(JSON.stringify(event)),
}) {
  const queue = createReadQueue(maxActive, maxQueued);
  const sendImage = publishedOnly => async (req, res) => {
    const filename = req.params.filename;
    const match = filenamePattern.exec(filename);
    if (!match) return res.status(404).end();
    if (!storage) return res.status(503).json({ error: 'Image storage unavailable.' });

    const requestedWidth = typeof req.query.w === 'string' ? Number(req.query.w) : 0;
    // Version 8 identifies uploads with the variant layout. Legacy URLs go directly to the original.
    const width = filename[14] === '8' && IMAGE_WIDTHS.includes(requestedWidth) ? requestedWidth : 0;
    const started = performance.now();
    const deadline = AbortSignal.timeout(timeoutMs);
    const disconnected = new AbortController();
    const onClose = () => { if (!res.writableFinished) disconnected.abort(); };
    res.once('close', onClose);
    if (res.destroyed) disconnected.abort();
    const signal = AbortSignal.any([deadline, disconnected.signal]);
    let release;
    let body;
    let outcome = 'ok';
    let waitMs;
    let bytes;
    try {
      release = await queue.acquire(signal);
      waitMs = Math.round(performance.now() - started);
      signal.throwIfAborted();
      if (publishedOnly) {
        const sql = getSql();
        const query = sql`SELECT 1 FROM media WHERE url = ${publicMediaUrl(filename)} AND type = 'image' LIMIT 1`;
        const cancel = () => query.cancel?.();
        signal.addEventListener('abort', cancel, { once: true });
        let found;
        try {
          found = await query;
          signal.throwIfAborted();
        } finally {
          signal.removeEventListener('abort', cancel);
        }
        if (!found.length) {
          outcome = 'not_published';
          return res.status(404).end();
        }
      }

      const ObjectCommand = req.method === 'HEAD' ? HeadObjectCommand : GetObjectCommand;
      const get = key => storage.client.send(
        new ObjectCommand({ Bucket: storage.bucket, Key: key }), { abortSignal: signal }
      );
      let object;
      let optimized = false;
      if (width) {
        try {
          object = await get(variantKey(filename, width));
          optimized = true;
        } catch (error) {
          if (!isMissingObject(error)) throw error;
          signal.throwIfAborted();
        }
      }
      object ??= await get(`cms/${filename}`);
      if (req.method !== 'HEAD') {
        if (!object.Body) throw new Error('Missing S3 response body');
        body = object.Body instanceof Readable ? object.Body : Readable.from(object.Body);
      }
      signal.throwIfAborted();
      bytes = object.ContentLength;
      res.setHeader('Content-Type', optimized ? IMAGE_TYPES.webp : IMAGE_TYPES[match[1]]);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // Publication can be removed. Keep the existing one-hour public cache window.
      res.setHeader('Cache-Control', !publishedOnly ? 'private, no-store' :
        optimized ? 'public, max-age=3600, immutable' : 'public, max-age=3600');
      if (Number.isSafeInteger(bytes) && bytes >= 0) res.setHeader('Content-Length', bytes);
      if (req.method === 'HEAD') return res.end();
      await pipeline(body, res, { signal });
    } catch (error) {
      outcome = deadline.aborted ? 'timeout' : disconnected.signal.aborted &&
        (!body || error?.code === 'ERR_STREAM_PREMATURE_CLOSE' || error?.name === 'AbortError') ? 'disconnect' :
        error instanceof MediaBusyError ? 'busy' : isMissingObject(error) ? 'missing' : 'storage_error';
      if (res.destroyed || res.headersSent) return;
      res.setHeader('Cache-Control', 'no-store');
      if (outcome === 'missing') return res.status(404).end();
      if (outcome === 'busy') res.setHeader('Retry-After', '2');
      res.status(503).json({ error: 'Image currently unavailable.' });
    } finally {
      body?.destroy();
      res.off('close', onClose);
      release?.();
      const durationMs = Math.round(performance.now() - started);
      if (outcome !== 'ok' || durationMs >= 1_000) {
        log({ event: 'cms_media_read', outcome, scope: publishedOnly ? 'public' : 'admin',
          width, durationMs, waitMs, bytes, ...queue.stats });
      }
    }
  };
  app.get('/api/media/cms/:filename', sendImage(true));
  app.get('/api/admin/media/:filename', requireAdmin, sendImage(false));
}

let activeUploads = 0;

async function uploadImage(storage, file, clientSignal) {
  if (!storage) throw new Error('Railway Storage Bucket is not configured.');
  const ext = Object.keys(IMAGE_TYPES).find(key => IMAGE_TYPES[key] === file.mimetype);
  if (!ext) throw new InvalidImageError('Unsupported image format.');
  const bytes = file.buffer;
  if (!Buffer.isBuffer(bytes)) throw new InvalidImageError('Image bytes are missing.');
  if (bytes.length > MAX_IMAGE_BYTES) throw new InvalidImageError('Image must be at most 5 MB.', 413);
  if (activeUploads >= 2) throw new InvalidImageError('Image processor is busy. Try again shortly.', 503);
  activeUploads++;
  try {
    const source = sharp(bytes, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'warning' });
    try {
      const metadata = await source.metadata();
      if (metadata.format !== FORMATS[ext] || !metadata.width || !metadata.height ||
          metadata.width * metadata.height > MAX_INPUT_PIXELS || metadata.pages > 1) throw new Error();
    } catch {
      throw new InvalidImageError('Invalid image, unsupported animation, or image dimensions too large.');
    }
    const variants = [];
    for (const width of IMAGE_WIDTHS) {
      clientSignal?.throwIfAborted();
      try {
        const encoded = await source.clone().autoOrient().resize({
          width, height: width, fit: 'inside', withoutEnlargement: true,
        }).webp({ quality: 78 }).timeout({ seconds: 5 }).toBuffer();
        variants.push({ width, bytes: encoded });
      } catch {
        throw new InvalidImageError('Image could not be decoded and resized.');
      }
    }

    // RFC 9562 version 8 with random custom bits. Keeps the existing filename/URL shape.
    const uuid = randomUUID();
    const filename = `${uuid.slice(0, 14)}8${uuid.slice(15)}.${ext}`;
    const deadline = AbortSignal.timeout(15_000);
    const signal = clientSignal ? AbortSignal.any([deadline, clientSignal]) : deadline;
    const put = (key, data, type) => {
      signal.throwIfAborted();
      return storage.client.send(new PutObjectCommand({
        Bucket: storage.bucket, Key: key, Body: data, ContentType: type,
      }), { abortSignal: signal });
    };
    await put(`cms/${filename}`, bytes, file.mimetype);
    for (const variant of variants) {
      try {
        await put(variantKey(filename, variant.width), variant.bytes, IMAGE_TYPES.webp);
      } catch {
        console.warn(JSON.stringify({ event: 'cms_media_variant_write', outcome: 'original_available', width: variant.width }));
        if (signal.aborted) break;
      }
    }
    return publicMediaUrl(filename);
  } finally {
    activeUploads--;
  }
}

module.exports = { createRailwayMediaStorage, registerRailwayMedia, uploadImage, createImageUpload, InvalidImageError, MAX_IMAGE_BYTES };
