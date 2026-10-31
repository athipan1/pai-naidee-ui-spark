const THAILAND_BOUNDS = { south: 5, north: 21, west: 97, east: 106 };

// Verified alternate names of the same landmark, not nearby places or districts.
const PLACE_ALIASES = [
  ['เขื่อนเชี่ยวหลาน', 'เขื่อนรัชชประภา', 'ทะเลสาบเชี่ยวหลาน', 'cheow lan lake', 'cheow lan dam', 'ratchaprapha dam', 'rajjaprabha dam'],
];

const normalized = text => String(text || '').normalize('NFKC').toLocaleLowerCase()
  .replace(/[\s\p{P}\p{S}]+/gu, '');

function searchNames(query) {
  const group = PLACE_ALIASES.find(names => names.some(name => normalized(name) === normalized(query)));
  if (!group) return [query];
  // Bounded fallback requests: requested name, Thai canonical alternate, English alternate.
  const alternateThai = group.find(name => /[ก-๙]/u.test(name) && normalized(name) !== normalized(query));
  const alternateEnglish = group.find(name => normalized(name) === 'ratchapraphadam' && normalized(name) !== normalized(query)) ||
    group.find(name => /[a-z]/i.test(name) && normalized(name) !== normalized(query));
  const preferred = [query, alternateThai, alternateEnglish].filter(Boolean);
  return [...new Map(preferred.map(name => [normalized(name), name])).values()].slice(0, 3);
}

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

  const names = searchNames(query);
  const candidates = [];
  const addCandidate = candidate => {
    if (!isThailandCoordinate(candidate.lat, candidate.lng) ||
        candidates.some(existing => Math.abs(existing.lat - candidate.lat) < 0.00005 && Math.abs(existing.lng - candidate.lng) < 0.00005)) return;
    candidates.push(candidate);
  };
  for (const lookupName of names) {
    const matches = await listPlaces({ search: lookupName, province: area, limit: 10 });
    for (const place of matches.attractions || []) {
      if (area && String(place.province || '').trim().toLocaleLowerCase() !== area.toLocaleLowerCase()) continue;
      if (!matchesPlaceName(query, [place.nameLocal, place.name])) continue;
      addCandidate({ lat: Number(place.coordinates?.lat), lng: Number(place.coordinates?.lng),
        label: `${place.nameLocal || place.name} · ${place.province}`, source: 'PaiNaiDee' });
    }
    if (candidates.length >= 5) break;
  }

  // External geocoding is opt-in, paid-provider based, and server-side only.
  // Never call the public Nominatim service from the CMS.
  if (apiKey) {
    // Try aliases only when the primary spelling did not yield a verified result.
    for (const lookupName of names) {
      const params = new URLSearchParams({ text: [lookupName, area, 'Thailand'].filter(Boolean).join(', '), filter: 'countrycode:th',
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
            // A municipal centroid is not a match for a landmark, even in the correct province.
            if (!matchesPlaceName(query, [item.name, item.address_line1, item.formatted])) continue;
            addCandidate({ lat, lng, label: String(item.formatted || item.name || lookupName).slice(0, 250), source: 'Geoapify' });
          }
        }
      } catch (_) {
        // Verified database candidates are still usable during provider outages.
      }
      if (candidates.length) break;
    }
  }
  return { candidates: candidates.slice(0, 10), providerConfigured: Boolean(apiKey) };
}

module.exports = { geocodeCandidates, isThailandCoordinate, matchesPlaceName, searchNames };
