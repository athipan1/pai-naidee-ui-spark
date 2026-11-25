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

test('autocomplete ranking prefers exact and alias names over typos', () => {
  const places = [
    { id: 'exact', name: 'Bang Saen Beach', name_local: 'หาดบางแสน', province: 'ชลบุรี' },
    { id: 'typo', name: 'Bang Saan', name_local: 'หาดบางสาน', province: 'ชลบุรี' },
    { id: 'alias', name: 'Ratchaprapha Dam', name_local: 'เขื่อนรัชชประภา',
      province: 'สุราษฎร์ธานี', aliases: ['เขื่อนเชี่ยวหลาน'] },
  ];
  assert.equal(rankPlaces(places, 'หาดบางแสน')[0]?.id, 'exact');
  assert.equal(rankPlaces(places, 'เขื่อนเชียวหลาน')[0]?.id, 'alias');
  assert.equal(rankPlaces(places, 'เขื่อนเชี่ยวหลาน')[0]?.id, 'alias');
  assert.equal(rankPlaces(places, 'ไม่เกี่ยวข้อง').length, 0);
});

test('autocomplete returns one row per place ID even with several matching aliases', () => {
  const places = [{ id: 'one', name: 'Wat Arun', name_local: 'วัดอรุณ',
    aliases: ['วัดอรุณ', 'วัดอรุณราชวราราม'], province: 'กรุงเทพฯ' }];
  assert.deepEqual(rankPlaces(places, 'วัดอรุณ').map(place => place.id), ['one']);
});


test('nationwide regression: aliases, partial names and one-character typos', () => {
  const places = [
    { id: 'chonburi-beach', name: 'Bang Saen Beach', name_local: 'หาดบางแสน', province: 'ชลบุรี', category: 'Beach', aliases: ['บางแสน'] },
    { id: 'surat-dam', name: 'Ratchaprapha Dam', name_local: 'เขื่อนรัชชประภา', province: 'สุราษฎร์ธานี', category: 'Nature', aliases: ['เขื่อนเชี่ยวหลาน', 'เชี่ยวหลาน'] },
    { id: 'mukdahan-temple', name: 'Wat Phu Manorom', name_local: 'วัดภูมโนรมย์', province: 'มุกดาหาร', category: 'Culture', aliases: ['วัดพระพุทธบาทภูมโนรมย์'] },
    { id: 'bangkok-temple', name: 'Wat Arun', name_local: 'วัดอรุณ', province: 'กรุงเทพมหานคร', category: 'Culture', aliases: ['วัดแจ้ง'] },
    { id: 'chiangmai-mountain', name: 'Doi Inthanon', name_local: 'ดอยอินทนนท์', province: 'เชียงใหม่', category: 'Nature', aliases: ['อุทยานแห่งชาติดอยอินทนนท์'] },
  ];
  const cases = [
    ['บางแสน', 'chonburi-beach'],
    ['หาดบางแสน', 'chonburi-beach'],
    ['เขื่อนเชียวหลาน', 'surat-dam'],
    ['เขื่อนเชี่ยวหลาน', 'surat-dam'],
    ['วัดภูมโนรมย', 'mukdahan-temple'],
    ['วัดแจ้ง', 'bangkok-temple'],
    ['ดอยอินทนนท', 'chiangmai-mountain'],
    ['Doi Inthanon', 'chiangmai-mountain'],
  ];
  for (const [query, expected] of cases) {
    assert.equal(rankPlaces(places, query)[0]?.id, expected, query);
  }
  assert.equal(rankPlaces(places, 'เขื่อนเชี่ยวหลาน', 'Nature', 'ชลบุรี').length, 0);
  assert.equal(rankPlaces(places, 'zzzzzzzzzzzz').length, 0);
  assert.deepEqual(rankPlaces(places, 'วัดแจ้ง').map(place => place.id), ['bangkok-temple']);
});

test('all 22 Phase 1 exact-name regressions keep their expected Place IDs', () => {
  const cases = require('./test-fixtures/phase-1-search-cases.json');
  const places = cases.reduce((byId, row) => {
    const place = byId.get(row.id);
    if (place) place.name_local = row.query;
    else byId.set(row.id, { id: row.id, name: row.query, province: row.province, province_en: row.province_en });
    return byId;
  }, new Map());
  assert.equal(cases.length, 22);
  for (const row of cases) {
    for (const province of ['', row.province]) {
      assert.equal(rankPlaces([...places.values()], row.query, '', province)[0]?.id, row.id, row.query);
    }
  }
});

test('all 77 shared province mappings resolve Thai and English with null and empty province_en', () => {
  const { PROVINCE_EN } = require('./place-localizations.cjs');
  const places = Object.keys(PROVINCE_EN).map((th, index) => ({
    id: th, name: `Location ${index}`, province: th === 'กรุงเทพฯ' ? 'กรุงเทพมหานคร' : th,
    province_en: index % 2 === 0 ? null : '',
  }));
  assert.equal(places.length, 77);
  for (const [th, en] of Object.entries(PROVINCE_EN)) {
    assert.deepEqual(rankPlaces(places, en).map(row => row.id), [th], en);
    assert.deepEqual(rankPlaces(places, `จังหวัด${th}`).map(row => row.id), [th], th);
    assert.deepEqual(rankPlaces(places, '', '', en.toUpperCase().replaceAll(' ', ' \u200B  ')).map(row => row.id), [th], en);
  }
});

test('full primary names, approved aliases, prefix and partial names rank in that order', () => {
  const places = [
    { id: 'primary', name: 'Nan', province: 'กระบี่', category: 'Park' },
    { id: 'alias', name: 'Community Garden', aliases: ['Nan'], province: 'กระบี่', category: 'Park' },
    { id: 'prefix', name: 'Nan Orchard', province: 'น่าน', category: 'Park' },
    { id: 'partial', name: 'Little Nan Orchard', province: 'น่าน', category: 'Park' },
  ];
  assert.deepEqual(rankPlaces(places, 'Ｎａｎ').map(p => p.id), ['primary', 'alias', 'prefix', 'partial']);
  assert.deepEqual(rankPlaces(places, 'Nan', 'Park', 'Krabi').map(p => p.id), ['primary', 'alias']);
  assert.equal(rankPlaces(places, 'Nan', 'Beach', 'Krabi').length, 0);
  assert.equal(rankPlaces(places, 'Nan', '', '!!!').length, 0);
});

test('embedded province fragments preserve partial names and natural discovery stays scoped', () => {
  const places = [
    { id: 'beach', name: 'Ao Nang Beach', name_local: 'หาดอ่าวนาง', province: 'กระบี่', category: 'Beach' },
    { id: 'temple', name: 'Wat Phumin', name_local: 'วัดภูมินทร์', province: 'น่าน', category: 'Culture' },
    { id: 'outside', name: 'Another Temple', name_local: 'วัดแห่งอื่น', province: 'กระบี่', category: 'Culture' },
  ];
  assert.equal(rankPlaces(places, 'Ao Nan')[0]?.id, 'beach');
  assert.equal(rankPlaces(places, 'หาดอ่าว\u200bนาง!')[0]?.id, 'beach');
  assert.deepEqual(rankPlaces(places, 'temple in Nan').map(p => p.id), ['temple']);
  assert.deepEqual(rankPlaces(places, 'วัดในน่าน').map(p => p.id), ['temple']);
  assert.deepEqual(rankPlaces(places, 'zz'), []);
});
