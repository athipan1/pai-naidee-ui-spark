require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const {
  buildCorsOptions,
  createRateLimiter,
  validateTalkPayload,
} = require('./security.cjs');
const {
  ensureSchema,
  getPlaceById,
  listPlaces,
  pingDatabase,
  closeDatabase,
} = require('./postgres-db.cjs');

const app = express();
const PORT = process.env.PORT || 8000;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: '256kb' }));
app.use('/api', createRateLimiter({ windowMs: 60_000, max: 180 }));

app.get('/api/places', async (req, res) => {
  try {
    const result = await listPlaces({
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      search: req.query.search,
    });
    res.json(result);
  } catch (error) {
    console.error('GET /api/places failed:', error?.message || error);
    res.status(503).json({ error: 'Places database is unavailable.' });
  }
});

app.get('/api/places/:placeId', async (req, res) => {
  try {
    const place = await getPlaceById(req.params.placeId);
    if (!place) {
      return res.status(404).json({ error: 'Place not found.' });
    }

    res.json({
      id: place.id,
      name: place.name,
      nameLocal: place.nameLocal,
      province: place.province,
      category: place.category,
      rating: place.rating,
      reviewCount: place.reviewCount,
      images: place.images,
      description: place.description,
      tags: place.tags,
      coordinates: place.coordinates,
    });
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
  const sessionId = session_id || uuidv4();
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
  } catch (error) {
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

module.exports = { app, start };
