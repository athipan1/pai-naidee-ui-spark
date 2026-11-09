# Admin CMS redesign — release evidence

Base: `c4405424265a9e06c51e04817235d2fa467c6e78` (main, audited 2026-11-09).

## Baseline and scope

| Area | Baseline | Change |
|---|---|---|
| Layout | Single stacked screen; AI settings always precede editor | Collapsible sidebar, accessible mobile drawer, overview and separate settings |
| Navigation | New/edit, public catalog, drafts, history, province quality | Preserve every existing area and add pending-review view |
| Draft | Client and server require province/category/Thai coordinates | Name-only draft; absent coordinates stored as null; any supplied pair remains validated |
| Geocoding | Background lookup after name/province | Manual search and explicit coordinate confirmation only |
| Catalog | Shared Thai/English/alias search; 30 per page | Same ranking, server province filter, cancellable requests, thumbnail/table-to-card layout |
| Media | Existing gallery, primary selection, explicit removal, authenticated main preview | Authenticated gallery previews, per-file progress, preserve successful partial uploads |
| Editing | Versioned saves, conflict reconciliation | Retained; warn before leaving unsaved form, recover unsaved work from tab-local storage after reload/back navigation, and disable form during writes |
| Review | Review UI exists but not mounted; direct publication bypasses evidence | Mount existing evidence UI; explicit verify → request review → approve; server enforces approval and rechecks evidence |
| Public images | Shared published-image logic and search-cache invalidation | Retained; publication writes source/credit details through existing finishPublication |
| Auth | Railway session, admin server guard, 401 clears session | Same endpoints and guard; no authentication/authorization implementation changes |

This PR changes no schema, infrastructure, database configuration, quotas, keys, roles or paid services. Backend changes are necessary for draft validation, province filtering, review status and enforcing the requested workflow. Missing review schema fails closed for publication; catalog/draft browsing remains available. Do not run migrations as part of this release.

Dashboard draft/history/review figures refer to the latest 100 CMS records and are labelled accordingly, not presented as global counts. The total published-place count comes from catalog pagination metadata. Updated dates are displayed only where the API returns them. Separate media-library navigation is omitted because there is no independent library API; media stays in each place's editor. Gallery ordering is not added because the current contract has no persistent sort field.

## Test evidence

- Baseline Vitest: 29 files / 137 tests passed.
- Baseline ESLint: 0 errors / 218 existing warnings.
- Updated API unit/security: 250 tests passed.
- TypeScript and changed TSX lint: passed.
- Browser suites use intercepted fixture APIs and private fixture images, never Production writes.
- Chromium desktop/Android: initial full run 14 passed; final run recorded in PR CI.
- Final local Chrome desktop/Android and WebKit iPhone/iPad suites: 28 passed, 0 failed, 0 skipped; CI verifies the final committed revision.
- Width matrix: 320, 360, 375, 390, 430, 768, 1024, 1280 CSS pixels.
- 200% desktop zoom: layout-equivalent 640 CSS-pixel viewport; not a physical-device zoom test.
- No physical Android/iPhone/iPad hardware tested.
- Local WebKit libraries were extracted into scratch; CI uses the existing Playwright install-with-deps step. No dependency or lockfile changes.

## Production baseline (read-only, before release)

- Vercel primary project `prj_4VyXWNAtJZrgMf184vxW1l0dDMr3`: READY, deployment `dpl_Am1yTT7oTwnHZbqUd3QqY46h8p5j`.
- Railway existing API and Postgres: Online, zero recent deployment failures at audit.
- `npm run smoke:production`: 8/8 passed (home, placeholder asset, health/database, catalog/coordinates/CORS, detail, search, nearby, invalid coordinates).
- Railway error-log baseline includes older Google quota exhaustion, upstream AI timeouts and an OSM discovery abort; these predate this change.
- Admin login/write workflow in Production: NOT VERIFIED without an authorized account. No test drafts, uploads, publishes, database writes or AI/Google paid calls were made in Production.
- Railway OAuth exposes variable names only. Read-only Railway Database UI SELECTs subsequently confirmed the existing review tables and exact column names/types: place_reviews (10), place_review_events (10), place_external_ids (5), place_publication_details (4), province_review_boundaries (7). No migration needed, no secrets extracted or printed.

## Release and rollback

1. Require CI tests (including isolated PostgreSQL integration), build, security and browser checks to finish successfully; compare branch with current main.
2. Existing Production review tables and columns were confirmed via read-only UI SQL. Signed-in admin verification remains conditional on an authorized account; record it transparently when unavailable.
3. Merge through the existing GitHub workflow. Use only the primary Vercel project and existing Railway backend; backend must deploy because its contract/validation changed.
4. Verify exact merge SHA in both deployments, then repeat read-only smoke tests. Record account-dependent checks as NOT VERIFIED unless actually executed.
5. On critical UI regression, restore the previous primary Vercel deployment. Freeze publication while investigating backend workflow problems; do not restore the old direct-publish bypass or roll back the database automatically. Preserve immutable evidence/history.

## Screenshots

Screenshots use isolated mock data. Map tiles are intentionally blocked by the fixture network guard. Before/after files are collected beside this report and in the existing CI screenshot artifact.
