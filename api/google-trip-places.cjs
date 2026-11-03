'use strict';

// Google Maps Platform content is ephemeral. Do not persist these objects or
// send them to third-party LLMs; only Google Place IDs may be kept long term.
const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const ROUTE_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const SEARCH_FIELDS = 'places.id,places.displayName,places.location,places.formattedAddress,places.googleMapsUri,places.primaryType';
const ROUTE_FIELDS = 'routes.duration,routes.distanceMeters';
const VALID_PLACE_ID = /^[A-Za-z0-9_-]{8,180}$/;
let budgetWindowStart = Date.now();
let budgetUsed = 0;
let routeWindowStart = Date.now();
let routeUsed = 0;

function googleTripEnabled() {
  // Pilot must expire without operator intervention. A missing/invalid expiry
  // leaves Google disabled, even when a Railway flag was accidentally left on.
  const expiresAt = Date.parse(process.env.GOOGLE_PLACES_PILOT_EXPIRES_AT || '');
  return process.env.GOOGLE_PLACES_ENABLED === 'true' &&
    Boolean(process.env.GOOGLE_PLACES_API_KEY) &&
    Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

function spendSearchAllowance() {
  const now = Date.now();
  if (now - budgetWindowStart >= 60 * 60 * 1000) {
    budgetWindowStart = now;
    budgetUsed = 0;
  }
  // Per-instance backstop, in addition to the endpoint's per-IP rate limit.
  const configured = Number(process.env.GOOGLE_PLACES_MAX_SEARCHES_PER_HOUR);
  const limit = Math.min(60, Math.max(0, Number.isFinite(configured) && process.env.GOOGLE_PLACES_MAX_SEARCHES_PER_HOUR !== undefined ? configured : 20));
  if (budgetUsed >= limit) return false;
  budgetUsed++;
  return true;
}

function spendRouteAllowance() {
  const now = Date.now();
  if (now - routeWindowStart >= 60 * 60 * 1000) {
    routeWindowStart = now;
    routeUsed = 0;
  }
  const configured = Number(process.env.GOOGLE_ROUTES_MAX_CALLS_PER_HOUR);
  const limit = Math.min(120, Math.max(0, Number.isFinite(configured) && process.env.GOOGLE_ROUTES_MAX_CALLS_PER_HOUR !== undefined ? configured : 40));
  if (routeUsed >= limit) return false;
  routeUsed++;
  return true;
}

function validCoordinates(location) {
  const lat = Number(location?.latitude), lng = Number(location?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 5 && lat <= 21 && lng >= 97 && lng <= 106;
}

function normalizeGooglePlace(item, province) {
  if (!item || !VALID_PLACE_ID.test(String(item.id || '')) || !validCoordinates(item.location)) return null;
  const name = typeof item.displayName?.text === 'string' ? item.displayName.text.trim() : '';
  const address = typeof item.formattedAddress === 'string' ? item.formattedAddress.trim() : '';
  if (!name || name.length > 140 || !address || !address.toLocaleLowerCase().includes(province.toLocaleLowerCase())) return null;
  const uri = typeof item.googleMapsUri === 'string' ? item.googleMapsUri : '';
  let mapsUrl = '';
  try {
    const parsed = new URL(uri);
    if (parsed.protocol === 'https:' && (parsed.hostname === 'google.com' || parsed.hostname.endsWith('.google.com') || parsed.hostname === 'maps.app.goo.gl')) mapsUrl = parsed.toString();
  } catch {}
  return {
    id: 'google:' + item.id, googlePlaceId: item.id, source: 'google_places', googleMapsUri: mapsUrl,
    name, nameLocal: name, province, category: 'Place', tags: [], rating: 0,
    coordinates: {lat: Number(item.location.latitude), lng: Number(item.location.longitude)},
  };
}

async function searchGoogleTripPlaces({province, nature}, fetchImpl = fetch, reserveQuota = async () => false) {
  // Province is validated upstream; never accept a full arbitrary LLM prompt here.
  if (typeof province !== 'string' || province.length > 80 || !province.trim()) return [];
  if (!googleTripEnabled() || !spendSearchAllowance()) return [];
  if (!await reserveQuota('places_search')) return [];
  const textQuery = (nature ? 'แหล่งท่องเที่ยวธรรมชาติ ' : 'สถานที่ท่องเที่ยว ') + 'จังหวัด' + province + ' ประเทศไทย';
  try {
    const response = await fetchImpl(SEARCH_URL, {
      method: 'POST', signal: AbortSignal.timeout(8000),
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': SEARCH_FIELDS,
      },
      body: JSON.stringify({textQuery, languageCode: 'th', regionCode: 'TH', pageSize: 20}),
    });
    if (!response.ok) throw new Error('GOOGLE_PLACES_HTTP_' + response.status);
    const data = await response.json();
    const seen = new Set();
    return (Array.isArray(data.places) ? data.places : []).map(p => normalizeGooglePlace(p, province)).filter(p => {
      if (!p || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  } catch (error) {
    console.warn('google_trip_search_unavailable', String(error?.message || '').slice(0, 80));
    return [];
  }
}

function isGooglePlace(place) { return place?.source === 'google_places'; }

function mergeTripCandidates(local, google) {
  const result = [...local];
  for (const candidate of google) {
    const duplicate = result.some(existing => {
      if (existing.id === candidate.id) return true;
      const a = String(existing.nameLocal || existing.name || '').trim().toLocaleLowerCase().replace(/\s+/g, '');
      const b = String(candidate.nameLocal || candidate.name || '').trim().toLocaleLowerCase().replace(/\s+/g, '');
      if (!a || !b || a !== b) return false;
      const lat = Number(existing.coordinates?.lat), lng = Number(existing.coordinates?.lng);
      return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat - candidate.coordinates.lat) < 0.01 && Math.abs(lng - candidate.coordinates.lng) < 0.01;
    });
    if (!duplicate) result.push(candidate);
  }
  return result;
}

async function googleRoadLeg(a, b, mode, fetchImpl = fetch, reserveQuota = async () => false) {
  if (!googleTripEnabled()) return {status: 'unverified', reason: 'google_routes_not_configured'};
  if (mode === 'public') return {status: 'unverified', reason: 'public_transport_not_supported'};
  // This process-local backstop does not replace a Google Cloud quota (which
  // applies across all Railway instances) or a billing alert.
  if (!spendRouteAllowance()) return {status: 'unverified', reason: 'google_routes_hourly_limit'};
  if (!await reserveQuota('routes_compute')) return {status: 'unverified', reason: 'google_routes_daily_limit'};
  try {
    const response = await fetchImpl(ROUTE_URL, {
      method: 'POST', signal: AbortSignal.timeout(7000),
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': ROUTE_FIELDS,
      },
      body: JSON.stringify({
        origin: {location: {latLng: {latitude: a.coordinates.lat, longitude: a.coordinates.lng}}},
        destination: {location: {latLng: {latitude: b.coordinates.lat, longitude: b.coordinates.lng}}},
        travelMode: 'DRIVE',
      }),
    });
    if (!response.ok) throw new Error('GOOGLE_ROUTES_HTTP_' + response.status);
    const data = await response.json();
    const route = data?.routes?.[0];
    const duration = Number.parseFloat(route?.duration);
    if (!Number.isFinite(route?.distanceMeters) || !Number.isFinite(duration)) throw new Error('GOOGLE_ROUTES_MISSING_FIELDS');
    return {status: 'verified_route', source: 'google_routes', distanceKm: Math.round(route.distanceMeters / 100) / 10, durationMinutes: Math.ceil(duration / 60)};
  } catch (error) {
    console.warn('google_trip_route_unavailable', String(error?.message || '').slice(0, 80));
    return {status: 'unverified', reason: 'google_routes_unavailable'};
  }
}

function createTripRoute(legacyRoute, reserveQuota = async () => false) {
  let googleCalls = 0;
  return (a, b, mode) => {
    if (!isGooglePlace(a) && !isGooglePlace(b)) return legacyRoute(a, b, mode);
    if (googleCalls++ >= 12) return {status: 'unverified', reason: 'google_routes_budget_exceeded'};
    return googleRoadLeg(a, b, mode, fetch, reserveQuota);
  };
}

module.exports = {googleTripEnabled, normalizeGooglePlace, searchGoogleTripPlaces, mergeTripCandidates, isGooglePlace, googleRoadLeg, createTripRoute};
