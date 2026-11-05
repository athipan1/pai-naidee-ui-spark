const test = require('node:test');
const assert = require('node:assert/strict');
const batch = require('./additional-tat-open-data-batch-004.cjs');
const { SEED_PLACES } = require('./postgres-db.cjs');

test('fourth TAT release is limited to four reviewed IDs, with no fabricated data', () => {
  assert.deepEqual(batch.map(place => place.id), [
    'tat-20250815163438001', 'tat-20250701101935001',
    'tat-20250620154151001', 'tat-20250620152816001',
  ]);
  assert.equal(SEED_PLACES.length, 187);
  assert.equal(new Set(SEED_PLACES.map(place => place.id)).size, 187);
  for (const p of batch) {
    assert.ok(p.nameLocal && p.province && p.description);
    assert.equal(p.rating, 0);
    assert.equal(p.reviewCount, 0);
    assert.equal(p.imageUrl, null);
    assert.equal(p.verifiedAt, null);
    assert.equal(p.descriptionEn, null);
    assert.ok(p.lat >= 5 && p.lat <= 21);
    assert.ok(p.lng >= 97 && p.lng <= 106);
  }
});

test('fourth release preserves TAT coordinates and original Thai names', () => {
  for (const [id, name, province, lat, lng] of [
    ['tat-20250815163438001', 'กลุ่มท่องเที่ยวบ้านน้ำเชี่ยว', 'ตราด', 12.1892542, 102.4612939],
    ['tat-20250701101935001', 'ถ้ำภูผาเพชร', 'สตูล', 7.1246747, 99.9981765],
    ['tat-20250620154151001', 'ชุมชนริมน้ำจันทบูร', 'จันทบุรี', 12.6127731, 102.1136881],
    ['tat-20250620152816001', 'เมืองเก่าอุทัยธานี', 'อุทัยธานี', 15.4088251, 99.8270594],
  ]) {
    const p = SEED_PLACES.find(item => item.id === id);
    assert.ok(p);
    assert.equal(p.nameLocal, name);
    assert.equal(p.province, province);
    assert.equal(p.lat, lat);
    assert.equal(p.lng, lng);
  }
});
