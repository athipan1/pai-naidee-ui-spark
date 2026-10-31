const THAILAND_BOUNDS = { south: 5, north: 21, west: 97, east: 106 };

// Verified alternate names of the same landmark, not nearby places or districts.
const PLACE_ALIASES = [
  ['เขื่อนเชี่ยวหลาน', 'เขื่อนรัชชประภา', 'ทะเลสาบเชี่ยวหลาน', 'cheow lan lake', 'cheow lan dam', 'ratchaprapha dam', 'rajjaprabha dam'],
];

const normalized = text => String(text || '').normalize('NFKC').toLocaleLowerCase()
  .replace(/[\s\p{P}\p{S}]+/gu, '');

function matchesPlaceName(query, names) {
  const requested = normalized(query);
  if (requested.length < 2) return false;
  const aliases = PLACE_ALIASES.find(group => group.some(name => normalized(name) === requested));
  return names.some(value => {
    const candidate = normalized(value);
    if (!candidate) return false;
    // Do not match short, generic name fragments to unrelated localities.
    if (candidate === requested || (requested.length >= 5 && candidate.includes(requested))) return true;
    return Boolean(aliases && aliases.some(alias => normalized(alias) === candidate));
  });
}

function isThailandCoordinate(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= THAILAND_BOUNDS.south && lat <= THAILAND_BOUNDS.north &&
    lng >= THAILAND_BOUNDS.west && lng <= THAILAND_BOUNDS.east;
}

async function geocodeCandidates({ name, province, listPlaces, apiKey, request = fetch }) {
  const query = String(name || '').trim().slice(0, 120);
  const area = String(province || '').trim().slice(0, 100);
  if (query.length < 2) return { error: 'กรุณากรอกชื่อสถานที่อย่างน้อย 2 ตัวอักษร', candidates: [] };

  const matches = await listPlaces({ search: query, province: area, limit: 10 });
  const candidates = (matches.attractions || [])
    .filter(place => !area || String(place.province || '').trim().toLocaleLowerCase() === area.toLocaleLowerCase())
    .filter(place => matchesPlaceName(query, [place.nameLocal, place.name]))
    .map(place => ({ lat: Number(place.coordinates?.lat), lng: Number(place.coordinates?.lng),
      label: `${place.nameLocal || place.name} · ${place.province}`, source: 'PaiNaiDee' }))
    .filter(place => isThailandCoordinate(place.lat, place.lng)).slice(0, 5);

  // External geocoding is opt-in, paid-provider based, and server-side only.
  // Never call the public Nominatim service from the CMS.
  if (apiKey) {
    const params = new URLSearchParams({ text: [query, area, 'Thailand'].filter(Boolean).join(', '), filter: 'countrycode:th',
      lang: 'th', format: 'json', limit: '5', apiKey });
    try {
      const response = await request(`https://api.geoapify.com/v1/geocode/search?${params}`, {
        signal: AbortSignal.timeout(7000), headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        for (const item of data.results || []) {
          const lat = Number(item.lat);
          const lng = Number(item.lon);
          if (!isThailandCoordinate(lat, lng) || item.country_code?.toLowerCase() !== 'th') continue;
          // Geoapify may return a city centroid when it cannot resolve the landmark.
          // Such results must never be presented as a usable coordinate.
          if (!matchesPlaceName(query, [item.name, item.address_line1, item.formatted])) continue;
          if (candidates.some(existing => Math.abs(existing.lat - lat) < 0.00005 && Math.abs(existing.lng - lng) < 0.00005)) continue;
          candidates.push({ lat, lng, label: String(item.formatted || query).slice(0, 250), source: 'Geoapify' });
        }
      }
    } catch (_) {
      // Database matches remain usable if the optional provider is unavailable.
    }
  }
  return { candidates: candidates.slice(0, 10), providerConfigured: Boolean(apiKey) };
}

module.exports = { geocodeCandidates, isThailandCoordinate, matchesPlaceName };
