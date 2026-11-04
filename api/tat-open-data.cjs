// Review-only adapter for TAT's published tourism-attractions open dataset.
// It never writes to Railway or calls Google Places. The source has to be
// downloaded from the official TAT catalog by an authorized operator.
const { createHash } = require('node:crypto');
const { PROVINCE_EN } = require('./place-localizations.cjs');
const { auditPlaceImport } = require('./place-quality.cjs');

const TAT_DATASET_URL = 'https://datacatalog.tat.or.th/dataset/tourist-attraction';
const MAX_BATCH_SIZE = 25;
const MAX_SCAN_ROWS = 1000;
const PROVINCES = new Set(Object.keys(PROVINCE_EN));

function parseCsv(contents) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const input = String(contents).replace(/^\uFEFF/, '');
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (inQuotes) {
      if (character === '"' && input[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') inQuotes = false;
      else field += character;
    } else if (character === '"' && field.length === 0) {
      inQuotes = true;
    } else if (character === ',') {
      row.push(field); field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      row.push(field); field = '';
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
    } else {
      field += character;
    }
  }
  if (inQuotes) throw new Error('CSV contains an unterminated quoted field');
  if (row.length || field.length) {
    row.push(field);
    if (row.some(value => value.trim())) rows.push(row);
  }
  if (rows.length < 2) throw new Error('CSV must contain a header and at least one data row');
  const headers = rows.shift().map(value => value.trim());
  if (new Set(headers.map(value => value.toUpperCase())).size !== headers.length)
    throw new Error('CSV contains duplicate header names');
  return rows.map((values, index) => {
    if (values.length !== headers.length)
      throw new Error(`CSV row ${index + 2} has ${values.length} fields; expected ${headers.length}`);
    return Object.fromEntries(headers.map((name, column) => [name, values[column]]));
  });
}

function parseData(contents, format) {
  if (format === 'csv') return parseCsv(contents);
  if (format !== 'json') throw new Error('Only .csv and .json inputs are supported');
  const json = JSON.parse(contents);
  const records = Array.isArray(json) ? json : json.records ?? json.data ?? json.results;
  if (!Array.isArray(records)) throw new Error('JSON must contain an array of attraction records');
  return records;
}

function normalizeName(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase('th').replace(/[\s\u200b\-_.()]+/g, '');
}

function pick(record, ...names) {
  const keys = new Map(Object.keys(record).map(key => [key.toUpperCase(), key]));
  for (const name of names) {
    const key = keys.get(name.toUpperCase());
    if (key !== undefined && record[key] !== null && String(record[key]).trim() !== '' && String(record[key]).trim() !== '-')
      return record[key];
  }
  return null;
}

function cleaned(value, maxLength = 1200) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeProvince(value) {
  const province = cleaned(value, 100).replace(/^จังหวัด/, '');
  if (province === 'กรุงเทพมหานคร') return 'กรุงเทพฯ';
  return PROVINCES.has(province) ? province : '';
}

function mapCategory(record) {
  const category = cleaned(pick(record, 'ATT_CATEGORY', 'CATEGORY'), 40).toLowerCase();
  const type = cleaned(pick(record, 'ATT_TYPE', 'TYPE'), 40);
  // TAT type 19 is a beach. Other numbered types need a separately reviewed
  // mapping; do not silently misclassify restaurants, museums or activities.
  if (type === '19' || category === 'beach') return 'Beach';
  if (category === '1' || category === 'nature') return 'Nature';
  if (category === '2' || category === 'culture') return 'Culture';
  if (category === 'food') return 'Food';
  return null;
}

function normalizeRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { reason: 'invalid_record' };
  const originalSourceId = pick(record, 'ATT_ID', 'ATTRACTION_ID', 'attractionId', 'id');
  // Many TAT IDs are 17 digits. JSON numeric values would silently lose
  // precision in JavaScript; use strings from CSV instead.
  if (typeof originalSourceId === 'number' && !Number.isSafeInteger(originalSourceId))
    return { reason: 'invalid_source_id' };
  const sourceId = cleaned(originalSourceId, 80);
  const nameLocal = cleaned(pick(record, 'ATT_NAME_TH', 'NAME_TH', 'nameTH', 'nameLocal'), 160);
  const nameEn = cleaned(pick(record, 'ATT_NAME_EN', 'NAME_EN', 'nameEN'), 160);
  const province = normalizeProvince(pick(record, 'PROVINCE_NAME_TH', 'ATT_PROVINCE_NAME_TH', 'PROVINCE_TH', 'province', 'provinceNameTh'));
  const description = cleaned(pick(record, 'ATT_DETAIL_TH', 'DETAIL_TH', 'attractionDetail', 'descriptionTH', 'description'), 1200);
  const descriptionEn = cleaned(pick(record, 'ATT_DETAIL_EN', 'DETAIL_EN', 'descriptionEN'), 1200);
  const category = mapCategory(record);
  const location = record.gpsLocation && typeof record.gpsLocation === 'object' ? record.gpsLocation : {};
  // Official 2026 TAT CSV uses ATT_LOCATION = "latitude, longitude".
  // Require exactly two decimal numbers; reject anything ambiguous rather
  // than geocoding from a guessed province or reversing their order.
  const sourceLocation = String(pick(record, 'ATT_LOCATION') || '');
  const locationPair = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(sourceLocation);
  const latitude = pick(record, 'ATT_LATITUDE', 'ATT_GPS_LATITUDE', 'GPS_LATITUDE', 'LATITUDE', 'LAT', 'GPS_LAT') ?? location.latitude ?? locationPair?.[1];
  const longitude = pick(record, 'ATT_LONGITUDE', 'ATT_GPS_LONGITUDE', 'GPS_LONGITUDE', 'LONGITUDE', 'LNG', 'LON', 'GPS_LNG') ?? location.longitude ?? locationPair?.[2];
  const lat = latitude === null || latitude === undefined ? NaN : Number(latitude);
  const lng = longitude === null || longitude === undefined ? NaN : Number(longitude);

  if (!/^[A-Za-z0-9_-]{1,64}$/.test(sourceId)) return { reason: 'invalid_source_id' };
  if (!/[\u0e01-\u0e5b]/.test(nameLocal)) return { reason: 'missing_thai_name' };
  if (!province) return { reason: 'missing_or_unknown_province' };
  if (!category) return { reason: 'unreviewed_category' };
  if (description.length < 15) return { reason: 'insufficient_description' };
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 5 || lat > 21 || lng < 97 || lng > 106)
    return { reason: 'missing_or_invalid_coordinates' };

  return { place: {
    id: `tat-${sourceId}`, name: nameEn || nameLocal, nameLocal,
    province, category, rating: 0, reviewCount: 0,
    imageUrl: null, description, descriptionEn: descriptionEn || null,
    tags: [], lat, lng,
    sourceName: 'Tourism Authority of Thailand — Open Data',
    sourceUrl: TAT_DATASET_URL,
  } };
}

function stageBatch({ records, inputSha256, startIndex = 0, maxBatchSize = MAX_BATCH_SIZE,
  scanLimit = MAX_SCAN_ROWS, province = '', existingPlaces = [] }) {
  if (!Array.isArray(records)) throw new TypeError('records must be an array');
  if (!/^[0-9a-f]{64}$/.test(inputSha256)) throw new Error('inputSha256 must be a SHA-256 digest');
  if (!Number.isSafeInteger(startIndex) || startIndex < 0 || startIndex > records.length) throw new Error('Invalid startIndex');
  if (!Number.isSafeInteger(maxBatchSize) || maxBatchSize < 1 || maxBatchSize > MAX_BATCH_SIZE)
    throw new Error(`Batch size must be between 1 and ${MAX_BATCH_SIZE}`);
  if (!Number.isSafeInteger(scanLimit) || scanLimit < 1 || scanLimit > MAX_SCAN_ROWS)
    throw new Error(`scanLimit must be between 1 and ${MAX_SCAN_ROWS}`);
  if (province && !PROVINCES.has(province)) throw new Error('Unknown province filter');
  const keys = new Set(existingPlaces.map(place => `${place.province}:${normalizeName(place.nameLocal || place.name)}`));
  const englishKeys = new Set(existingPlaces.map(place => `${place.province}:${normalizeName(place.name)}`));
  const ids = new Set(existingPlaces.map(place => place.id));
  const candidates = [];
  const rejected = [];
  const reasons = {};
  let cursor = startIndex;
  while (cursor < records.length && cursor - startIndex < scanLimit && candidates.length < maxBatchSize) {
    const index = cursor++;
    const normalized = normalizeRecord(records[index]);
    let reason = normalized.reason;
    const place = normalized.place;
    if (!reason && province && place.province !== province) reason = 'other_province';
    const key = place ? `${place.province}:${normalizeName(place.nameLocal)}` : '';
    const englishKey = place ? `${place.province}:${normalizeName(place.name)}` : '';
    if (!reason && (keys.has(key) || englishKeys.has(englishKey) || ids.has(place.id))) reason = 'duplicate_in_seed_or_batch';
    if (reason) {
      rejected.push({ row: index + 1, reason });
      reasons[reason] = (reasons[reason] || 0) + 1;
      continue;
    }
    keys.add(key);
    englishKeys.add(englishKey);
    ids.add(place.id);
    candidates.push(place);
  }
  const audit = auditPlaceImport({ places: candidates });
  if (audit.errors.length) throw new Error(`Staged batch did not pass the seed quality gate: ${audit.errors.join('; ')}`);
  return {
    schemaVersion: 1,
    source: { name: 'Tourism Authority of Thailand', url: TAT_DATASET_URL,
      license: 'Open Data Common', sha256: inputSha256 },
    status: 'requires_manual_review',
    scope: { province: province || null, startIndex, nextIndex: cursor, totalInputRecords: records.length,
      scanned: cursor - startIndex, batchSize: maxBatchSize },
    candidates, rejected, rejectionCounts: reasons,
    audit: { errors: audit.errors, warnings: audit.warnings, coverage: audit.coverage },
    safeguards: ['not_published', 'no_google_requests', 'verify_license_and_source',
      'review_location_and_description', 'check_railway_duplicates_before_publication'],
  };
}

function sha256(value) { return createHash('sha256').update(value).digest('hex'); }

module.exports = { TAT_DATASET_URL, MAX_BATCH_SIZE, parseCsv, parseData,
  normalizeRecord, stageBatch, sha256 };
