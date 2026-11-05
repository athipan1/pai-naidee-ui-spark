const test = require('node:test');
const assert = require('node:assert/strict');
const { SEED_PLACES } = require('./postgres-db.cjs');
const batch = require('./additional-tat-open-data-batch-001.cjs');
const { auditPlaceImport } = require('./place-quality.cjs');

test('first approved TAT release is an exactly enumerated five-place batch', () => {
  assert.deepEqual(batch.map(place => place.id).sort(), [
    'tat-20260126145509001',
    'tat-20260203120214001',
    'tat-20260203143512001',
    'tat-20260204141052001',
    'tat-20260209144621001',
  ]);
  assert.equal(new Set(batch.map(place => place.province)).size, 5);
  assert.equal(SEED_PLACES.length, 150);
  assert.equal(auditPlaceImport({ places: SEED_PLACES }).errors.length, 0);
});

test('TAT provenance and unverified fields remain honest', () => {
  for (const place of batch) {
    assert.equal(place.sourceName, 'Tourism Authority of Thailand — Open Data');
    assert.equal(place.sourceUrl, 'https://datacatalog.tat.or.th/dataset/tourist-attraction');
    assert.equal(place.rating, 0);
    assert.equal(place.reviewCount, 0);
    assert.equal(place.imageUrl, null);
    assert.equal(place.verifiedAt, null, 'Do not fake a verification timestamp');
    assert.deepEqual(place.tags, []);
    assert.ok(place.description.length >= 50);
  }
});

test('first TAT release retains the official Thai names and source coordinates', () => {
  const byId = new Map(batch.map(place => [place.id, place]));
  for (const [id, nameLocal, province, lat, lng] of [
    ['tat-20260209144621001', 'เมืองเก่าสตูล', 'สตูล', 6.613603691140582, 100.06622314453125],
    ['tat-20260204141052001', 'ศูนย์เรียนรู้โฮงฮอมผญ๋า ล้านนา', 'เชียงราย', 20.0344254, 99.85596450000001],
    ['tat-20260203143512001', 'อุทยานแห่งชาติเขาพนมเบญจา', 'กระบี่', 8.240163599999999, 98.91414739999999],
    ['tat-20260203120214001', 'ชุมชนหนองปลาไหล', 'ชลบุรี', 12.9791195, 100.9601339],
    ['tat-20260126145509001', 'ชุมชนบ้านออนใต้', 'เชียงใหม่', 18.7376401, 99.23324],
  ]) {
    const place = byId.get(id);
    assert.ok(place, id);
    assert.equal(place.nameLocal, nameLocal);
    assert.equal(place.province, province);
    assert.equal(place.lat, lat);
    assert.equal(place.lng, lng);
  }
});
