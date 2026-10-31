require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { randomUUID } = require('node:crypto');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { registerAdminCms } = require('./admin-cms.cjs');
const {
  buildCorsOptions,
  createRateLimiter,
  createRoleGuard,
  validateTalkPayload,
} = require('./security.cjs');
const {
  ensureSchema,
  getPlaceById,
  listPlaces,
  listPlaceFacets,
  suggestPlaces,
  listNearbyPlaces,
  parseNearbyOptions,
  pingDatabase,
  closeDatabase,
  getSql,
  invalidateSearchIndex,
} = require('./postgres-db.cjs');

const app = express();
const PORT = process.env.PORT || 8000;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: '256kb' }));
app.use('/api', createRateLimiter({ windowMs: 60_000, max: 180 }));

const authUrl = process.env.SUPABASE_URL;
const authKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const authClient = authUrl && authKey ? createClient(authUrl, authKey, {
  auth: { persistSession: false, autoRefreshToken: false },
}) : null;
const images = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});
registerAdminCms(app, {
  getSql,
  requireAdmin: createRoleGuard(authClient, ['admin']),
  storage: { single: images.single.bind(images), client: authClient },
  invalidateSearchIndex,
});

app.get('/api/places', async (req, res) => {
  try {
    const result = await listPlaces({
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      province: req.query.province,
      search: req.query.search,
    });
    res.json(result);
  } catch (error) {
    console.error('GET /api/places failed:', error?.message || error);
    res.status(503).json({ error: 'Places database is unavailable.' });
  }
});

app.get('/api/places/suggest', async (req, res) => {
  const query = req.query.q;
  if (typeof query !== 'string' || query.length > 120) {
    return res.status(400).json({ error: 'Invalid suggestion query.' });
  }
  try {
    res.json({ suggestions: await suggestPlaces(query, req.query.limit) });
  } catch (error) {
    console.error('GET /api/places/suggest failed:', error?.message || error);
    res.status(503).json({ error: 'Place suggestions are unavailable.' });
  }
});

app.get('/api/places/facets', async (_req, res) => {
  try {
    res.json(await listPlaceFacets());
  } catch (error) {
    console.error('GET /api/places/facets failed:', error?.message || error);
    res.status(503).json({ error: 'Place filters are unavailable.' });
  }
});

// Geospatial read-only search. Do not store the caller's coordinates.
app.get('/api/places/nearby', async (req, res) => {
  try {
    const options = parseNearbyOptions(req.query);
    res.json(await listNearbyPlaces({
      lat: options.latitude,
      lng: options.longitude,
      radiusKm: options.radius,
      limit: options.count,
    }));
  } catch (error) {
    if (error instanceof RangeError) {
      return res.status(400).json({ error: 'Invalid nearby search parameters.' });
    }
    console.error('GET /api/places/nearby failed:', error?.message || error);
    res.status(503).json({ error: 'Nearby places database is unavailable.' });
  }
});

function serializePlaceDetail(place) {
  return {
      id: place.id,
      name: place.name,
      nameLocal: place.nameLocal,
      province: place.province,
      provinceEn: place.provinceEn,
      category: place.category,
      rating: place.rating,
      reviewCount: place.reviewCount,
      images: place.images,
      mediaCredits: place.mediaCredits,
      detailedDescription: place.detailedDescription,
      description: place.description,
      descriptionEn: place.descriptionEn,
      tags: place.tags,
      coordinates: place.coordinates,
      source: place.source,
  };
}

app.get('/api/places/:placeId', async (req, res) => {
  try {
    const place = await getPlaceById(req.params.placeId);
    if (!place) {
      return res.status(404).json({ error: 'Place not found.' });
    }

    res.json(serializePlaceDetail(place));
  } catch (error) {
    console.error('GET /api/places/:placeId failed:', error?.message || error);
    res.status(503).json({ error: 'Places database is unavailable.' });
  }
});

const sessions = new Map();

function detectLanguage(text) {
  return /[\u0E00-\u0E7F]/.test(text) ? 'th' : 'en';
}

function generateTravelResponse(message, language) {
  const general = language === 'th'
    ? 'ผมพร้อมช่วยแนะนำสถานที่ท่องเที่ยวในประเทศไทยครับ ลองบอกจังหวัด ประเภทสถานที่ หรืองบประมาณที่สนใจ'
    : 'I can help you explore Thailand. Tell me a province, place type, or budget you are interested in.';

  const lower = message.toLowerCase();
  if (lower.includes('เชียงใหม่') || lower.includes('chiang mai')) {
    return language === 'th'
      ? 'เชียงใหม่มีทั้งวัด ย่านเมืองเก่า อาหารเหนือ และธรรมชาติ โดยดอยอินทนนท์เหมาะสำหรับผู้ที่สนใจภูเขาและอากาศเย็น'
      : 'Chiang Mai combines temples, the old city, Northern Thai food, and mountain nature such as Doi Inthanon.';
  }

  if (lower.includes('ทะเล') || lower.includes('beach') || lower.includes('island')) {
    return language === 'th'
      ? 'ถ้าสนใจทะเล ลองดูหมู่เกาะพีพีในกระบี่ ซึ่งมีชายหาดและภูมิประเทศหินปูนเด่นชัด'
      : 'For beaches and islands, consider the Phi Phi Islands in Krabi, known for beaches and limestone scenery.';
  }

  return general;
}

app.post('/api/talk', createRateLimiter({ windowMs: 60_000, max: 30, keyPrefix: 'talk' }), (req, res) => {
  const validation = validateTalkPayload(req.body);
  if (!validation.ok) {
    return res.status(400).json({ error: 'Invalid request.', details: validation.errors });
  }

  const { message, session_id, language = 'auto' } = req.body;
  const sessionId = session_id || randomUUID();
  const detectedLanguage = language === 'auto' ? detectLanguage(message) : language;

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { id: sessionId, created_at: new Date().toISOString() });
  }

  res.json({
    response: generateTravelResponse(message, detectedLanguage),
    session_id: sessionId,
    language: detectedLanguage,
    confidence: 0.9,
    intent: 'travel_inquiry',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', async (_req, res) => {
  try {
    const databaseOk = await pingDatabase();
    res.json({
      status: databaseOk ? 'ok' : 'degraded',
      service: 'painaidee-railway-api',
      database: databaseOk ? 'ok' : 'unavailable',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      service: 'painaidee-railway-api',
      database: 'unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  if (error?.message === 'Origin is not allowed by CORS policy') {
    return res.status(403).json({ error: error.message });
  }

  console.error('Unhandled API error:', error?.message || error);
  return res.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  await ensureSchema();
  const server = app.listen(PORT, () => {
    console.log(`PaiNaiDee Railway API listening on port ${PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to initialize PaiNaiDee Railway API:', error);
    process.exit(1);
  });
}

module.exports = { app, start, serializePlaceDetail };
