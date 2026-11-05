const test = require('node:test');
const assert = require('node:assert/strict');
const batch = require('./additional-tat-open-data-batch-003.cjs');
const { SEED_PLACES } = require('./postgres-db.cjs');

test('third TAT release is explicitly limited to three independently checked IDs', () => {
  assert.deepEqual(batch.map(place => place.id), [
    'tat-20250925134625001',
    'tat-20250922135409001',
    'tat-20250916103852001',
  ]);
  assert.equal(SEED_PLACES.length, 174);
  assert.equal(new Set(SEED_PLACES.map(place => place.id)).size, SEED_PLACES.length);
  for (const place of batch) {
    assert.ok(place.nameLocal && place.description && place.province);
    assert.equal(place.imageUrl, null);
    assert.equal(place.rating, 0);
    assert.equal(place.reviewCount, 0);
    assert.equal(place.verifiedAt, null);
    assert.equal(place.sourceUrl, 'https://datacatalog.tat.or.th/dataset/tourist-attraction');
    assert.ok(place.lat >= 5 && place.lat <= 21);
    assert.ok(place.lng >= 97 && place.lng <= 106);
  }
});

test('third release preserves exact TAT pins and Thai province names', () => {
  for (const [id, name, province, lat, lng] of [
    ['tat-20250925134625001', 'โฮมสเตย์บ้านท่าขันทองการท่องเที่ยวโดยชุมชน', 'เชียงราย', 20.1964598, 100.2372647],
    ['tat-20250922135409001', 'หอภาพถ่ายล้านนา', 'เชียงใหม่', 18.7898668, 98.9885823],
    ['tat-20250916103852001', 'ศูนย์ศึกษาวิจัยและพิพิธภัณฑ์ไดโนเสาร์', 'ขอนแก่น', 16.6777635, 102.2661556],
  ]) {
    const place = SEED_PLACES.find(item => item.id === id);
    assert.ok(place);
    assert.equal(place.nameLocal, name);
    assert.equal(place.province, province);
    assert.equal(place.lat, lat);
    assert.equal(place.lng, lng);
  }
});
