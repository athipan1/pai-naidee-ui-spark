// Read-only production smoke test. No credentials or mutations are used.
const base = (process.env.PAINAIDEE_API_URL || 'https://painaidee-api-production.up.railway.app').replace(/\/$/, '');

async function get(path) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
  return response.json();
}

const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  const first = await get('/api/places?page=1&limit=2');
  assert(Array.isArray(first.attractions), 'Missing attractions array');
  assert(Number.isInteger(first.total) && first.total > 0, 'No attractions in production');

  const pages = Math.ceil(first.total / 2);
  const all = [];
  for (let page = 1; page <= pages + 1; page++) {
    const result = page === 1 ? first : await get(`/api/places?page=${page}&limit=2`);
    assert(result.page === page, `Unexpected page at ${page}`);
    if (page <= pages) all.push(...result.attractions);
    else assert(result.attractions.length === 0, 'Out-of-range page should be empty');
  }
  assert(all.length === first.total, `Pagination mismatch: ${all.length}/${first.total}`);
  assert(new Set(all.map(place => place.id)).size === first.total, 'Duplicate place ids across pages');

  for (const place of all) {
    const detail = await get(`/api/places/${encodeURIComponent(place.id)}`);
    assert(detail.id === place.id && detail.name === place.name && detail.province === place.province,
      `Inconsistent detail for ${place.id}`);
  }

  const chiangMai = await get('/api/places?page=1&limit=20&search=' + encodeURIComponent('เชียงใหม่'));
  assert(chiangMai.attractions.some(place => place.province === 'เชียงใหม่'), 'Chiang Mai search not found');
  console.log(`PASS: ${all.length} unique places, ${pages} pages, details and Chiang Mai search`);
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}
