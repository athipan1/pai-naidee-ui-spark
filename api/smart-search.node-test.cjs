const test = require('node:test');
const assert = require('node:assert/strict');
const { SEED_PLACES } = require('./postgres-db.cjs');
const { rankPlaces, levenshtein } = require('./smart-search.cjs');

function search(query) { return rankPlaces(SEED_PLACES, query); }

test('alternative names search the same real places', () => {
  assert.equal(search('วัดแจ้ง')[0]?.id, 'curated-wat-arun');
  assert.equal(search('วัดโพธิ์')[0]?.id, 'curated-wat-pho');
  assert.equal(search('วัดพระศรีรัตนศาสดาราม')[0]?.id, '2');
  assert.equal(search('วัดพระพุทธบาทภูมโนรมย์')[0]?.id, 'curated-wat-phu-manorom');
  assert.equal(search('ภูมโนรมย์')[0]?.id, 'curated-wat-phu-manorom');
});

test('small typos are tolerated without matching unrelated places', () => {
  assert.equal(levenshtein('ภูมโนรมย์', 'ภูมโนรมย', 2), 1);
  assert.equal(search('วัดภูมโนรมย')[0]?.id, 'curated-wat-phu-manorom');
  assert.equal(search('zzzzzzzzzzzz').length, 0);
});

test('natural-language temple query combines place type and province', () => {
  const results = search('วัดสวยในมุกดาหาร');
  assert.ok(results.length > 0);
  assert.ok(results.every(place => place.province === 'มุกดาหาร'));
  assert.equal(results[0].id, 'curated-wat-phu-manorom');
});

test('exact alias outranks broad category suggestions', () => {
  assert.equal(search('วัดอรุณ')[0].id, 'curated-wat-arun');
  assert.equal(search('เชียงใหม่').every(place => place.province === 'เชียงใหม่'), true);
  assert.equal(rankPlaces(SEED_PLACES, 'วัดแจ้ง', 'Nature').length, 0);
});

test('province and place type queries combine filters even without spaces', () => {
  const waterfall = search('น้ำตกเชียงใหม่');
  assert.ok(waterfall.length > 0);
  assert.ok(waterfall.every(place => place.province === 'เชียงใหม่'));
  assert.ok(waterfall.every(place => place.tags.some(tag => tag.toLowerCase() === 'waterfall') ||
    place.nameLocal?.includes('น้ำตก')));
  const nature = search('ธรรมชาติในเชียงใหม่');
  assert.ok(nature.length > 0);
  assert.ok(nature.every(place => place.category === 'Nature' && place.province === 'เชียงใหม่'));
  const discovery = search('ที่เที่ยวในเชียงใหม่');
  assert.ok(discovery.length >= nature.length);
  assert.ok(discovery.every(place => place.province === 'เชียงใหม่'));
});

test('explicit province filter intersects query and category', () => {
  const matched = rankPlaces(SEED_PLACES, 'วัด', 'Culture', 'มุกดาหาร');
  assert.equal(matched.length, 1);
  assert.equal(matched[0].id, 'curated-wat-phu-manorom');
  assert.equal(rankPlaces(SEED_PLACES, 'วัด', 'Culture', 'เชียงใหม่')
    .every(place => place.province === 'เชียงใหม่'), true);
  assert.equal(rankPlaces(SEED_PLACES, 'วัดแจ้ง', '', 'มุกดาหาร').length, 0);
});
