const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, readFileSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { parseCsv, parseData, normalizeRecord, stageBatch, sha256 } = require('./tat-open-data.cjs');

const record = (overrides = {}) => ({
  ATT_ID: '20260209144621000',
  ATT_NAME_TH: 'เมืองเก่าสตูล', ATT_NAME_EN: 'Satun Old Town',
  ATT_DETAIL_TH: 'ย่านเมืองเก่าสตูลมีประวัติศาสตร์และความหลากหลายทางวัฒนธรรมในพื้นที่',
  PROVINCE_NAME_TH: 'สตูล', ATT_CATEGORY: '2', ATT_TYPE: '32',
  LATITUDE: '6.6212', LONGITUDE: '100.0652', ...overrides,
});

test('parses official-style CSV with quoted commas, quotes and embedded newlines', () => {
  const csv = '\uFEFFATT_ID,ATT_NAME_TH,ATT_DETAIL_TH\r\n"42","วัดตัวอย่าง","ด้านหน้า, ประวัติ ""ท้องถิ่น""\nส่วนที่สอง"\r\n';
  assert.deepEqual(parseCsv(csv), [{ ATT_ID: '42', ATT_NAME_TH: 'วัดตัวอย่าง', ATT_DETAIL_TH: 'ด้านหน้า, ประวัติ "ท้องถิ่น"\nส่วนที่สอง' }]);
  assert.equal(parseData('[{"id":"1"}]', 'json').length, 1);
  assert.throws(() => parseCsv('a,b\n1\n'), /expected 2/);
});

test('accepts sourced Thai place without fabricating rating, media or translation', () => {
  const result = normalizeRecord(record({ ATT_NAME_EN: '-' }));
  assert.equal(result.place.id, 'tat-20260209144621000');
  assert.equal(result.place.name, 'เมืองเก่าสตูล');
  assert.equal(result.place.nameLocal, 'เมืองเก่าสตูล');
  assert.equal(result.place.rating, 0);
  assert.equal(result.place.reviewCount, 0);
  assert.equal(result.place.imageUrl, null);
  assert.match(result.place.sourceUrl, /^https:\/\/datacatalog\.tat\.or\.th\//);
});

test('blocks rows without independently verifiable province, description, coordinates or classification', () => {
  assert.equal(normalizeRecord(record({ PROVINCE_NAME_TH: '', ATT_PROVINCE_ID: '1058' })).reason, 'missing_or_unknown_province');
  assert.equal(normalizeRecord(record({ ATT_DETAIL_TH: '-' })).reason, 'insufficient_description');
  assert.equal(normalizeRecord(record({ LATITUDE: '', LONGITUDE: '' })).reason, 'missing_or_invalid_coordinates');
  assert.equal(normalizeRecord(record({ ATT_CATEGORY: '3', ATT_TYPE: '65' })).reason, 'unreviewed_category');
  assert.equal(normalizeRecord(record({ ATT_ID: 20260209144621000 })).reason, 'invalid_source_id');
});

test('limits each batch, preserves source checksum, reports rejected records and does not publish', () => {
  const records = [record({ ATT_ID: '01' }), record({ ATT_ID: '02', ATT_NAME_TH: 'หาดทดสอบ', ATT_NAME_EN: 'Test Beach', ATT_TYPE: '19', ATT_CATEGORY: '1' }), record({ ATT_ID: '03', ATT_NAME_TH: 'น้ำตกอันที่สาม', ATT_NAME_EN: 'Third Falls', ATT_CATEGORY: '1' })];
  const digest = sha256('official input');
  const batch = stageBatch({ records, inputSha256: digest, maxBatchSize: 2 });
  assert.equal(batch.status, 'requires_manual_review');
  assert.equal(batch.source.sha256, digest);
  assert.equal(batch.scope.nextIndex, 2);
  assert.equal(batch.candidates.length, 2);
  assert.deepEqual(batch.candidates.map(x => x.category), ['Culture', 'Beach']);
  assert.deepEqual(batch.audit.errors, []);
  assert.ok(batch.safeguards.includes('not_published'));
  assert.throws(() => stageBatch({ records, inputSha256: digest, maxBatchSize: 26 }), /between 1 and 25/);
});

test('detects duplicate Thai places, IDs and empty batches rather than inventing data', () => {
  const digest = sha256('official');
  const batch = stageBatch({ records: [record(), record({ ATT_ID: 'different' })], inputSha256: digest,
    existingPlaces: [{ id: 'curated', nameLocal: 'เมืองเก่าสตูล', province: 'สตูล' }] });
  assert.equal(batch.candidates.length, 0);
  assert.equal(batch.rejectionCounts.duplicate_in_seed_or_batch, 2);
  assert.equal(batch.scope.nextIndex, 2);
});

test('CLI produces a review-only manifest and refuses to overwrite a previous batch', t => {
  const folder = mkdtempSync(join(tmpdir(), 'tat-staging-test-'));
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  const source = join(folder, 'attraction.csv');
  const output = join(folder, 'batch.json');
  writeFileSync(source, 'ATT_ID,ATT_NAME_TH,ATT_NAME_EN,ATT_DETAIL_TH,PROVINCE_NAME_TH,ATT_CATEGORY,ATT_TYPE,LATITUDE,LONGITUDE\n"123","ย่านประวัติศาสตร์สมมุติสตูล","","ย่านประวัติศาสตร์ที่ใช้ทดสอบการนำเข้าเท่านั้น","สตูล","2","32","6.61","100.08"\n');
  const { main } = require('./stage-tat-open-data.cjs');
  const originalWrite = process.stdout.write;
  try {
    process.stdout.write = () => true;
    const batch = main(['--input', source, '--output', output]);
    assert.equal(batch.candidates.length, 1);
    assert.equal(batch.status, 'requires_manual_review');
    assert.equal(JSON.parse(readFileSync(output, 'utf8')).source.columns.length, 9);
    assert.deepEqual(JSON.parse(readFileSync(output, 'utf8')).source.locationSamples, []);
    assert.throws(() => main(['--input', source, '--output', output]), /EEXIST/);
  } finally { process.stdout.write = originalWrite; }
});
