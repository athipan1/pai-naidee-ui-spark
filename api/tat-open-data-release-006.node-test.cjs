const test = require('node:test');
const assert = require('node:assert/strict');
const batch = require('./additional-tat-open-data-batch-006.cjs');
const { SEED_PLACES } = require('./postgres-db.cjs');
const { auditPlaceImport } = require('./place-quality.cjs');

test('sixth TAT release is limited to three Chon Buri places', () => {
  assert.deepEqual(batch.map(place => place.id), [
    'tat-2016010510155820163',
    'tat-20200908183352469711',
    'tat-201005182246293275',
  ]);
  assert.equal(SEED_PLACES.length, 182);
  assert.equal(new Set(SEED_PLACES.map(place => place.id)).size, 182);
  assert.deepEqual(auditPlaceImport({ places: SEED_PLACES }).errors, []);
  for (const place of batch) {
    assert.equal(place.province, 'ชลบุรี');
    assert.ok(place.nameLocal && place.description);
    assert.equal(place.rating, 0);
    assert.equal(place.reviewCount, 0);
    assert.equal(place.imageUrl, null);
    assert.equal(place.verifiedAt, null);
    assert.ok(place.lat > 12 && place.lat < 14);
    assert.ok(place.lng > 100 && place.lng < 102);
  }
});

test('source names and precise TAT coordinates are preserved', () => {
  for (const [id, name, lat, lng] of [
    ['tat-2016010510155820163', 'ชุมชนตะเคียนเตี้ย', 13.0187322, 100.9326826],
    ['tat-20200908183352469711', 'ชุมชนเก่าชายทะเล (หมู่ 4 บ้านตลาดบางเสร่)', 12.7631974, 100.8896373],
    ['tat-201005182246293275', 'เกาะสีชัง', 13.161954907759235, 100.8105880598108],
  ]) {
    const place = SEED_PLACES.find(p => p.id === id);
    assert.ok(place);
    assert.equal(place.nameLocal, name);
    assert.equal(place.lat, lat);
    assert.equal(place.lng, lng);
  }
});
