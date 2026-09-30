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
    rating: 4.8,
    reviewCount: 2547,
    imageUrl: 'https://images.unsplash.com/photo-1587413511953-f189f6a01ef3?auto=format&fit=crop&w=1200&q=80',
    description: 'น้ำทะเลใสและหน้าผาหินปูนที่โดดเด่น เป็นหนึ่งในแหล่งท่องเที่ยวทางทะเลที่เป็นที่รู้จักของจังหวัดกระบี่',
    tags: ['Beach', 'Snorkeling', 'Island', 'Photography'],
    lat: 7.7367,
    lng: 98.7784,
  },
  {
    id: '2',
    name: 'Wat Phra Kaew',
    nameLocal: 'วัดพระแก้ว',
    province: 'กรุงเทพฯ',
    category: 'Culture',
    rating: 4.9,
    reviewCount: 5243,
    imageUrl: 'https://images.unsplash.com/photo-1578167635857-3c2713865774?auto=format&fit=crop&w=1200&q=80',
    description: 'วัดพระศรีรัตนศาสดารามภายในพระบรมมหาราชวัง เป็นที่ประดิษฐานพระแก้วมรกตและเป็นสถานที่สำคัญทางประวัติศาสตร์และวัฒนธรรมไทย',
    tags: ['Temple', 'Culture', 'Buddhism', 'History'],
    lat: 13.7515,
    lng: 100.4925,
  },
  {
    id: '3',
    name: 'Doi Inthanon',
    nameLocal: 'ดอยอินทนนท์',
    province: 'เชียงใหม่',
    category: 'Nature',
    rating: 4.7,
    reviewCount: 1876,
    imageUrl: 'https://images.unsplash.com/photo-1544467187-784a3534a696?auto=format&fit=crop&w=1200&q=80',
    description: 'ยอดเขาที่สูงที่สุดในประเทศไทย อยู่ในอุทยานแห่งชาติดอยอินทนนท์ จังหวัดเชียงใหม่ มีเส้นทางธรรมชาติ น้ำตก และอากาศเย็น',
    tags: ['Mountain', 'Nature', 'Hiking', 'Waterfalls'],
    lat: 18.5888,
    lng: 98.487,
  },
  {
    id: '4',
    name: 'Floating Market',
    nameLocal: 'ตลาดน้ำ',
    province: 'ราชบุรี',
    category: 'Food',
    rating: 4.5,
    reviewCount: 3156,
    imageUrl: 'https://images.unsplash.com/photo-1590118432058-f2744d6897db?auto=format&fit=crop&w=1200&q=80',
    description: 'ตลาดน้ำดำเนินสะดวก จังหวัดราชบุรี เป็นตลาดน้ำที่มีเรือจำหน่ายอาหาร ผลไม้ และสินค้าท้องถิ่นตามลำคลอง',
    tags: ['Food', 'Culture', 'Traditional', 'Market'],
    lat: 13.518,
    lng: 99.9594,
  },
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
  `);

  for (const place of SEED_PLACES) {
    await sql`
      INSERT INTO places (
        id, name, name_local, province, category, rating, review_count,
        image_url, description, tags, lat, lng
      ) VALUES (
        ${place.id}, ${place.name}, ${place.nameLocal}, ${place.province},
        ${place.category}, ${place.rating}, ${place.reviewCount},
        ${place.imageUrl}, ${place.description}, ${JSON.stringify(place.tags)}::jsonb,
        ${place.lat}, ${place.lng}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

function normalizePlace(row) {
  const media = Array.isArray(row.media) ? row.media : [];
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
    tags: Array.isArray(row.tags) ? row.tags : [],
    coordinates: {
      lat: Number(row.lat) || 0,
      lng: Number(row.lng) || 0,
    },
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
  pingDatabase,
};
