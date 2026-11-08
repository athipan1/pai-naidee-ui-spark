const { PLACE_NAME_ALIASES } = require('./place-search.cjs');

// Keep scoring deterministic and explainable. No external AI service or
// PostgreSQL extension is required for the current curated place catalogue.
function normalize(text) {
  return String(text || '').normalize('NFKC').toLowerCase()
    .replace(/[\s\u200B-\u200D\uFEFF\p{P}\p{S}]+/gu, '');
}

function placeNames(place) {
  const names = [place.name, place.name_local || place.nameLocal, ...(PLACE_NAME_ALIASES[place.id] || []), ...(place.aliases || [])];
  for (const value of [...names]) {
    const name = String(value || '');
    if (/^วัด\s*.+/u.test(name)) names.push(name.replace(/^วัด\s*/u, ''));
    if (/^wat\s+.+/i.test(name)) names.push(name.replace(/^wat\s+/i, ''));
  }
  return [...new Set(names.map(normalize).filter(Boolean))];
}

function levenshtein(left, right, maxDistance = 2) {
  const a = Array.from(left);
  const b = Array.from(right);
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let minimum = current[0];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      minimum = Math.min(minimum, current[j]);
    }
    if (minimum > maxDistance) return maxDistance + 1;
    previous = current;
  }
  return previous[b.length];
}

const INTENTS = [
  { words: ['วัด', 'temple'], tag: 'temple', category: 'culture' },
  { words: ['น้ำตก', 'waterfall'], tag: 'waterfall', category: 'nature' },
  { words: ['ชายหาด', 'ทะเล', 'beach'], tag: 'beach', category: 'beach' },
  { words: ['เกาะ', 'island'], tag: 'island', category: 'beach' },
  { words: ['พิพิธภัณฑ์', 'museum'], tag: 'museum', category: 'culture' },
  { words: ['ภูเขา', 'mountain'], tag: 'mountain', category: 'nature' },
  { words: ['ธรรมชาติ', 'nature'], tag: 'nature', category: 'nature' },
];

function matchesIntent(place, intent) {
  const tags = (Array.isArray(place.tags) ? place.tags : []).map(normalize);
  const name = normalize(`${place.name || ''} ${place.name_local || place.nameLocal || ''}`);
  if (tags.includes(intent.tag)) return true;
  if (intent.tag === 'temple') return name.includes('วัด') || /^wat/i.test(place.name || '');
  if (intent.tag === 'waterfall') return name.includes('น้ำตก');
  if (intent.tag === 'island') return name.includes('เกาะ') || /^ko\s/i.test(place.name || '');
  if (intent.tag === 'nature') return normalize(place.category) === 'nature';
  return normalize(place.category) === intent.category && intent.tag === 'beach';
}

function scoreName(query, names) {
  if (!query) return 0;
  let score = 0;
  for (const name of names) {
    if (name === query) score = Math.max(score, 1200);
    else if (name.startsWith(query) && query.length >= 2) score = Math.max(score, 950);
    else if (name.includes(query) && query.length >= 2) score = Math.max(score, 780);
    else if (query.includes(name) && name.length >= 5) score = Math.max(score, 500);
    else if (query.length >= 5 && name.length >= 5) {
      const maxDistance = query.length >= 8 ? 2 : 1;
      const distance = levenshtein(query, name, maxDistance);
      if (distance <= maxDistance) score = Math.max(score, 610 - distance * 100);
    }
  }
  return score;
}

function rankPlaces(places, search, category = '', provinceFilter = '') {
  const text = String(search || '').normalize('NFKC').trim().slice(0, 120);
  const query = normalize(text);
  if (!query) return [];
  const provinces = [...new Set(places.flatMap(place => [place.province, place.province_en || place.provinceEn]).filter(Boolean))]
    .sort((left, right) => normalize(right).length - normalize(left).length);
  const province = provinces.find(name => query.includes(normalize(name)));
  const provinceKey = normalize(province);
  const intent = INTENTS.find(item => item.words.some(word => query.includes(normalize(word))));
  const hasNaturalWords = /(?:สวย|แนะนำ|เที่ยว|สถานที่|ใน|แถว|ใกล้|อยากไป|ที่ไหน)/u.test(text);
  const cleaned = province
    ? text.replace(new RegExp(province.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '')
    : text;
  const cleanedQuery = normalize(cleaned.replace(/^(?:วัด\s*|wat\s+)/iu, ''));

  return places.flatMap(place => {
    if (category && normalize(place.category) !== normalize(category)) return [];
    if (provinceFilter && ![place.province, place.province_en || place.provinceEn]
      .some(value => normalize(value) === normalize(provinceFilter))) return [];
    const names = placeNames(place);
    const provinceMatches = !!province && [place.province, place.province_en || place.provinceEn]
      .some(value => normalize(value) === provinceKey);
    if (province && !provinceMatches) return [];
    const intentMatches = intent ? matchesIntent(place, intent) : false;
    const nameScore = Math.max(scoreName(query, names), scoreName(cleanedQuery, names));
    const provinceScore = provinceMatches ? 350 : 0;
    const fullProvinceSearch = provinceMatches && (query === provinceKey || query === normalize(`จังหวัด${province}`));
    const naturalIntent = !!intent && intentMatches && (hasNaturalWords || !!province || query === normalize(intent.words[0]));
    const generalProvinceDiscovery = provinceMatches && /(?:ที่เที่ยว|เที่ยว|สถานที่|แนะนำ|ไปไหนดี|attractions|places)/iu.test(text);
    let score = nameScore;
    if (fullProvinceSearch) score = Math.max(score, 360);
    else if (naturalIntent) score = Math.max(score, 300 + provinceScore);
    else if (generalProvinceDiscovery && !intent) score = Math.max(score, 320);
    if (score === 0 && query.length >= 3 &&
      normalize(`${place.description || ''} ${place.description_en || place.descriptionEn || ''}`).includes(query)) {
      score = 180;
    }
    if (score === 0 && provinceMatches && !cleanedQuery) score = 300;
    if (score === 0) return [];
    return [{ ...place, searchScore: score + (provinceMatches && nameScore ? 40 : 0) }];
  }).sort((a, b) => b.searchScore - a.searchScore ||
    String(a.name).localeCompare(String(b.name)) || String(a.id).localeCompare(String(b.id)));
}

module.exports = { normalize, placeNames, levenshtein, rankPlaces };
