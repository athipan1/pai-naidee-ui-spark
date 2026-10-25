const test = require('node:test');
const assert = require('node:assert/strict');
const { parseNearbyOptions, SEED_PLACES } = require('./postgres-db.cjs');

test('nearby parses valid coordinates with bounded radius and limit', () => {
  assert.deepEqual(parseNearbyOptions({ lat: '13.75', lng: '100.49', radiusKm: '25', limit: '30' }), {
    latitude: 13.75, longitude: 100.49, radius: 25, count: 30,
  });
});

test('nearby rejects missing or unsafe search parameters', () => {
  for (const options of [
    {}, { lat: '', lng: 100 }, { lat: null, lng: 100 },
    { lat: 91, lng: 100 }, { lat: 13, lng: -181 },
    { lat: 'NaN', lng: 100 }, { lat: 13, lng: 100, radiusKm: 0 },
    { lat: 13, lng: 100, radiusKm: 101 },
    { lat: 13, lng: 100, limit: 51 }, { lat: 13, lng: 100, limit: 2.5 },
  ]) assert.throws(() => parseNearbyOptions(options), RangeError);
});

test('all new curated locations have distinct IDs, provenance, and real Thailand coordinates', () => {
  const curated = SEED_PLACES.filter(place => place.id.startsWith('curated-'));
  assert.equal(curated.length, 7);
  assert.equal(new Set(curated.map(place => place.id)).size, curated.length);
  for (const place of curated) {
    assert.ok(place.lat >= 5 && place.lat <= 21);
    assert.ok(place.lng >= 97 && place.lng <= 106);
    assert.match(place.sourceUrl, /^https:\/\//);
    assert.equal(place.reviewCount, 0);
    assert.equal(place.rating, 0);
    assert.equal(place.imageUrl, null);
  }
});

test('initial catalogue entries do not ship unverified demo ratings or photos', () => {
  assert.equal(SEED_PLACES.length, 11);
  for (const place of SEED_PLACES) {
    assert.equal(place.rating, 0);
    assert.equal(place.reviewCount, 0);
    assert.equal(place.imageUrl, null);
    assert.match(place.sourceUrl, /^https:\/\//);
  }
});
