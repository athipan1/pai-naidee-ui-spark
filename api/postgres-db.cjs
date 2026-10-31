const postgres = require('postgres');
const ADDITIONAL_CURATED_PLACES = require('./additional-curated-places.cjs');
const ADDITIONAL_CURATED_PLACES_V2 = require('./additional-curated-places-v2.cjs');
const ADDITIONAL_CURATED_PLACES_V3 = require('./additional-curated-places-v3.cjs');
const ADDITIONAL_CURATED_PLACES_V4 = require('./additional-curated-places-v4.cjs');
const ADDITIONAL_CURATED_PLACES_V5 = require('./additional-curated-places-v5.cjs');
const { assertPlaceImportReady } = require('./place-quality.cjs');
const VERIFIED_WIKIMEDIA_MEDIA = require('./curated-wikimedia-media.json');
const VERIFIED_MISSING_MEDIA = require('./verified-missing-commons-media.json');
const USER_PROVIDED_MEDIA = require('./user-provided-place-media.json');
const { PROVINCE_EN, DESCRIPTION_EN } = require('./place-localizations.cjs');
const { buildPlaceSearch } = require('./place-search.cjs');
const { rankPlaces } = require('./smart-search.cjs');

let sqlClient = null;
let searchIndex = null;
let searchIndexExpires = 0;

async function getSearchIndex() {
  if (searchIndex && Date.now() < searchIndexExpires) return searchIndex;
  const sql = getSql();
  const places = await sql`SELECT id, name, name_local, province, province_en, category, description, description_en, tags, rating FROM places`;
  const aliases = await sql`SELECT place_id, alias_name FROM place_aliases WHERE status = 'approved'`;
  const byId = new Map();
  for (const alias of aliases) byId.set(alias.place_id, [...(byId.get(alias.place_id) || []), alias.alias_name]);
  for (const place of places) place.aliases = byId.get(place.id) || [];
  searchIndex = places;
  searchIndexExpires = Date.now() + 30_000;
  return places;
}

async function suggestPlaces(query, limit = 6) {
  if (typeof query !== 'string' || query.trim().length < 2) return [];
  const count = Math.min(8, Math.max(1, Number(limit) || 6));
  return rankPlaces(await getSearchIndex(), query).slice(0, count).map(place => ({
    id: place.id, name: place.name, nameLocal: place.name_local,
    province: place.province, category: place.category,
  }));
}

