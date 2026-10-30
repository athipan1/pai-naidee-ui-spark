// Read-only production checks. No user data, session, writes or orders.
const frontend = process.env.PRODUCTION_FRONTEND_URL || 'https://pai-naidee-ui-spark.vercel.app';
const api = process.env.PRODUCTION_API_URL || 'https://painaidee-api-production.up.railway.app';
const checkNearby = process.env.CHECK_NEARBY !== 'false';

async function get(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(12000) });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('json') ? await response.json() : await response.text();
  return { response, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function check(label, fn) {
  try {
    await fn();
    console.log(JSON.stringify({ status: 'pass', check: label, timestamp: new Date().toISOString() }));
  } catch (error) {
    console.error(JSON.stringify({ status: 'fail', check: label, error: error.message, timestamp: new Date().toISOString() }));
    process.exitCode = 1;
  }
}

let firstPlace;
await check('frontend-home', async () => {
  const { response, body } = await get(frontend + '/');
  assert(response.ok && typeof body === 'string' && body.includes('id="root"'), `frontend HTTP ${response.status} or no root`);
});
await check('public-placeholder-is-an-image-not-html', async () => {
  const { response, body } = await get(frontend + '/placeholder-attraction.svg');
  const contentType = response.headers.get('content-type') || '';
  assert(response.ok && contentType.includes('image/svg+xml') && typeof body === 'string' && body.includes('<svg'),
    `placeholder asset was not served as SVG: HTTP ${response.status}, ${contentType}`);
});
await check('railway-health-database', async () => {
  const { response, body } = await get(api + '/api/health');
  assert(response.ok && body.status === 'ok' && body.database === 'ok', `health: ${response.status} ${body.status}`);
});
await check('catalogue-real-coordinates', async () => {
  const { response, body } = await get(api + '/api/places?page=1&limit=50', { headers: { Origin: frontend } });
  assert(response.ok && Array.isArray(body.attractions) && body.attractions.length > 0, `places: ${response.status}`);
  assert(response.headers.get('access-control-allow-origin') === frontend, 'production CORS origin mismatch');
  firstPlace = body.attractions.find(p => p.id && Number.isFinite(p.coordinates?.lat) && Number.isFinite(p.coordinates?.lng) && p.coordinates.lat >= 5 && p.coordinates.lat <= 21 && p.coordinates.lng >= 97 && p.coordinates.lng <= 106);
  assert(firstPlace, 'no Thai attraction with valid coordinates');
});
if (firstPlace) {
  await check('place-details', async () => {
    const { response, body } = await get(`${api}/api/places/${encodeURIComponent(firstPlace.id)}`);
    assert(response.ok && body.id === firstPlace.id, `detail: ${response.status}`);
  });
  await check('catalogue-search', async () => {
    const searchTerm = firstPlace.nameLocal || firstPlace.name;
    const { response, body } = await get(`${api}/api/places?search=${encodeURIComponent(searchTerm)}&limit=50`);
    assert(response.ok && body.attractions.some(p => p.id === firstPlace.id), `search: ${response.status}`);
  });
  if (checkNearby) {
    await check('nearby-spatial-search', async () => {
      const { lat, lng } = firstPlace.coordinates;
      const { response, body } = await get(`${api}/api/places/nearby?lat=${lat}&lng=${lng}&radiusKm=5&limit=30`, { headers: { Origin: frontend } });
      assert(response.ok && Array.isArray(body.attractions), `nearby: ${response.status}`);
      assert(body.attractions.some(p => p.id === firstPlace.id && p.distanceKm <= 0.1), 'self-location not found near zero distance');
      const distances = body.attractions.map(p => p.distanceKm);
      assert(distances.every((n, i) => Number.isFinite(n) && (i === 0 || n >= distances[i - 1])), 'nearby not sorted by distance');
    });
    await check('nearby-invalid-input-rejected', async () => {
      const { response } = await get(api + '/api/places/nearby?lat=999&lng=100');
      assert(response.status === 400, `invalid nearby input accepted: ${response.status}`);
    });
  }
}
if (!process.exitCode) console.log('PaiNaiDee production smoke: all checks passed');
