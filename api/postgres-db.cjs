const postgres = require('postgres');

let sqlClient = null;

function getSql() {
  if (sqlClient) return sqlClient;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  sqlClient = postgres(databaseUrl, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  return sqlClient;
}

const SEED_PLACES = [
  {
    id: '1',
    name: 'Phi Phi Islands',
    nameLocal: 'หมู่เกาะพีพี',
    province: 'กระบี่',
    category: 'Beach',
    rating: 0,
    reviewCount: 0,
    imageUrl: null,
    description: 'น้ำทะเลใสและหน้าผาหินปูนที่โดดเด่น เป็นหนึ่งในแหล่งท่องเที่ยวทางทะเลที่เป็นที่รู้จักของจังหวัดกระบี่',
    tags: ['Beach', 'Snorkeling', 'Island', 'Photography'],
    lat: 7.7367,
    lng: 98.7784,
    sourceName: 'Wikipedia: Phi Phi Islands',
    sourceUrl: 'https://en.wikipedia.org/wiki/Phi_Phi_Islands',
  },
  {
    id: '2',
    name: 'Wat Phra Kaew',
    nameLocal: 'วัดพระแก้ว',
    province: 'กรุงเทพฯ',
    category: 'Culture',
    rating: 0,
    reviewCount: 0,
    imageUrl: null,
    description: 'วัดพระศรีรัตนศาสดารามภายในพระบรมมหาราชวัง เป็นที่ประดิษฐานพระแก้วมรกตและเป็นสถานที่สำคัญทางประวัติศาสตร์และวัฒนธรรมไทย',
    tags: ['Temple', 'Culture', 'Buddhism', 'History'],
    lat: 13.7515,
    lng: 100.4925,
    sourceName: 'Wikipedia: Wat Phra Kaew',
    sourceUrl: 'https://en.wikipedia.org/wiki/Wat_Phra_Kaew',
  },
  {
    id: '3',
    name: 'Doi Inthanon',
    nameLocal: 'ดอยอินทนนท์',
    province: 'เชียงใหม่',
    category: 'Nature',
    rating: 0,
    reviewCount: 0,
    imageUrl: null,
    description: 'ยอดเขาที่สูงที่สุดในประเทศไทย อยู่ในอุทยานแห่งชาติดอยอินทนนท์ จังหวัดเชียงใหม่ มีเส้นทางธรรมชาติ น้ำตก และอากาศเย็น',
    tags: ['Mountain', 'Nature', 'Hiking', 'Waterfalls'],
    lat: 18.5888,
    lng: 98.487,
    sourceName: 'Wikipedia: Doi Inthanon',
    sourceUrl: 'https://en.wikipedia.org/wiki/Doi_Inthanon',
  },
  {
    id: '4',
    name: 'Floating Market',
    nameLocal: 'ตลาดน้ำ',
    province: 'ราชบุรี',
    category: 'Food',
    rating: 0,
    reviewCount: 0,
    imageUrl: null,
    description: 'ตลาดน้ำดำเนินสะดวก จังหวัดราชบุรี เป็นตลาดน้ำที่มีเรือจำหน่ายอาหาร ผลไม้ และสินค้าท้องถิ่นตามลำคลอง',
    tags: ['Food', 'Culture', 'Traditional', 'Market'],
    lat: 13.518,
    lng: 99.9594,
    sourceName: 'OpenStreetMap: Damnoen Saduak Floating Market',
    sourceUrl: 'https://www.openstreetmap.org/way/603657447',
  },
  // Curated real places. Keep provenance and never manufacture ratings.
  {
    id: 'curated-wat-arun', name: 'Wat Arun', nameLocal: 'วัดอรุณราชวราราม',
    province: 'กรุงเทพฯ', category: 'Culture', rating: 0, reviewCount: 0,
    imageUrl: null, description: 'วัดริมแม่น้ำเจ้าพระยาที่มีพระปรางค์เป็นสัญลักษณ์สำคัญของกรุงเทพมหานคร',
    tags: ['Temple', 'History'], lat: 13.74361, lng: 100.48889,
    sourceName: 'Wikipedia: Wat Arun', sourceUrl: 'https://en.wikipedia.org/wiki/Wat_Arun',
  },
  {
    id: 'curated-wat-pho', name: 'Wat Pho', nameLocal: 'วัดพระเชตุพนวิมลมังคลาราม',
    province: 'กรุงเทพฯ', category: 'Culture', rating: 0, reviewCount: 0,
    imageUrl: null, description: 'วัดเก่าแก่ในเขตพระนคร เป็นที่ประดิษฐานพระพุทธไสยาสน์',
    tags: ['Temple', 'History'], lat: 13.74639, lng: 100.49361,
    sourceName: 'Wikipedia: Wat Pho', sourceUrl: 'https://en.wikipedia.org/wiki/Wat_Pho',
  },
  {
    id: 'curated-wat-rong-khun', name: 'Wat Rong Khun', nameLocal: 'วัดร่องขุ่น',
    province: 'เชียงราย', category: 'Culture', rating: 0, reviewCount: 0,
    imageUrl: null, description: 'ผลงานศิลปกรรมร่วมสมัยสีขาวในจังหวัดเชียงราย',
    tags: ['Temple', 'Art'], lat: 19.824126, lng: 99.763289,
    sourceName: 'Wikimedia Commons: object location',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chiang_Rai_Thailand_Wat-Rong-Khun-01.jpg',
  },
  {
    id: 'curated-sanctuary-of-truth', name: 'Sanctuary of Truth', nameLocal: 'ปราสาทสัจธรรม',
    province: 'ชลบุรี', category: 'Culture', rating: 0, reviewCount: 0,
    imageUrl: null, description: 'พิพิธภัณฑ์และอาคารไม้แกะสลักบริเวณนาเกลือ เมืองพัทยา',
    tags: ['Museum', 'Architecture'], lat: 12.97278, lng: 100.88889,
    sourceName: 'Wikipedia: Sanctuary of Truth',
    sourceUrl: 'https://en.wikipedia.org/wiki/Sanctuary_of_Truth',
  },
  {
    id: 'curated-sukhothai-historical-park', name: 'Sukhothai Historical Park',
    nameLocal: 'อุทยานประวัติศาสตร์สุโขทัย', province: 'สุโขทัย', category: 'Culture',
    rating: 0, reviewCount: 0, imageUrl: null,
    description: 'โบราณสถานของเมืองสุโขทัยซึ่งเป็นส่วนหนึ่งของแหล่งมรดกโลก',
    tags: ['History', 'UNESCO'], lat: 17.02111, lng: 99.70361,
    sourceName: 'Wikipedia: Sukhothai Historical Park',
    sourceUrl: 'https://en.wikipedia.org/wiki/Sukhothai_Historical_Park',
  },
  {
    id: 'curated-erawan-falls', name: 'Erawan Falls', nameLocal: 'น้ำตกเอราวัณ',
    province: 'กาญจนบุรี', category: 'Nature', rating: 0, reviewCount: 0,
    imageUrl: null, description: 'น้ำตกหลายชั้นในอุทยานแห่งชาติเอราวัณ จังหวัดกาญจนบุรี',
    tags: ['Waterfall', 'National Park'], lat: 14.36889, lng: 99.14472,
    sourceName: 'Wikipedia: Cascade d’Erawan',
    sourceUrl: 'https://fr.wikipedia.org/wiki/Cascade_d%27Erawan',
  },
  {
    id: 'curated-phuket-big-buddha', name: 'Phuket Big Buddha',
    nameLocal: 'พระพุทธมิ่งมงคลเอกนาคคีรี', province: 'ภูเก็ต', category: 'Culture',
    rating: 0, reviewCount: 0, imageUrl: null,
    description: 'พระพุทธรูปขนาดใหญ่บนยอดเขานาคเกิด จังหวัดภูเก็ต โปรดตรวจสอบสถานะการเปิดเข้าชมก่อนเดินทาง',
    tags: ['Landmark', 'Viewpoint'], lat: 7.827598, lng: 98.312853,
    sourceName: 'Wikipedia: Phuket Big Buddha',
    sourceUrl: 'https://en.wikipedia.org/wiki/Phuket_Big_Buddha',
  },
];

// Only remove the original demo ratings/images if their exact unchanged seed
// values are still present. Never overwrite user-edited database records.
const LEGACY_DEMO_VALUES = [
  ['1', 4.8, 2547, 'https://images.unsplash.com/photo-1587413511953-f189f6a01ef3?auto=format&fit=crop&w=1200&q=80'],
  ['2', 4.9, 5243, 'https://images.unsplash.com/photo-1578167635857-3c2713865774?auto=format&fit=crop&w=1200&q=80'],
  ['3', 4.7, 1876, 'https://images.unsplash.com/photo-1544467187-784a3534a696?auto=format&fit=crop&w=1200&q=80'],
  ['4', 4.5, 3156, 'https://images.unsplash.com/photo-1590118432058-f2744d6897db?auto=format&fit=crop&w=1200&q=80'],
];

async function ensureSchema() {
  const sql = getSql();

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_local TEXT,
      province TEXT NOT NULL,
      category TEXT NOT NULL,
      rating DOUBLE PRECISION NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      description TEXT NOT NULL DEFAULT '',
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      source_name TEXT,
      source_url TEXT,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'image',
      title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_places_category ON places (category);
    CREATE INDEX IF NOT EXISTS idx_places_province ON places (province);
    CREATE INDEX IF NOT EXISTS idx_places_name_lower ON places (LOWER(name));
    CREATE INDEX IF NOT EXISTS idx_media_place_id ON media (place_id);
    ALTER TABLE places ADD COLUMN IF NOT EXISTS source_name TEXT;
    ALTER TABLE places ADD COLUMN IF NOT EXISTS source_url TEXT;
    ALTER TABLE places ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
    CREATE INDEX IF NOT EXISTS idx_places_coordinates ON places (lat, lng);
  `);

  for (const place of SEED_PLACES) {
    await sql`
      INSERT INTO places (
        id, name, name_local, province, category, rating, review_count,
        image_url, description, tags, lat, lng, source_name, source_url, verified_at
      ) VALUES (
        ${place.id}, ${place.name}, ${place.nameLocal}, ${place.province},
        ${place.category}, ${place.rating}, ${place.reviewCount},
        ${place.imageUrl}, ${place.description}, ${JSON.stringify(place.tags)}::jsonb,
        ${place.lat}, ${place.lng}, ${place.sourceName || null}, ${place.sourceUrl || null},
        ${place.sourceUrl ? '2026-10-25T00:00:00.000Z' : null}::timestamptz
      )
      ON CONFLICT (id) DO NOTHING
    `;
    // Backfill provenance for unchanged locations from the original release.
    if (!place.id.startsWith('curated-')) {
      await sql`
        UPDATE places SET source_name = ${place.sourceName},
          source_url = ${place.sourceUrl},
          verified_at = '2026-10-25T00:00:00.000Z'::timestamptz
        WHERE id = ${place.id} AND source_url IS NULL
          AND lat = ${place.lat} AND lng = ${place.lng}
      `;
    }
  }

  for (const [id, demoRating, demoReviews, demoImageUrl] of LEGACY_DEMO_VALUES) {
    await sql`
      UPDATE places SET rating = 0, review_count = 0, image_url = NULL,
        updated_at = NOW()
      WHERE id = ${id} AND rating = ${demoRating}
        AND review_count = ${demoReviews} AND image_url = ${demoImageUrl}
    `;
  }
}

function normalizeJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizePlace(row) {
  const media = normalizeJsonArray(row.media);
  return {
    id: row.id,
    name: row.name,
    nameLocal: row.name_local || row.name,
    province: row.province,
    category: row.category,
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    image: media[0]?.url || row.image_url || null,
    images: media.length > 0
      ? media.map((item) => item.url)
      : row.image_url
        ? [row.image_url]
        : [],
    description: row.description || '',
    tags: normalizeJsonArray(row.tags),
    source: row.source_url ? {
      name: row.source_name || 'Source',
      url: row.source_url,
      verifiedAt: row.verified_at || null,
    } : null,
    coordinates: {
      lat: Number(row.lat) || 0,
      lng: Number(row.lng) || 0,
    },
  };
}

function parseNearbyOptions({ lat, lng, radiusKm = 25, limit = 30 } = {}) {
  const latitude = lat == null || String(lat).trim() === '' ? NaN : Number(lat);
  const longitude = lng == null || String(lng).trim() === '' ? NaN : Number(lng);
  const radius = Number(radiusKm);
  const count = Number(limit);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
      !Number.isFinite(radius) || radius < 1 || radius > 100 ||
      !Number.isInteger(count) || count < 1 || count > 50) {
    throw new RangeError('Invalid nearby coordinates, radiusKm, or limit');
  }
  return { latitude, longitude, radius, count };
}

async function listNearbyPlaces(options) {
  const { latitude, longitude, radius, count } = parseNearbyOptions(options);
  const sql = getSql();
  const rows = await sql`
    WITH ranked AS (
      SELECT p.*,
        6371 * 2 * ASIN(LEAST(1.0, SQRT(
          POWER(SIN(RADIANS(p.lat - ${latitude}) / 2), 2) +
          COS(RADIANS(${latitude})) * COS(RADIANS(p.lat)) *
          POWER(SIN(RADIANS(p.lng - ${longitude}) / 2), 2)
        ))) AS distance_km
      FROM places p
      WHERE p.lat BETWEEN -90 AND 90 AND p.lng BETWEEN -180 AND 180
    )
    SELECT ranked.*,
      (SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
        'id', m.id, 'url', m.url, 'type', m.type,
        'title', m.title, 'description', m.description
      )), '[]'::json) FROM media m WHERE m.place_id = ranked.id) AS media
    FROM ranked
    WHERE distance_km <= ${radius}
    ORDER BY distance_km ASC, name ASC
    LIMIT ${count}
  `;
  return {
    attractions: rows.map(row => ({ ...normalizePlace(row), distanceKm: Number(row.distance_km) })),
    center: { lat: latitude, lng: longitude }, radiusKm: radius,
  };
}

async function listPlaces({ page = 1, limit = 10, category = '', search = '' } = {}) {
  const sql = getSql();
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  const offset = (safePage - 1) * safeLimit;
  const categoryValue = category?.trim() || null;
  const searchValue = search?.trim() || null;
  const searchPattern = searchValue ? `%${searchValue}%` : null;

  const rows = await sql`
    SELECT
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.id,
            'url', m.url,
            'type', m.type,
            'title', m.title,
            'description', m.description
          )
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'::json
      ) AS media
    FROM places p
    LEFT JOIN media m ON m.place_id = p.id
    WHERE
      (${categoryValue}::text IS NULL OR LOWER(p.category) = LOWER(${categoryValue}))
      AND (
        ${searchValue}::text IS NULL OR
        p.name ILIKE ${searchPattern} OR
        p.name_local ILIKE ${searchPattern} OR
        p.description ILIKE ${searchPattern} OR
        p.province ILIKE ${searchPattern}
      )
    GROUP BY p.id
    ORDER BY p.rating DESC, p.name ASC
    LIMIT ${safeLimit}
    OFFSET ${offset}
  `;

  const countRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM places p
    WHERE
      (${categoryValue}::text IS NULL OR LOWER(p.category) = LOWER(${categoryValue}))
      AND (
        ${searchValue}::text IS NULL OR
        p.name ILIKE ${searchPattern} OR
        p.name_local ILIKE ${searchPattern} OR
        p.description ILIKE ${searchPattern} OR
        p.province ILIKE ${searchPattern}
      )
  `;

  return {
    attractions: rows.map(normalizePlace),
    total: Number(countRows[0]?.count) || 0,
    page: safePage,
    limit: safeLimit,
  };
}

async function getPlaceById(id) {
  const sql = getSql();
  const rows = await sql`
    SELECT
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.id,
            'url', m.url,
            'type', m.type,
            'title', m.title,
            'description', m.description
          )
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'::json
      ) AS media
    FROM places p
    LEFT JOIN media m ON m.place_id = p.id
    WHERE p.id = ${id}
    GROUP BY p.id
    LIMIT 1
  `;

  return rows[0] ? normalizePlace(rows[0]) : null;
}

async function pingDatabase() {
  const sql = getSql();
  const rows = await sql`SELECT 1 AS ok`;
  return rows[0]?.ok === 1;
}

async function closeDatabase() {
  if (sqlClient) {
    await sqlClient.end({ timeout: 5 });
    sqlClient = null;
  }
}

module.exports = {
  closeDatabase,
  ensureSchema,
  getPlaceById,
  listPlaces,
  listNearbyPlaces,
  parseNearbyOptions,
  SEED_PLACES,
  pingDatabase,
};
