const { PLACE_NAME_ALIASES, normalizeSearch: normalize } = require('./place-search.cjs');
const { PROVINCE_EN } = require('./place-localizations.cjs');

const provinceNames = new Map(Object.entries(PROVINCE_EN).flatMap(([th, en]) =>
  [[normalize(th), th], [normalize(en), th]]));
provinceNames.set(normalize('กรุงเทพมหานคร'), 'กรุงเทพฯ');

const provinceLabels = [...provinceNames.keys()].sort((a, b) => b.length - a.length);
const naturalLead = /^(?:.*(?:ใน|แถว|ใกล้|จังหวัด)|ที่เที่ยว|เที่ยว|สถานที่|แนะนำ|ไปไหนดี|attractions|places)$/u;
const discovery = /(?:ที่เที่ยว|เที่ยว|สถานที่|แนะนำ|ไปไหนดี|attractions|places)/iu;

function provinceKey(value) {
  const name = normalize(value).replace(/^จังหวัด/u, '');
  return provinceNames.get(name) || name;
}

function placeProvinces(place) {
  const local = provinceKey(place.province);
  const english = normalize(place.province_en ?? place.provinceEn);
  // A recognized Thai province remains authoritative. A stored alternative
  // spelling can resolve to it, but an unrelated official name cannot.
  return [local, english && (!provinceNames.has(english) || provinceKey(english) === local) ? english : ''];
}

function matchesProvince(keys, filter) {
  return keys.includes(filter);
}

function nameVariants(place) {
  const primary = [place.name, place.name_local || place.nameLocal];
  const aliases = [...(place.aliases || []), ...(PLACE_NAME_ALIASES[place.id] || [])];
  const variants = [];
  for (const value of [...primary, ...aliases]) {
    const name = String(value || '');
    const shorter = name.replace(/^(?:วัด\s*|wat\s+)/iu, '');
    if (shorter !== name && shorter) variants.push(normalize(shorter));
  }
  return {
    primary: primary.map(normalize).filter(Boolean),
    aliases: aliases.map(normalize).filter(Boolean),
    variants,
  };
}

function placeNames(place) {
  const { primary, aliases, variants } = nameVariants(place);
  return [...new Set([...primary, ...aliases, ...variants])];
}

function prepareSearchIndex(places) {
  return places.map(place => ({
    place,
    provinces: placeProvinces(place),
    categories: [place.category, ...(Array.isArray(place.categories) ? place.categories : [])].map(normalize),
    description: normalize(`${place.description || ''} ${place.description_en || place.descriptionEn || ''}`),
    ...nameVariants(place),
  }));
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
  const categories = [place.category, ...(Array.isArray(place.categories) ? place.categories : [])].map(normalize);
  const name = normalize(`${place.name || ''} ${place.name_local || place.nameLocal || ''}`);
  if (tags.includes(intent.tag)) return true;
  if (intent.tag === 'temple') return name.includes('วัด') || /^wat/i.test(place.name || '');
  if (intent.tag === 'waterfall') return name.includes('น้ำตก');
  if (intent.tag === 'island') return name.includes('เกาะ') || /^ko\s/i.test(place.name || '');
  if (intent.tag === 'nature') return categories.includes('nature');
  return categories.includes(intent.category) && intent.tag === 'beach';
}

function scoreName(query, names) {
  if (!query) return 0;
  let score = 0;
  for (const name of names) {
    if (name === query) score = Math.max(score, 1200);
    else if (name.startsWith(query) && query.length >= 2) score = Math.max(score, 950);
    else if (name.includes(query) && query.length >= 2) score = Math.max(score, 780);
    else if (query.includes(name) && name.length >= 5) score = Math.max(score, 700);
    else if (query.length >= 5 && name.length >= 5) {
      const maxDistance = query.length >= 8 ? 2 : 1;
      const distance = levenshtein(query, name, maxDistance);
      if (distance <= maxDistance) score = Math.max(score, 610 - distance * 100);
    }
  }
  return score;
}

