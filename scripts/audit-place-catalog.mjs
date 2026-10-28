// Read-only production data-quality audit. It never writes to Railway.
const apiBase = (process.env.PAINAIDEE_API_URL || 'https://painaidee-api-production.up.railway.app').replace(/\/$/, '');
const limit = 50;
const maxPages = 20;

const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase('th')
  .replace(/[\p{P}\p{Z}\s]/gu, '');

function groupDuplicates(places, keyOf) {
  const groups = new Map();
  for (const place of places) {
    const key = keyOf(place);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) || []), place]);
  }
  return [...groups.values()].filter(group => group.length > 1)
    .map(group => group.map(({ id, nameLocal, province }) => ({ id, nameLocal, province })));
}

export function auditPlaces(places) {
  const duplicateIds = groupDuplicates(places, p => p.id);
  const duplicateNames = groupDuplicates(places, p => `${normalize(p.nameLocal || p.name)}|${normalize(p.province)}`);
  const imageGroups = new Map();
  for (const place of places) {
    if (!place.image) continue;
    imageGroups.set(place.image, [...(imageGroups.get(place.image) || []), place]);
  }
  const repeatedPhotos = [...imageGroups.entries()].filter(([, group]) => group.length > 1)
    .map(([url, group]) => ({ url, places: group.map(p => ({ id: p.id, name: p.nameLocal || p.name })) }));

  const missingPhotos = places.filter(p => !p.image).map(p => ({ id: p.id, name: p.nameLocal || p.name }));
  const invalidCoordinates = places.filter(p => !Number.isFinite(p.coordinates?.lat)
    || !Number.isFinite(p.coordinates?.lng)
    || p.coordinates.lat < 5 || p.coordinates.lat > 22
    || p.coordinates.lng < 97 || p.coordinates.lng > 106).map(p => p.id);
  const uncreditedPhotos = places.filter(p => p.image
    && !p.mediaCredits?.some(credit => credit.url === p.image && credit.sourcePage && credit.licenseUrl)).map(p => p.id);
  const missingSource = places.filter(p => !p.source?.url).map(p => p.id);
  const missingTranslations = places.filter(p => !p.nameLocal || !p.descriptionEn || !p.provinceEn).map(p => p.id);

  return {
    total: places.length,
    uniqueIds: new Set(places.map(p => p.id)).size,
    duplicateIds,
    duplicateNames,
    missingPhotos,
    repeatedPhotos,
    invalidCoordinates,
    uncreditedPhotos,
    missingSource,
    missingTranslations,
  };
}

async function fetchPlaces() {
  const all = [];
  let total;
  for (let page = 1; page <= maxPages; page++) {
    const url = `${apiBase}/api/places?${new URLSearchParams({ page: String(page), limit: String(limit) })}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Failed to read Railway page ${page}: HTTP ${response.status}`);
    const body = await response.json();
    if (!Array.isArray(body.attractions) || !Number.isInteger(body.total)) throw new Error('Unexpected Railway API response');
    total = body.total;
    all.push(...body.attractions);
    if (all.length >= total) return all;
    if (body.attractions.length === 0) throw new Error('Unexpected empty Railway page');
  }
  throw new Error(`Catalogue exceeds ${maxPages} pages; audit was not complete (reported total: ${total})`);
}

if (process.argv[1]?.endsWith('audit-place-catalog.mjs')) {
  try {
    const report = auditPlaces(await fetchPlaces());
    console.log(JSON.stringify(report, null, 2));
    if (report.duplicateIds.length || report.duplicateNames.length
        || report.invalidCoordinates.length || report.uncreditedPhotos.length || report.missingSource.length) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
