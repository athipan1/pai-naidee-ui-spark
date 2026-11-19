'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');
const { parseDispositions, verifyOfficialSource, validatePages, reconcile } =
  require('./chonburi-live-reconciliation.cjs');

const officialCsv = 'ATT_ID,ATT_NAME_TH,PROVINCE_NAME_TH\n123,หาดทดสอบ,ชลบุรี\n124,วัดทดสอบ,ชลบุรี\n125,สวนทดสอบ,ชลบุรี\n';
const sha = createHash('sha256').update(officialCsv).digest('hex');
const tsv = [
  `# Official TAT CSV provenance SHA-256: ${sha}`,
  'csv_row\ttat_id\tthai_name\tlatitude\tlongitude\tdisposition\treview_action\treview_evidence_or_blocker',
  '1\ttat-123\tหาดทดสอบ\t13.2\t100.9\tpublished_seed\tnone\tseed',
  '2\ttat-124\tวัดทดสอบ\t13.3\t100.8\tpending_individual_verification\tverify\tmanual',
  '3\ttat-125\tสวนทดสอบ\t13.4\t100.7\tpending_category_location_review\tverify\tmanual',
].join('\n');
const place = (id, name, lat, lng, image = '/placeholder-attraction.svg') => ({
  id, nameLocal: name, province: 'ชลบุรี', coordinates: { lat, lng },
  image, publishedPrimaryImage: image.includes('placeholder') ? null : image,
  mediaCredits: [], description: 'ทดสอบสถานที่', source: { verifiedAt: null },
});
const page = (attractions, total = attractions.length, number = 1, limit = 50) => ({
  attractions, total, page: number, limit,
});

test('full 194-row TAT disposition parses with the pinned provenance digest', () => {
  const contents = readFileSync(join(__dirname, 'chonburi-tat-194-row-dispositions.tsv'), 'utf8');
  const result = parseDispositions(contents);
  assert.equal(result.rows.length, 194);
  assert.equal(result.sourceSha256,
    '2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366');
  assert.equal(new Set(result.rows.map(row => row.tat_id)).size, 194);
});

test('official CSV SHA and row positions are verified; tampering fails closed', () => {
  const dispositions = parseDispositions(tsv, 3);
  assert.deepEqual(verifyOfficialSource(Buffer.from(officialCsv), dispositions), {
    sourceRecords: 3, provinceRows: 3, sha256: sha,
  });
  assert.throws(() => verifyOfficialSource(Buffer.from(officialCsv + 'tampered'), dispositions),
    /SHA-256 mismatch/);
  assert.throws(() => parseDispositions(tsv.replace('tat-125', 'tat-124'), 3), /Duplicate source ID/);
});

test('reconciles seed, pending-but-live, CMS-only, photos and pin differences', () => {
  const dispositions = parseDispositions(tsv, 3);
  const places = [
    place('tat-123', 'หาดทดสอบ', 13.2, 100.9),
    place('cms:abc', 'วัดทดสอบ', 13.31, 100.8),
    place('cms:extra', 'สถานที่พิเศษ', 13.1, 100.8, 'https://example.org/real.jpg'),
  ];
  const report = reconcile({ dispositions, pages: [page(places)] });
  assert.equal(report.live.published, 3);
  assert.equal(report.live.sourceRowsMatched, 2);
  assert.equal(report.live.unmatchedLive, 1);
  assert.equal(report.countsByDisposition.published_seed.matchedLive, 1);
  assert.equal(report.countsByDisposition.pending_individual_verification.matchedLive, 1);
  assert.deepEqual(report.pendingAlreadyLive.map(item => item.tatId), ['tat-124']);
  assert.deepEqual(report.unmatchedLive.map(item => item.id), ['cms:extra']);
  assert.equal(report.coordinateDeltas.length, 1);
  assert.equal(report.quality.missingPrimaryImage.length, 2);
  assert.deepEqual(report.quality.missingCreditOnVisibleImage, ['cms:extra']);
  assert.deepEqual(report.expectedPublishedAbsent, []);
});

test('pagination and province integrity reject duplicates, missing pages and drift', () => {
  const a = place('tat-123', 'หาดทดสอบ', 13.2, 100.9);
  const b = place('tat-124', 'วัดทดสอบ', 13.3, 100.8);
  assert.deepEqual(validatePages([page([a], 2, 1, 1), page([b], 2, 2, 1)]), [a, b]);
  assert.throws(() => validatePages([page([a], 2)]), /incomplete/);
  assert.throws(() => validatePages([page([a], 2, 1, 1), page([a], 2, 2, 1)]), /Duplicate API place ID/);
  assert.throws(() => validatePages([page([a], 2, 1, 1), page([b], 3, 2, 1)]), /changed/);
  assert.throws(() => validatePages([page([{ ...a, province: 'ระยอง' }])]), /wrong province/);
});

test('exact normalized Thai duplicate names are flagged for manual review only', () => {
  const dispositions = parseDispositions(tsv, 3);
  const p = [place('tat-123', 'หาดทดสอบ', 13.2, 100.9),
    place('cms:duplicate', 'หาด ทดสอบ', 13.2, 100.9)];
  const report = reconcile({ dispositions, pages: [page(p)] });
  assert.equal(report.exactNameDuplicates.length, 1);
  assert.equal(report.sameCoordinateReview.length, 1);
  assert.equal(report.live.sourceRowsMatched, 1);
});