function comparePlaces(left, right) {
  return String(left.name).localeCompare(String(right.name)) || String(left.id).localeCompare(String(right.id));
}

function rankSearchIndex(index, search, category = '', provinceFilter = '') {
  const text = String(search || '').normalize('NFKC').trim().slice(0, 200);
  const query = normalize(text);
  const categoryKey = normalize(category);
  const filter = provinceKey(provinceFilter);
  if ((provinceFilter && !filter) || (category && !categoryKey)) return [];
  const candidates = index.filter(row => (!categoryKey || row.categories.includes(categoryKey)) &&
    (!filter || matchesProvince(row.provinces, filter)));
  if (!text) return candidates.map(row => row.place)
    .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || comparePlaces(a, b));
  if (!query) return [];
  const intent = INTENTS.find(item => item.words.some(word => query.includes(normalize(word))));
  const inferred = provinceLabels.find(label => {
    if (!query.endsWith(label)) return false;
    const lead = query.slice(0, -label.length);
    if (!lead || naturalLead.test(lead) || intent?.words.some(word => lead === normalize(word))) return true;
    const englishContext = /\b(?:in|near)\s+(.+)$/iu.exec(text);
    return !!englishContext && normalize(englishContext[1]) === label;
  });
  const inferredKey = provinceKey(inferred);
  const remaining = inferred ? query.slice(0, -inferred.length) : '';
  const fullProvinceSearch = !!inferred && (!remaining || remaining === 'จังหวัด');
  const hasNaturalWords = /(?:สวย|แนะนำ|เที่ยว|สถานที่|ใน|แถว|ใกล้|อยากไป|ที่ไหน)/u.test(text);
  const shortened = normalize(text.replace(/^(?:วัด\s*|wat\s+)/iu, ''));
  const ranked = [];

  for (const row of candidates) {
    const { place, primary, aliases, variants } = row;
    const direct = Number(place.direct_score) || 0;
    let score = primary.includes(query) ? 1200 : aliases.includes(query) ? 1100 : 0;
    // Full names and aliases win before any inferred geographic constraints.
    if (score || direct >= 1100) {
      ranked.push({ ...place, searchScore: Math.max(score, direct) });
      continue;
    }
    const withinProvince = !!inferred && matchesProvince(row.provinces, inferredKey);
    if (inferred && !withinProvince) continue;

    const names = [...primary, ...aliases];
    score = Math.max(scoreName(query, names), direct);
    if (!fullProvinceSearch) {
      const terms = shortened !== query ? [shortened] : [];
      if (withinProvince && remaining) terms.push(remaining.replace(/(?:ใน|แถว|ใกล้|จังหวัด)$/u, ''));
      // A name with its "Wat"/"วัด" prefix removed is a derived match.
      if (variants.length) score = Math.max(score, Math.min(900, scoreName(query, variants)));
      for (const term of terms) {
        score = Math.max(score, Math.min(900, scoreName(term, [...names, ...variants])));
      }
    }
    if (fullProvinceSearch) score = Math.max(score, 360);
    else if (intent && matchesIntent(place, intent) &&
      (hasNaturalWords || withinProvince || query === normalize(intent.words[0]))) score = Math.max(score, withinProvince ? 350 : 300);
    else if (withinProvince && !intent && discovery.test(text)) score = Math.max(score, 320);
    if (!score && query.length >= 3 && row.description.includes(query)) score = 180;
    if (score) ranked.push({ ...place, searchScore: score });
  }

  return ranked.sort((a, b) => b.searchScore - a.searchScore || comparePlaces(a, b));
}

function rankPlaces(places, search, category = '', province = '') {
  return rankSearchIndex(prepareSearchIndex(places), search, category, province);
}

module.exports = { normalize, placeNames, levenshtein, prepareSearchIndex, rankSearchIndex, rankPlaces };
