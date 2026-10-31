const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPlaceSearch, PLACE_NAME_ALIASES } = require('./place-search.cjs');
const { SEED_PLACES } = require('./postgres-db.cjs');

function matchesSqlLike(value, pattern) {
  // Small test-only matcher for the % and escaped literal wildcard patterns.
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/%/g, '.*');
  return new RegExp(`^${escaped}$`, 'iu').test(value);
}

test('common Wat Phu Manorom names and spacing find its canonical catalogue record', () => {
  const place = SEED_PLACES.find(item => item.id === 'curated-wat-phu-manorom');
  assert.ok(place);

  for (const query of [
    'วัดภูมโนรมย์',
    'ภูมโนรมย์',
    'วัดพระพุทธบาท ภูมโนรมย์',
    'วัดพระพุทธบาทภูมโนรมย์',
    'วัดรอยพระพุทธบาทภูมโนรมย์',
    'Wat Phu Manorom',
    '  วัดพระพุทธบาท   ภูมโนรมย์  ',
  ]) {
    const search = buildPlaceSearch(query);
    assert.ok(
      search.aliasPlaceId === place.id ||
      matchesSqlLike(place.nameLocal, search.searchPattern) ||
      matchesSqlLike(place.nameLocal, search.flexibleNamePattern) ||
      matchesSqlLike(place.name, search.flexibleNamePattern),
      `Query ${query} should match the actual stored name`,
    );
  }
});

test('alias table references real seeded IDs', () => {
  const placeIds = new Set(SEED_PLACES.map(place => place.id));
  for (const [id, aliases] of Object.entries(PLACE_NAME_ALIASES)) {
    assert.ok(placeIds.has(id));
    assert.ok(aliases.length > 0);
  }
});

test('generic search supports full terms, province searches and short temple names', () => {
  assert.equal(buildPlaceSearch(' วัดพระแก้ว ').flexibleNamePattern, '%พระแก้ว%');
  assert.equal(buildPlaceSearch('ภูมโนรมย์').flexibleNamePattern, '%ภูมโนรมย์%');
  assert.equal(buildPlaceSearch('มุกดาหาร').searchPattern, '%มุกดาหาร%');
  assert.equal(buildPlaceSearch('วัด').flexibleNamePattern, '%วัด%');
  assert.equal(buildPlaceSearch('').searchValue, null);
});

test('wildcards in user queries are escaped and never interpolate SQL', () => {
  assert.equal(buildPlaceSearch('100%_').searchPattern, '%100\\%\\_%');
  assert.equal(buildPlaceSearch('a\\b').searchPattern, '%a\\\\b%');
  assert.equal(buildPlaceSearch({ unexpected: 'object' }).searchValue, null);
});
