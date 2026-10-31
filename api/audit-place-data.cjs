// CI/operator dry-run: validates the entire bundled catalogue without Railway.
const { SEED_PLACES } = require('./postgres-db.cjs');
const { auditPlaceImport } = require('./place-quality.cjs');
const audit = auditPlaceImport({
  places: SEED_PLACES,
  wikimediaMedia: require('./curated-wikimedia-media.json'),
  missingMedia: require('./verified-missing-commons-media.json'),
  userMedia: require('./user-provided-place-media.json'),
  requireFullCoverage: true,
});
console.log(JSON.stringify(audit, null, 2));
if (audit.errors.length) process.exitCode = 1;
