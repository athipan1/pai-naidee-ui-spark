const test = require('node:test');
const assert = require('node:assert/strict');
const { parseNearbyOptions, normalizePlace, SEED_PLACES } = require('./postgres-db.cjs');
const verifiedMedia = require('./curated-wikimedia-media.json');

test('licensed Wikimedia photos have distinct place IDs and verifiable attribution', () => {
  assert.ok(verifiedMedia.length >= 70);
  assert.equal(new Set(verifiedMedia.map(photo => photo.placeId)).size, verifiedMedia.length);
  const places = new Set(SEED_PLACES.map(place => place.id));
  for (const photo of verifiedMedia) {
    assert.ok(places.has(photo.placeId), `Missing linked place: ${photo.placeId}`);
    assert.match(photo.url, /^https:\/\/(?:thumb|upload)\.wikimedia\.org\//);
    assert.match(photo.sourcePage, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(photo.licenseUrl, /^https:\/\//);
    assert.ok(photo.photographer.length > 0 && photo.photographer.length <= 180);
    assert.ok(photo.licenseName && photo.detailSourceUrl.startsWith('https://'));
  }
});

test('Railway API normalizes seeded images, source credits and encyclopedia details', () => {
  const photo = verifiedMedia[0];
  const result = normalizePlace({
    id: photo.placeId, name: photo.placeName, name_local: photo.placeName,
    province: 'กรุงเทพฯ', category: 'Culture', rating: 0, review_count: 0,
    image_url: null, description: 'Reviewed Thai summary', tags: [], lat: 13.7, lng: 100.5,
    detail_text: photo.detailText, detail_source_url: photo.detailSourceUrl,
    media: [{url: photo.url,creatorName:photo.photographer,licenseName:photo.licenseName,
      licenseUrl:photo.licenseUrl,sourcePage:photo.sourcePage}],
  });
  assert.equal(result.image, photo.url);
  assert.deepEqual(result.images, [photo.url]);
  assert.equal(result.mediaCredits[0].photographer, photo.photographer);
  assert.equal(result.mediaCredits[0].licenseUrl, photo.licenseUrl);
  assert.equal(result.detailedDescription.text, photo.detailText);
  assert.equal(result.description, 'Reviewed Thai summary');
});
const latestCurated = require('./additional-curated-places-v3.cjs');
const newestCurated = require('./additional-curated-places-v4.cjs');

test('fourth curated batch adds 25 sourced Thai locations in 25 distinct provinces', () => {
  assert.equal(newestCurated.length, 25);
  assert.equal(new Set(newestCurated.map(place => place.id)).size, 25);
  assert.equal(new Set(newestCurated.map(place => place.province)).size, 25);
  for (const place of newestCurated) {
    assert.match(place.sourceUrl, /^https:\/\//);
    assert.ok(Number.isFinite(place.lat) && Number.isFinite(place.lng));
    assert.equal(place.rating, 0);
    assert.equal(place.reviewCount, 0);
    assert.equal(place.imageUrl, null);
  }
});

test('third curated batch adds 25 distinct sourced locations in at least 20 provinces', () => {
  assert.equal(latestCurated.length, 25);
  assert.equal(new Set(latestCurated.map(place => place.id)).size, 25);
  assert.ok(new Set(latestCurated.map(place => place.province)).size >= 20);
  for (const place of latestCurated) {
    assert.match(place.sourceUrl, /^https:\/\//);
    assert.ok(Number.isFinite(place.lat) && Number.isFinite(place.lng));
    assert.equal(place.rating, 0);
    assert.equal(place.reviewCount, 0);
    assert.equal(place.imageUrl, null);
  }
});

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
  assert.equal(curated.length, 104);
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
  assert.equal(SEED_PLACES.length, 108);
  assert.equal(new Set(SEED_PLACES.map(place => place.id)).size, 108);
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
    ['curated-kamphaeng-phet-historical-park', 'กำแพงเพชร'],
    ['curated-phu-langka-forest-park', 'พะเยา'],
    ['curated-great-buddha-of-thailand', 'อ่างทอง'],
    ['curated-namtok-chet-sao-noi-national-park', 'สระบุรี'],
    ['curated-ko-phayam', 'ระนอง'],
    ['curated-wat-chang-hai', 'ปัตตานี'],
    ['curated-hala-bala-wildlife-sanctuary', 'นราธิวาส'],
    ['curated-wat-phra-si-rattana-mahathat-phitsanulok', 'พิษณุโลก'],
    ['curated-sam-chuk-old-market', 'สุพรรณบุรี'],
    ['curated-sirindhorn-museum', 'กาฬสินธุ์'],
    ['curated-phra-maha-chedi-chai-mongkol', 'ร้อยเอ็ด'],
    ['curated-aiyerweng-sea-of-mist-viewpoint', 'ยะลา'],
  ]) {
    const place = byId.get(id);
    assert.ok(place, `${id} is absent from the catalogue`);
    assert.equal(place.province, province);
    assert.ok(new URL(place.sourceUrl).host);
  }
});
