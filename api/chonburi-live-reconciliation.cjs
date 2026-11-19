'use strict';
// Audits public API snapshots against the original 194-row TAT disposition.
// This module has no database client, mutations, or Google Maps calls.
const { createHash } = require('node:crypto');
const { parseData } = require('./tat-open-data.cjs');

const PROVINCE = 'ชลบุรี';
const EXPECTED_ROWS = 194;
const STATUSES = new Set([
  'published_seed', 'duplicate_alias_of_published', 'pending_category_location_review',
  'missing_usable_thai_name', 'pending_individual_verification',
]);

const nameKey = value => String(value || '').normalize('NFKC').toLocaleLowerCase('th')
  .replace(/[\s\u200b._\-()[\]]+/g, '');
const requireValid = (condition, message) => { if (!condition) throw new Error(message); };

function parseDispositions(contents, expectedRows = EXPECTED_ROWS) {
  const lines = String(contents).trim().split(/\r?\n/);
  const provenance = lines.find(line => line.startsWith('# Official TAT CSV provenance SHA-256: '));
  const sourceSha256 = provenance?.match(/[0-9a-f]{64}$/)?.[0];
  requireValid(Boolean(sourceSha256), 'TAT source checksum missing from disposition');
  const dataLines = lines.filter(line => line && !line.startsWith('#'));
  const header = dataLines.shift()?.split('\t') || [];
  const required = ['csv_row', 'tat_id', 'thai_name', 'latitude', 'longitude', 'disposition'];
  for (const key of required) requireValid(header.includes(key), `Missing TSV column ${key}`);
  requireValid(dataLines.length === expectedRows, `Expected ${expectedRows} TAT rows, found ${dataLines.length}`);
  const ids = new Set();
  const rows = dataLines.map((line, index) => {
    const fields = line.split('\t');
    requireValid(fields.length === header.length, `Incorrect TSV width on row ${index + 1}`);
    const row = Object.fromEntries(header.map((column, columnIndex) => [column, fields[columnIndex]]));
    requireValid(/^tat-[A-Za-z0-9_-]+$/.test(row.tat_id), `Invalid TAT ID on row ${index + 1}`);
    requireValid(!ids.has(row.tat_id), `Duplicate source ID ${row.tat_id}`);
    requireValid(STATUSES.has(row.disposition), `Unknown disposition for ${row.tat_id}`);
    requireValid(Number.isSafeInteger(Number(row.csv_row)) && Number(row.csv_row) > 0,
      `Invalid source row for ${row.tat_id}`);
    ids.add(row.tat_id);
    return row;
  });
  return { rows, sourceSha256 };
}

function verifyOfficialSource(csvBytes, dispositions) {
  const actualHash = createHash('sha256').update(csvBytes).digest('hex');
  requireValid(actualHash === dispositions.sourceSha256,
    `Official TAT CSV SHA-256 mismatch: expected ${dispositions.sourceSha256}, got ${actualHash}`);
  const records = parseData(csvBytes.toString('utf8'), 'csv');
  for (const row of dispositions.rows) {
    const original = records[Number(row.csv_row) - 1];
    requireValid(original && `tat-${String(original.ATT_ID).trim()}` === row.tat_id,
      `Official TAT CSV row mismatch for ${row.tat_id}`);
    requireValid(String(original.ATT_NAME_TH || '').trim() === row.thai_name,
      `Official TAT CSV name mismatch for ${row.tat_id}`);
    requireValid(String(original.PROVINCE_NAME_TH || '').trim().replace(/^จังหวัด/, '') === PROVINCE,
      `Source row is not in ${PROVINCE}: ${row.tat_id}`);
  }
  const provinceRows = records.filter(record =>
    String(record.PROVINCE_NAME_TH || '').trim().replace(/^จังหวัด/, '') === PROVINCE);
  requireValid(provinceRows.length === dispositions.rows.length,
    `Source has ${provinceRows.length} ${PROVINCE} rows; TSV has ${dispositions.rows.length}`);
  return { sourceRecords: records.length, provinceRows: provinceRows.length, sha256: actualHash };
}

function validatePages(pages) {
  requireValid(Array.isArray(pages) && pages.length > 0, 'At least one API page is required');
  let expectedTotal;
  let expectedLimit;
  const places = [];
  const ids = new Set();
  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    requireValid(page && Array.isArray(page.attractions), `Missing attractions on page ${index + 1}`);
    requireValid(Number.isSafeInteger(page.total) && page.total >= 0, 'Invalid API total');
    requireValid(page.page === index + 1 && Number.isSafeInteger(page.limit) && page.limit > 0,
      `Invalid pagination metadata on page ${index + 1}`);
    if (expectedTotal === undefined) { expectedTotal = page.total; expectedLimit = page.limit; }
    requireValid(page.total === expectedTotal && page.limit === expectedLimit,
      'API snapshot changed between pages');
    requireValid(page.attractions.length <= expectedLimit, 'Page exceeds declared limit');
    for (const place of page.attractions) {
      requireValid(typeof place.id === 'string' && place.id.length > 0, 'Missing place ID');
      requireValid(place.province === PROVINCE, `Place ${place.id} has wrong province`);
      requireValid(!ids.has(place.id), `Duplicate API place ID ${place.id}`);
      ids.add(place.id);
      places.push(place);
    }
    requireValid(page.attractions.length > 0 || expectedTotal === 0,
      `Unexpected empty API page ${index + 1}`);
  }
  requireValid(places.length === expectedTotal,
    `API pagination incomplete: ${places.length} of ${expectedTotal}`);
  return places;
}

function coordinates(place) {
  const lat = place.coordinates?.lat;
  const lng = place.coordinates?.lng;
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 ? { lat, lng } : null;
}

