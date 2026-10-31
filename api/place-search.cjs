// Search variants for real place names. Keep aliases tied to stable catalogue IDs,
// so display names and image/media records never need to be changed for search.
const PLACE_NAME_ALIASES = Object.freeze({
  '2': ['วัดพระแก้ว', 'วัดพระศรีรัตนศาสดาราม', 'Temple of the Emerald Buddha'],
  'curated-wat-arun': ['วัดแจ้ง', 'วัดอรุณ', 'Temple of Dawn'],
  'curated-wat-pho': ['วัดโพธิ์', 'วัดพระเชตุพน', 'Temple of the Reclining Buddha'],
  'curated-wat-phu-manorom': [
    'วัดภูมโนรมย์',
    'ภูมโนรมย์',
    'วัดพระพุทธบาทภูมโนรมย์',
    'วัดพระพุทธบาท ภูมโนรมย์',
    'Wat Phu Manorom',
    'Phu Manorom Temple',
  ],
});

function normalizeAlias(value) {
  return value.normalize('NFKC').toLowerCase()
    .replace(/[\s\u200B-\u200D\uFEFF\p{P}\p{S}]+/gu, '');
}

function escapeLike(value) {
  // PostgreSQL ILIKE uses backslash as the default wildcard escape character.
  return value.replace(/[\\%_]/g, '\\$&');
}

function buildPlaceSearch(search) {
  const searchValue = typeof search === 'string'
    ? search.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, ' ').trim().replace(/\s+/g, ' ')
    : '';

  if (!searchValue) {
    return { searchValue: null, searchPattern: null, flexibleNamePattern: null, aliasPlaceId: null };
  }

  const normalized = normalizeAlias(searchValue);
  const aliasPlaceId = Object.entries(PLACE_NAME_ALIASES)
    .find(([, aliases]) => aliases.some(alias => normalizeAlias(alias) === normalized))?.[0] || null;

  // Accept shorter commonly spoken Thai temple names, e.g. "วัดภูมโนรมย์",
  // and words separated by spaces, e.g. "วัดพระพุทธบาท ภูมโนรมย์".
  // The unmodified query is searched too, preserving normal exact/partial hits.
  let flexibleName = searchValue.replace(/^(?:วัด\s*|wat\s+)(?=.{2,})/iu, '').trim();
  if (!flexibleName) flexibleName = searchValue;

  return {
    searchValue,
    searchPattern: `%${escapeLike(searchValue)}%`,
    flexibleNamePattern: `%${flexibleName.split(/\s+/).map(escapeLike).join('%')}%`,
    aliasPlaceId,
  };
}

module.exports = { PLACE_NAME_ALIASES, buildPlaceSearch };
