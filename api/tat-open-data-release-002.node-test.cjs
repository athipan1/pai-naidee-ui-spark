const test = require('node:test');
const assert = require('node:assert/strict');
const { SEED_PLACES } = require('./postgres-db.cjs');
const { auditPlaceImport } = require('./place-quality.cjs');
const batch = require('./additional-tat-open-data-batch-002.cjs');

test('TAT second publication is limited to five independently cross-checked places', () => {
  assert.deepEqual(batch.map(place => place.id).sort(), [
    'tat-20251213063829001',
    'tat-20251213065714001',
    'tat-20251215120121001',
    'tat-20251224114028001',
    'tat-20251225110647001',
  ]);
  assert.equal(new Set(batch.map(place => place.province)).size, 5);
  assert.equal(SEED_PLACES.length, 120);
  assert.equal(auditPlaceImport({ places: SEED_PLACES }).errors.length, 0);
});

test('TAT second batch has traceable provenance and never fabricates ratings, images, hours or timestamps', () => {
  for (const place of batch) {
    assert.equal(place.rating, 0);
    assert.equal(place.reviewCount, 0);
    assert.equal(place.imageUrl, null);
    assert.equal(place.verifiedAt, null);
    assert.deepEqual(place.tags, []);
    assert.equal(place.sourceName, 'Tourism Authority of Thailand — Open Data');
    assert.equal(place.sourceUrl, 'https://datacatalog.tat.or.th/dataset/tourist-attraction');
    assert.ok(place.description.length >= 50);
    assert.ok(!('openingHours' in place) && !('price' in place));
  }
});

test('TAT second batch retains official Thai names and decimal coordinates', () => {
  const byId = new Map(batch.map(place => [place.id, place]));
  for (const [id, nameLocal, province, lat, lng] of [
    ['tat-20251225110647001', 'พิพิธภัณฑ์ศาลรัฐธรรมนูญ', 'กรุงเทพฯ', 13.7420208, 100.5008664],
    ['tat-20251224114028001', 'วิสาหกิจชุมชนบ้านหน้าเขา-ในวัง', 'ตรัง', 8.00575743001172, 99.74576681575446],
    ['tat-20251215120121001', 'เขตห้ามล่าสัตว์ป่าถ้ำผาท่าพล', 'พิษณุโลก', 16.5088643, 100.6602245],
    ['tat-20251213065714001', 'วัดเขาสิงโต', 'สระแก้ว', 13.9895613, 102.0081452],
    ['tat-20251213063829001', 'พิพิธภัณฑ์การแพทย์แผนไทยอภัยภูเบศร', 'ปราจีนบุรี', 14.0541674, 101.394816],
  ]) {
    const place = byId.get(id);
    assert.ok(place, id);
    assert.equal(place.nameLocal, nameLocal);
    assert.equal(place.province, province);
    assert.equal(place.lat, lat);
    assert.equal(place.lng, lng);
  }
});

test('wrong English province in TAT Wat Khao Singto record does not reach production', () => {
  const wat = batch.find(p => p.id === 'tat-20251213065714001');
  assert.equal(wat.province, 'สระแก้ว');
  assert.equal(wat.descriptionEn, null);
  assert.doesNotMatch(wat.description, /ปราจีนบุรี|Prachinburi/i);
  const courtMuseum = batch.find(p => p.id === 'tat-20251225110647001');
  assert.equal(courtMuseum.name, 'Constitutional Court Museum');
});