function distanceKm(a, b) {
  const toRad = degrees => degrees * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function reconcile({ dispositions, pages, officialSource = null }) {
  const places = validatePages(pages);
  const byId = new Map(places.map(place => [place.id, place]));
  const byName = new Map();
  for (const place of places) {
    const key = nameKey(place.nameLocal || place.name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(place);
  }
  const matchedIds = new Set();
  const countsByDisposition = {};
  const sourceRows = [];
  const pendingAlreadyLive = [];
  const expectedPublishedAbsent = [];
  const coordinateDeltas = [];
  for (const row of dispositions.rows) {
    if (!countsByDisposition[row.disposition])
      countsByDisposition[row.disposition] = { sourceRows: 0, matchedLive: 0 };
    const count = countsByDisposition[row.disposition];
    count.sourceRows++;
    const exactId = byId.get(row.tat_id);
    const nameMatches = byName.get(nameKey(row.thai_name)) || [];
    const match = exactId || (nameMatches.length === 1 ? nameMatches[0] : null);
    const matchMethod = exactId ? 'tat_id' : match ? 'exact_normalized_thai_name' : null;
    if (match) { count.matchedLive++; matchedIds.add(match.id); }
    if (match && !['published_seed', 'duplicate_alias_of_published'].includes(row.disposition))
      pendingAlreadyLive.push({ tatId: row.tat_id, name: row.thai_name,
        disposition: row.disposition, liveId: match.id });
    if (!match && row.disposition === 'published_seed')
      expectedPublishedAbsent.push({ tatId: row.tat_id, name: row.thai_name });
    const originalLat = row.latitude.trim() === '' ? NaN : Number(row.latitude);
    const originalLng = row.longitude.trim() === '' ? NaN : Number(row.longitude);
    const point = match && coordinates(match);
    if (point && Number.isFinite(originalLat) && Number.isFinite(originalLng)) {
      const differenceKm = distanceKm({ lat: originalLat, lng: originalLng }, point);
      if (differenceKm >= 0.1) coordinateDeltas.push({
        tatId: row.tat_id, name: row.thai_name, liveId: match.id,
        distanceKm: Number(differenceKm.toFixed(3)),
        tat: { lat: originalLat, lng: originalLng }, api: point,
        note: 'Review source versus visitor entrance; do not auto-correct',
      });
    }
    sourceRows.push({ csvRow: Number(row.csv_row), tatId: row.tat_id, name: row.thai_name,
      disposition: row.disposition, liveId: match?.id || null, matchMethod,
      reviewAction: row.review_action, reviewEvidenceOrBlocker: row.review_evidence_or_blocker });
  }
  const exactNameDuplicates = [...byName.entries()].filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({ normalizedName: key, ids: group.map(p => p.id) }));
  const sameCoordinateReview = [];
  for (let i = 0; i < places.length; i++) {
    for (let j = i + 1; j < places.length; j++) {
      const a = coordinates(places[i]), b = coordinates(places[j]);
      if (a && b && distanceKm(a, b) < 0.075) sameCoordinateReview.push({
        ids: [places[i].id, places[j].id],
        names: [places[i].nameLocal || places[i].name, places[j].nameLocal || places[j].name],
        note: 'Close coordinates only: not evidence of duplicate identity',
      });
    }
  }
  const missingPrimaryImage = places.filter(place => !place.publishedPrimaryImage ||
    !place.image || place.image.includes('placeholder-attraction'));
  const missingCreditOnVisibleImage = places.filter(place =>
    place.image && !place.image.includes('placeholder-attraction') &&
    !(place.mediaCredits || []).some(credit => credit?.url === place.image && credit.licenseName));
  const invalidCoordinates = places.filter(place => !coordinates(place));
  const outsideThailandBounds = places.filter(place => {
    const pin = coordinates(place);
    return pin && (pin.lat < 5 || pin.lat > 21 || pin.lng < 97 || pin.lng > 106);
  });
  const incompleteDescription = places.filter(place => !String(place.description || '').trim());
  const unmatchedLive = places.filter(place => !matchedIds.has(place.id))
    .map(place => ({ id: place.id, name: place.nameLocal || place.name }));
  return {
    schemaVersion: 1, province: PROVINCE, status: 'read_only_public_api_reconciliation',
    limits: ['API publication is not a direct Railway PostgreSQL SELECT',
      'TAT provisional dispositions are not independent place verification',
      'Coordinate proximity does not establish a duplicate',
      'No Maps API or licensed photo requests were made'],
    source: {
      dispositionRows: dispositions.rows.length, tatSha256: dispositions.sourceSha256,
      officialCsvVerified: Boolean(officialSource), ...(officialSource || {}),
    },
    live: { published: places.length, uniqueIds: byId.size, pages: pages.length,
      sourceRowsMatched: sourceRows.filter(row => row.liveId).length,
      unmatchedLive: unmatchedLive.length },
    countsByDisposition, sourceRows, pendingAlreadyLive, expectedPublishedAbsent,
    unmatchedLive, exactNameDuplicates, sameCoordinateReview, coordinateDeltas,
    quality: {
      invalidCoordinates: invalidCoordinates.map(place => place.id),
      outsideThailandBounds: outsideThailandBounds.map(place => place.id),
      missingPrimaryImage: missingPrimaryImage.map(place => place.id),
      missingCreditOnVisibleImage: missingCreditOnVisibleImage.map(place => place.id),
      incompleteDescription: incompleteDescription.map(place => place.id),
      missingVerifiedAt: places.filter(place => !place.source?.verifiedAt).map(place => place.id),
    },
  };
}

module.exports = { PROVINCE, EXPECTED_ROWS, nameKey, parseDispositions, verifyOfficialSource,
  validatePages, reconcile, distanceKm };