async function listPlaceFacets() {
  const places = await getSearchIndex();
  return {
    provinces: [...new Set(places.map(place => place.province).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'th')),
    categories: [...new Set(places.map(place => place.category).filter(Boolean))].sort(),
  };
}

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
  ...ADDITIONAL_CURATED_PLACES,
  ...ADDITIONAL_CURATED_PLACES_V2,
  ...ADDITIONAL_CURATED_PLACES_V3,
  ...ADDITIONAL_CURATED_PLACES_V4,
  ...ADDITIONAL_CURATED_PLACES_V5,
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
  // Fail closed before opening the DB or making any schema/seed writes.
  assertPlaceImportReady({
    places: SEED_PLACES, wikimediaMedia: VERIFIED_WIKIMEDIA_MEDIA,
    missingMedia: VERIFIED_MISSING_MEDIA, userMedia: USER_PROVIDED_MEDIA,
    requireFullCoverage: true,
  });
  const sql = getSql();

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_local TEXT,
      province TEXT NOT NULL,
      province_en TEXT,
      category TEXT NOT NULL,
      rating DOUBLE PRECISION NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      description TEXT NOT NULL DEFAULT '',
      description_en TEXT,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      source_name TEXT,
      source_url TEXT,
      verified_at TIMESTAMPTZ,
      detail_text TEXT,
      detail_source_url TEXT,
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
      creator_name TEXT,
      license_name TEXT,
      license_url TEXT,
      source_page TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS place_drafts (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      author_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      published_place_id TEXT REFERENCES places(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE place_drafts ADD COLUMN IF NOT EXISTS target_place_id TEXT REFERENCES places(id);
    ALTER TABLE place_drafts ADD COLUMN IF NOT EXISTS target_updated_at TIMESTAMPTZ;

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
      disabled BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS place_aliases (
      id TEXT PRIMARY KEY,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      alias_name TEXT NOT NULL,
      alias_key TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'th' CHECK (language IN ('th', 'en', 'other')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_by TEXT REFERENCES admin_users(id),
      reviewed_by TEXT REFERENCES admin_users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ,
      UNIQUE (place_id, alias_key)
    );
    CREATE INDEX IF NOT EXISTS idx_place_aliases_lookup ON place_aliases (alias_key, status);
    CREATE INDEX IF NOT EXISTS idx_place_aliases_place ON place_aliases (place_id);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions (expires_at);

    CREATE INDEX IF NOT EXISTS idx_places_category ON places (category);
    CREATE INDEX IF NOT EXISTS idx_places_province ON places (province);
    CREATE INDEX IF NOT EXISTS idx_places_name_lower ON places (LOWER(name));
    CREATE INDEX IF NOT EXISTS idx_media_place_id ON media (place_id);
    ALTER TABLE places ADD COLUMN IF NOT EXISTS source_name TEXT;
    ALTER TABLE places ADD COLUMN IF NOT EXISTS source_url TEXT;
    ALTER TABLE places ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
    ALTER TABLE places ADD COLUMN IF NOT EXISTS detail_text TEXT;
    ALTER TABLE places ADD COLUMN IF NOT EXISTS detail_source_url TEXT;
    ALTER TABLE places ADD COLUMN IF NOT EXISTS province_en TEXT;
    ALTER TABLE places ADD COLUMN IF NOT EXISTS description_en TEXT;
    ALTER TABLE media ADD COLUMN IF NOT EXISTS creator_name TEXT;
    ALTER TABLE media ADD COLUMN IF NOT EXISTS license_name TEXT;
    ALTER TABLE media ADD COLUMN IF NOT EXISTS license_url TEXT;
    ALTER TABLE media ADD COLUMN IF NOT EXISTS source_page TEXT;
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

  // Backfill bilingual fields for unchanged seed data without overwriting
  // translations or descriptions edited by a user. One set-based query keeps
  // startup migration inexpensive as the curated catalogue grows.
  const translations = SEED_PLACES.map(place => ({
    id: place.id,
    province_th: place.province,
    province_en: PROVINCE_EN[place.province],
    description_th: place.description,
    description_en: DESCRIPTION_EN[place.id],
  }));
  await sql`
    UPDATE places AS p
    SET
      province_en = CASE
        WHEN COALESCE(BTRIM(p.province_en), '') = ''
          AND p.province = loc.province_th THEN loc.province_en
        ELSE p.province_en END,
      description_en = CASE
        WHEN COALESCE(BTRIM(p.description_en), '') = ''
          AND p.description = loc.description_th THEN loc.description_en
        ELSE p.description_en END
    FROM jsonb_to_recordset(${sql.json(translations)})
      AS loc(id text, province_th text, province_en text,
             description_th text, description_en text)
    WHERE p.id = loc.id
      AND (COALESCE(BTRIM(p.province_en), '') = ''
        OR COALESCE(BTRIM(p.description_en), '') = '')
  `;

  for (const [id, demoRating, demoReviews, demoImageUrl] of LEGACY_DEMO_VALUES) {
    await sql`
      UPDATE places SET rating = 0, review_count = 0, image_url = NULL,
        updated_at = NOW()
      WHERE id = ${id} AND rating = ${demoRating}
        AND review_count = ${demoReviews} AND image_url = ${demoImageUrl}
    `;
  }

  // Licensed, carefully matched Wikimedia thumbnail metadata is stored in
  // PostgreSQL; the images themselves remain on Wikimedia's CDN. Use an
  // immutable namespaced ID to preserve any existing user-uploaded media.
  for (const photo of VERIFIED_WIKIMEDIA_MEDIA) {
    await sql`
      INSERT INTO media (
        id, place_id, url, type, title, description,
        creator_name, license_name, license_url, source_page
      ) VALUES (
        ${`wikimedia:${photo.placeId}`}, ${photo.placeId}, ${photo.url},
        'image', ${photo.placeName}, 'Photograph sourced from Wikimedia Commons',
        ${photo.photographer}, ${photo.licenseName}, ${photo.licenseUrl}, ${photo.sourcePage}
      ) ON CONFLICT (id) DO NOTHING
    `;
    if (photo.detailText) {
      await sql`
        UPDATE places SET detail_text = ${photo.detailText},
          detail_source_url = ${photo.detailSourceUrl}
        WHERE id = ${photo.placeId}
          AND (detail_text IS NULL OR detail_text = '')
      `;
    }
  }


  // Backfill verified, licensed photographs for destinations that previously
  // had no media. A later editor upload or earlier verification always wins.
  for (const photo of VERIFIED_MISSING_MEDIA) {
    await sql`
      INSERT INTO media (
        id, place_id, url, type, title, description,
        creator_name, license_name, license_url, source_page
      ) SELECT
        ${`wikimedia:${photo.placeId}`}, p.id, ${photo.url},
        'image', p.name, 'Photograph sourced from Wikimedia Commons',
        ${photo.photographer}, ${photo.licenseName}, ${photo.licenseUrl}, ${photo.sourcePage}
      FROM places p WHERE p.id = ${photo.placeId}
      ON CONFLICT (id) DO NOTHING
    `;
  }

  // User-supplied photos are stored as static assets on the SINGLE production
  // Vercel site. They do not carry a claimed Commons or Creative Commons
  // license. Add them in gallery order only if no other photo has been entered
  // for the place; preserve editor-created media and keep deploys idempotent.
  for (const photo of USER_PROVIDED_MEDIA) {
    await sql`
      INSERT INTO media (id, place_id, url, type, title, description)
      SELECT ${photo.id}, p.id, ${photo.url}, 'image', ${photo.title},
        'Image supplied by a PaiNaiDee user for this destination'
      FROM places p
      WHERE p.id = ${photo.placeId}
        AND NOT EXISTS (
          SELECT 1 FROM media existing
          WHERE existing.place_id = p.id
            AND existing.id NOT LIKE ${`painaidee-provided:${photo.placeId}:%`}
        )
      ON CONFLICT (id) DO NOTHING
    `;
  }

  // The initial Ko Chang / Ko Kut import accidentally used a photograph of
  // Mu Ko Ang Thong for both locations. Repair ONLY the two original seeded
  // media rows while they still contain that exact incorrect URL; never touch
  // another media record or a photo subsequently updated by an editor.
  const staleAngThongUrl = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Mu_Ko_Ang_Thong%2C_Islands_in_the_sea_2%2C_Thailand.jpg/960px-Mu_Ko_Ang_Thong%2C_Islands_in_the_sea_2%2C_Thailand.jpg';
  for (const placeId of ['curated-ko-chang', 'curated-ko-kut']) {
    const verified = VERIFIED_WIKIMEDIA_MEDIA.find((photo) => photo.placeId === placeId);
    if (!verified) continue;
    await sql`
      UPDATE media SET url = ${verified.url}, title = ${verified.placeName},
        creator_name = ${verified.photographer}, license_name = ${verified.licenseName},
        license_url = ${verified.licenseUrl}, source_page = ${verified.sourcePage}
      WHERE id = ${`wikimedia:${placeId}`} AND place_id = ${placeId}
        AND url = ${staleAngThongUrl}
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
    provinceEn: row.province_en || null,
    category: row.category,
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    image: media[0]?.url || row.image_url || null,
    images: media.length > 0
      ? media.map((item) => item.url)
      : row.image_url
        ? [row.image_url]
        : [],
    mediaCredits: media.filter((item) =>
      (item.sourcePage && item.licenseUrl) || item.id?.startsWith('painaidee-provided:')
    ).map((item) => ({
      url: item.url,
      photographer: item.id?.startsWith('painaidee-provided:')
        ? 'PaiNaiDee user' : (item.creatorName || 'Wikimedia Commons contributor'),
      licenseName: item.licenseName || 'User-provided photo for PaiNaiDee',
      licenseUrl: item.licenseUrl || '',
      sourcePage: item.sourcePage || '',
      kind: item.id?.startsWith('painaidee-provided:') ? 'user-provided' : 'commons',
    })),
    detailedDescription: row.detail_text ? {
      text: row.detail_text,
      sourceUrl: row.detail_source_url || null,
    } : null,
    description: row.description || '',
    descriptionEn: row.description_en || null,
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
        'title', m.title, 'description', m.description,
        'creatorName', m.creator_name, 'licenseName', m.license_name,
        'licenseUrl', m.license_url, 'sourcePage', m.source_page
      ) ORDER BY (m.id LIKE 'wikimedia:%') ASC, m.created_at ASC), '[]'::json)
      FROM media m WHERE m.place_id = ranked.id) AS media
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

async function listPlaces({ page = 1, limit = 10, category = '', province = '', search = '' } = {}) {
  const sql = getSql();
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));
  const offset = (safePage - 1) * safeLimit;
  if (typeof search === 'string' && search.trim()) {
    const matches = rankPlaces(await getSearchIndex(), search, String(category || ''), String(province || ''));
    const ids = matches.slice(offset, offset + safeLimit).map(place => place.id);
    if (!ids.length) return { attractions: [], total: matches.length, page: safePage, limit: safeLimit };
    const rows = await sql`
      SELECT p.*, COALESCE(json_agg(json_build_object(
        'id', m.id, 'url', m.url, 'type', m.type, 'title', m.title,
        'description', m.description, 'creatorName', m.creator_name,
        'licenseName', m.license_name, 'licenseUrl', m.license_url,
        'sourcePage', m.source_page
      ) ORDER BY (m.id LIKE 'wikimedia:%') ASC, m.created_at ASC)
      FILTER (WHERE m.id IS NOT NULL), '[]'::json) AS media
      FROM places p LEFT JOIN media m ON m.place_id = p.id
      WHERE p.id IN ${sql(ids)} GROUP BY p.id
    `;
    const byId = new Map(rows.map(place => [place.id, normalizePlace(place)]));
    return { attractions: ids.map(id => byId.get(id)).filter(Boolean), total: matches.length, page: safePage, limit: safeLimit };
  }
  const categoryValue = category?.trim() || null;
  const provinceValue = province?.trim() || null;
  const { searchValue, searchPattern, flexibleNamePattern, aliasPlaceId } = buildPlaceSearch(search);

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
            'description', m.description,
            'creatorName', m.creator_name, 'licenseName', m.license_name,
            'licenseUrl', m.license_url, 'sourcePage', m.source_page
          ) ORDER BY (m.id LIKE 'wikimedia:%') ASC, m.created_at ASC
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'::json
      ) AS media
    FROM places p
    LEFT JOIN media m ON m.place_id = p.id
    WHERE
      (${categoryValue}::text IS NULL OR LOWER(p.category) = LOWER(${categoryValue}))
      AND (${provinceValue}::text IS NULL OR LOWER(p.province) = LOWER(${provinceValue}) OR LOWER(p.province_en) = LOWER(${provinceValue}))
      AND (
        ${searchValue}::text IS NULL OR
        p.id = ${aliasPlaceId} OR
        p.name ILIKE ${searchPattern} OR
        p.name_local ILIKE ${searchPattern} OR
        p.name ILIKE ${flexibleNamePattern} OR
        p.name_local ILIKE ${flexibleNamePattern} OR
        p.description ILIKE ${searchPattern} OR
        p.description_en ILIKE ${searchPattern} OR
        p.province ILIKE ${searchPattern} OR
        p.province_en ILIKE ${searchPattern}
      )
    GROUP BY p.id
    ORDER BY p.rating DESC, p.name ASC, p.id ASC
    LIMIT ${safeLimit}
    OFFSET ${offset}
  `;

  const countRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM places p
    WHERE
      (${categoryValue}::text IS NULL OR LOWER(p.category) = LOWER(${categoryValue}))
      AND (${provinceValue}::text IS NULL OR LOWER(p.province) = LOWER(${provinceValue}) OR LOWER(p.province_en) = LOWER(${provinceValue}))
      AND (
        ${searchValue}::text IS NULL OR
        p.id = ${aliasPlaceId} OR
        p.name ILIKE ${searchPattern} OR
        p.name_local ILIKE ${searchPattern} OR
        p.name ILIKE ${flexibleNamePattern} OR
        p.name_local ILIKE ${flexibleNamePattern} OR
        p.description ILIKE ${searchPattern} OR
        p.description_en ILIKE ${searchPattern} OR
        p.province ILIKE ${searchPattern} OR
        p.province_en ILIKE ${searchPattern}
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
            'description', m.description,
            'creatorName', m.creator_name, 'licenseName', m.license_name,
            'licenseUrl', m.license_url, 'sourcePage', m.source_page
          ) ORDER BY (m.id LIKE 'wikimedia:%') ASC, m.created_at ASC
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
  searchIndex = null;
  searchIndexExpires = 0;
  if (sqlClient) {
    await sqlClient.end({ timeout: 5 });
    sqlClient = null;
  }
}

module.exports = {
  getSql,
  invalidateSearchIndex: () => { searchIndex = null; searchIndexExpires = 0; },
  closeDatabase,
  ensureSchema,
  getPlaceById,
  listPlaces,
  listPlaceFacets,
  suggestPlaces,
  listNearbyPlaces,
  parseNearbyOptions,
  normalizePlace,
  SEED_PLACES,
  pingDatabase,
};
