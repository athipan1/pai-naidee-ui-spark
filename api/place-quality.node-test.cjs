const test = require('node:test');
const assert = require('node:assert/strict');
const { SEED_PLACES } = require('./postgres-db.cjs');
const { auditPlaceImport, assertPlaceImportReady } = require('./place-quality.cjs');
const input = () => ({
  places: SEED_PLACES,
  wikimediaMedia: require('./curated-wikimedia-media.json'),
  missingMedia: require('./verified-missing-commons-media.json'),
  userMedia: require('./user-provided-place-media.json'),
  requireFullCoverage: true,
});

test('nationwide catalogue passes strict checks before Railway writes', () => {
  const result = assertPlaceImportReady(input());
  assert.equal(result.coverage.totalProvinces, 77);
  assert.equal(result.coverage.provinces, 77);
  assert.equal(result.coverage.places, 110);
  assert.deepEqual(result.coverage.missingProvinces, []);
});
test('duplicate ID or place name blocks import', () => {
  const copy = { ...SEED_PLACES[0], id: 'another-id' };
  const result = auditPlaceImport({ ...input(), places: [...SEED_PLACES, copy] });
  assert.match(result.errors.join(' '), /duplicate Thai name/);
});
test('bad geocoordinates, sources, and unknown provinces block import', () => {
  const malformed = { ...SEED_PLACES[0], lat: 0, lng: 0, sourceUrl: 'http://invalid', province: 'ไม่มีจังหวัดนี้' };
  const result = auditPlaceImport({ ...input(), places: [malformed, ...SEED_PLACES.slice(1)] });
  assert.match(result.errors.join(' '), /coordinates outside Thailand/);
  assert.match(result.errors.join(' '), /invalid HTTPS provenance/);
  assert.match(result.errors.join(' '), /unknown province/);
});
test('incorrect photo attribution or missing user asset blocks import', () => {
  const result = auditPlaceImport({ ...input(), userMedia: [{
    id: 'bad-photo', placeId: SEED_PLACES[0].id, filename: 'missing-photo.jpg',
    url: 'https://pai-naidee-ui-spark.vercel.app/place-photos/missing-photo.jpg',
  }] });
  assert.match(result.errors.join(' '), /user photo URL\/local asset mismatch/);
});
test('a removed province fails complete-coverage gate', () => {
  const result = auditPlaceImport({ ...input(), places: SEED_PLACES.filter(p => p.province !== 'พิจิตร') });
  assert.match(result.errors.join(' '), /province coverage incomplete/);
  assert.deepEqual(result.coverage.missingProvinces, ['พิจิตร']);
});
