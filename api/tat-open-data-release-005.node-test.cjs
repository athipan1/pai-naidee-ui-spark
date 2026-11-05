const test = require('node:test');
const assert = require('node:assert/strict');
const batch = require('./additional-tat-open-data-batch-005.cjs');
const { SEED_PLACES } = require('./postgres-db.cjs');
const { auditPlaceImport } = require('./place-quality.cjs');

test('Chon Buri batch 005 adds only three source-verified places', () => {
  assert.deepEqual(batch.map(place => place.id), [
    'tat-20211221230034734283', 'tat-20160528165231008560', 'tat-20160528170226008563',
  ]);
  assert.equal(SEED_PLACES.length, 182);
  assert.equal(new Set(SEED_PLACES.map(p => p.id)).size, 182);
  assert.equal(auditPlaceImport({ places: SEED_PLACES }).errors.length, 0);
  for (const p of batch) {
    assert.equal(p.province, 'ชลบุรี');
    assert.ok(p.nameLocal && p.description && p.nameLocal !== 'ไม่มี');
    assert.equal(p.rating, 0);
    assert.equal(p.reviewCount, 0);
    assert.equal(p.imageUrl, null);
    assert.equal(p.verifiedAt, null);
    assert.ok(p.lat > 12 && p.lat < 14);
    assert.ok(p.lng > 100 && p.lng < 102);
  }
});

test('Chon Buri source IDs and coordinates remain exact', () => {
  for (const [id, thaiName, lat, lng] of [
    ['tat-20211221230034734283', 'แกรนด์แคนยอนคีรี', 13.3216428, 100.9800556],
    ['tat-20160528165231008560', 'อุทยานรังสรรค์นวัตกรรมอวกาศ (สเปซ อินสไปเลียม)', 13.1026146, 100.9304523],
    ['tat-20160528170226008563', 'ป่าสิริเจริญวรรษ', 12.7596807, 100.9800186],
  ]) {
    const place = SEED_PLACES.find(p => p.id === id);
    assert.ok(place);
    assert.equal(place.nameLocal, thaiName);
    assert.equal(place.lat, lat);
    assert.equal(place.lng, lng);
  }
});
