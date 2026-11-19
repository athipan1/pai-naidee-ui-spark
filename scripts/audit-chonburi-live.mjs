#!/usr/bin/env node
// Explicit read-only reconciliation; no SQL connection, imports, writes, or Maps calls.
// Examples:
//   node scripts/audit-chonburi-live.mjs --live --tat-csv /tmp/attraction.csv
//   node scripts/audit-chonburi-live.mjs --pages /tmp/page-1.json /tmp/page-2.json --tat-csv /tmp/attraction.csv
// A JSON report is printed to stdout; redirect it to a local review artifact if needed.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseDispositions, verifyOfficialSource, reconcile, PROVINCE } =
  require('../api/chonburi-live-reconciliation.cjs');
const here = dirname(fileURLToPath(import.meta.url));
const defaultTsv = join(here, '../api/chonburi-tat-194-row-dispositions.tsv');
const base = (process.env.PAINAIDEE_API_URL ||
  'https://painaidee-api-production.up.railway.app').replace(/\/+$/, '');

async function fetchPages() {
  const pages = [];
  let count = 0;
  for (let number = 1; number <= 40; number++) {
    const url = `${base}/api/places?province=${encodeURIComponent(PROVINCE)}&page=${number}&limit=50`;
    const response = await fetch(url, {
      method: 'GET', headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000), redirect: 'error', cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Public API returned HTTP ${response.status} on page ${number}`);
    const page = await response.json();
    pages.push(page);
    count += Array.isArray(page.attractions) ? page.attractions.length : 0;
    if (Number.isSafeInteger(page.total) && count >= page.total) return pages;
    if (!Array.isArray(page.attractions) || page.attractions.length === 0)
      throw new Error(`Public API stopped at ${count} records before reaching total`);
  }
  throw new Error('Public API exceeded 40-page safety limit');
}

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes('--live');
  const pagesArg = args.indexOf('--pages');
  const sourceArg = args.indexOf('--tat-csv');
  const allowed = new Set(['--live', '--pages', '--tat-csv']);
  if (args.some(arg => arg.startsWith('--') && !allowed.has(arg)) || live === (pagesArg >= 0))
    throw new Error('Choose exactly one of --live or --pages <page-1.json> ... [--tat-csv <official-csv>]');
  const csvPath = sourceArg >= 0 ? args[sourceArg + 1] : null;
  if (sourceArg >= 0 && (!csvPath || csvPath.startsWith('--')))
    throw new Error('--tat-csv requires a local path');
  const pageFiles = pagesArg < 0 ? [] : args.slice(pagesArg + 1,
    sourceArg > pagesArg ? sourceArg : undefined);
  if (!live && (!pageFiles.length || pageFiles.some(path => path.startsWith('--'))))
    throw new Error('--pages requires one or more JSON files');
  const dispositions = parseDispositions(await readFile(defaultTsv, 'utf8'));
  const source = csvPath ? verifyOfficialSource(await readFile(csvPath), dispositions) : null;
  const pages = live ? await fetchPages() :
    await Promise.all(pageFiles.map(async path => JSON.parse(await readFile(path, 'utf8'))));
  const report = reconcile({ dispositions, pages, officialSource: source });
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

main().catch(error => { console.error('CHONBURI_READONLY_AUDIT_FAIL ' + error.message);
  process.exitCode = 1; });
