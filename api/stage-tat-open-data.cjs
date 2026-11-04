#!/usr/bin/env node
// Offline first: the official file must be supplied locally. This command
// creates a review manifest only; it does not connect to Railway or publish.
const { readFileSync, writeFileSync } = require('node:fs');
const { extname, resolve } = require('node:path');
const { parseArgs } = require('node:util');
const { parseData, stageBatch, sha256 } = require('./tat-open-data.cjs');

function main(argv = process.argv.slice(2)) {
  const { values } = parseArgs({ args: argv, options: {
    input: { type: 'string' }, output: { type: 'string' },
    province: { type: 'string' }, 'start-index': { type: 'string' },
    limit: { type: 'string' }, 'scan-limit': { type: 'string' },
    'expected-sha256': { type: 'string' },
  }, strict: true });
  if (!values.input || !values.output) throw new Error('Usage: npm run stage:tat -- --input /path/attraction.csv --output /path/batch.json [--province เชียงราย] [--start-index 0]');
  const input = resolve(values.input);
  const output = resolve(values.output);
  if (input === output) throw new Error('Input and output paths must differ');
  const format = extname(input).slice(1).toLowerCase();
  const file = readFileSync(input);
  const digest = sha256(file);
  if (values['expected-sha256'] && values['expected-sha256'] !== digest)
    throw new Error('Source checksum mismatch; refusing to stage modified source data');
  const records = parseData(file.toString('utf8'), format);
  // Existing curated seed is only an early duplicate check. The Railway
  // catalogue must be checked again before any eventual publication.
  const { SEED_PLACES } = require('./postgres-db.cjs');
  const batch = stageBatch({ records, inputSha256: digest,
    startIndex: values['start-index'] === undefined ? 0 : Number(values['start-index']),
    maxBatchSize: values.limit === undefined ? undefined : Number(values.limit),
    scanLimit: values['scan-limit'] === undefined ? undefined : Number(values['scan-limit']),
    province: values.province || '', existingPlaces: SEED_PLACES });
  batch.source.filename = extname(input).toLowerCase() === '.csv' ? 'attraction.csv' : 'attraction.json';
  batch.source.recordCount = records.length;
  batch.source.columns = records[0] && typeof records[0] === 'object' ? Object.keys(records[0]) : [];
  // Public-source schema diagnostics only (no contact fields / photos / keys).
  // These samples help review coordinates before changing the parser.
  batch.source.locationSamples = records
    .filter(row => row && typeof row === 'object' && String(row.ATT_LOCATION || '').trim())
    .slice(0, 8)
    .map(row => ({ location: String(row.ATT_LOCATION).slice(0, 160),
      category: String(row.ATT_CATEGORY || '').slice(0, 32),
      categoryLabel: String(row.ATT_CATEGORY_LABEL || '').slice(0, 100),
      type: String(row.ATT_TYPE || '').slice(0, 32),
      typeLabel: String(row.ATT_TYPE_LABEL || '').slice(0, 100),
      province: String(row.PROVINCE_NAME_TH || '').slice(0, 100) }));
  // wx makes accidental overwriting of an earlier reviewed batch impossible.
  writeFileSync(output, `${JSON.stringify(batch, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  process.stdout.write(`${JSON.stringify({ status: batch.status, output, sha256: digest,
    accepted: batch.candidates.length, rejected: batch.rejected.length,
    rejectionCounts: batch.rejectionCounts, nextIndex: batch.scope.nextIndex,
    totalInputRecords: batch.scope.totalInputRecords,
    inputColumns: batch.source.columns }, null, 2)}\n`);
  return batch;
}

if (require.main === module) {
  try { main(); }
  catch (error) { console.error(`TAT staging failed: ${error.message}`); process.exitCode = 1; }
}

module.exports = { main };
