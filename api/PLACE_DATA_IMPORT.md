# Nationwide place seed import gate

The curated seed is a minimum coverage catalogue, **not** an exhaustive list of
Thai attractions. The baseline before TAT release 001 was 110 locations in all
77 provinces; release 001 raised this to 115, release 002 raised it to 120,
release 003 raised it to 123, and the individually checked release 004 raises
it to 127, still covering 77 provinces.

Before changing or deploying the bundled seed, run:

```sh
cd api
npm run audit:places
npm test
```

`audit:places` is read-only, uses no Railway credentials, and exits nonzero for
blocking issues. `ensureSchema()` invokes the same gate **before database
connections or writes**; an invalid seed cannot partially import on startup.

Blocking checks: unique IDs and normalized Thai/English names within the same
province, known province/category, usable description, HTTPS source and source
name, numeric Thailand-bounded coordinates, zero unverified seed ratings and
review counts, valid image URLs, linked place IDs, Wikimedia credit/license
metadata, and existence of local user-provided gallery files **when the web
assets are present** (full-repository CI). API-only Railway deploys verify the
strict approved production URL and filename, as the public assets are hosted
separately on Vercel. All 77 provinces
must be represented. Warnings include approximate pins reused by different
records and places without verified photographs.

New provinces in v5: Phichit (Wat Tha Luang) and Sing Buri (Bang Rachan Heroes
Monument). Both pins approximate grounds, **not** verified entrances. Both lack
verified photographs, so no substitutes or fabricated credits are seeded.

This gate validates **bundled seed data**, not arbitrary records already
stored in Railway, and does not independently verify remote webpage uptime,
photo subject identity, geographic province boundaries or source truth. For a
bulk external import, stage and review the source records, verify real-world
identities and images manually, then pass the final normalized batch through
this gate before any production write. Never delete or overwrite editorial
records because a seed differs.
# TAT Open Data incremental release

On 2026-11-04 the first five separately reviewed TAT Open Data records were
added as `api/additional-tat-open-data-batch-001.cjs`, bringing the bundled
catalogue to **115 places covering all 77 provinces**. See the independent
source and location evidence in `TAT_OPEN_DATA_RELEASE_BATCH_001.md`. All
remaining source records require staged QA; do not mass-seed the TAT CSV.

The second separately sourced five-place release is
`api/additional-tat-open-data-batch-002.cjs`; its official source cross-checks,
corrected English title, and deliberately withheld wrong-province English
description are documented in `TAT_OPEN_DATA_RELEASE_BATCH_002.md`.

The third three-place release from source rows 124–173 is
`api/additional-tat-open-data-batch-003.cjs`, documented with independent
public-sector corroboration in `TAT_OPEN_DATA_RELEASE_BATCH_003.md`.

The fourth four-place release from source rows 174–217 is
`api/additional-tat-open-data-batch-004.cjs`, documented in
`TAT_OPEN_DATA_RELEASE_BATCH_004.md`. Its remaining candidates stay staged.

