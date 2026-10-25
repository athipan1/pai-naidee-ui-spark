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
  assert.equal(curated.length, 54);
  assert.equal(new Set(curated.map(place => place.id)).size, curated.length);
  for (const place of curated) {
    assert.ok(place.lat >= 5 && place.lat <= 21);
    assert.ok(place.lng >= 97 && place.lng <= 106);
    assert.ok(place.name && place.nameLocal && place.province && place.description);
    assert.ok(['Beach', 'Nature', 'Culture', 'Food'].includes(place.category));
    assert.match(place.sourceUrl, /^https:\/\//);
    assert.equal(place.reviewCount, 0);
    assert.equal(place.rating, 0);
    assert.equal(place.imageUrl, null);
  }
});

test('expanded nationwide catalogue contains no duplicate IDs or demo ratings/photos', () => {
  assert.equal(SEED_PLACES.length, 58);
  assert.equal(new Set(SEED_PLACES.map(place => place.id)).size, 58);
  for (const place of SEED_PLACES) {
    assert.equal(place.rating, 0);
    assert.equal(place.reviewCount, 0);
    assert.equal(place.imageUrl, null);
    assert.match(place.sourceUrl, /^https:\/\//);
  }
});

test('new destinations cover multiple regions and retain stable location/source records', () => {
  const byId = new Map(SEED_PLACES.map(place => [place.id, place]));
  for (const [id, province] of [
    ['curated-ayutthaya-historical-park', 'พระนครศรีอยุธยา'],
    ['curated-phanom-rung-historical-park', 'บุรีรัมย์'],
    ['curated-phu-chi-fa', 'เชียงราย'],
    ['curated-ko-samet', 'ระยอง'],
    ['curated-ko-lipe', 'สตูล'],
    ['curated-wat-phra-mahathat-nakhon', 'นครศรีธรรมราช'],
    ['curated-wat-phumin', 'น่าน'],
    ['curated-phu-phra-bat-historical-park', 'อุดรธานี'],
    ['curated-maeklong-railway-market', 'สมุทรสงคราม'],
    ['curated-ko-kradan', 'ตรัง'],
    ['curated-samila-beach', 'สงขลา'],
    ['curated-ko-tarutao', 'สตูล'],
  ]) {
    const place = byId.get(id);
    assert.ok(place, `${id} is absent from the catalogue`);
    assert.equal(place.province, province);
    assert.ok(new URL(place.sourceUrl).host);
  }
});
