# PaiNaiDee: real locations, nearby search and production monitoring

## Scope and evidence

- The live catalogue is served from Railway PostgreSQL through `/api/places` and `/api/places/:id`.
- Seven curated Thai landmarks are added on API startup using `ON CONFLICT (id) DO NOTHING`; existing places and edits are preserved.
- All 11 initial places have `source_name`, `source_url` and `verified_at` (backfilled only when the original lat/lng match); sources are references, not a guarantee of today's opening hours.
- Newly curated places have **no invented star ratings, reviews or place photos**. The four original demo ratings/photos are cleared **only if all original sample values remain unchanged**.
- The map uses the actual Railway catalogue and OpenStreetMap tiles, with mandatory OpenStreetMap attribution.
- Near-me uses explicit browser geolocation permission; `/api/places/nearby?lat=&lng=&radiusKm=&limit=` validates coordinates, radius 1–100 km and max 50 results, computes great-circle distances in PostgreSQL and returns nearest-first. The application does not persist visitors' coordinates in the user database. **As with any GET URL query, upstream web-server/CDN request logs may still record them**; review log retention and privacy policy before enabling sensitive use cases.
- The browser rounds coordinates to three decimal places (about 100 m) before making the API request.
- The nearby list is intentionally limited to the **catalogued places**. It is not every attraction on Google Maps or OpenStreetMap.

## Test before deployment

```bash
npm ci
npm ci --prefix api
npm run type-check
npm run test:run
npm test --prefix api
npm run build
npm run test:e2e:read-only -- --config=playwright.read-only.config.ts
```

The read-only browser suite uses mocked API responses to isolate rendering; it does **not** count as a live-production verification.

## Release order

1. Merge a CI-green PR to the existing `main` (do not expose new write endpoints).
2. Confirm Railway **API** deployed the new commit and that database additive migration/seed finished successfully. The API now exposes `/api/places/nearby`. Confirm `/api/health` reports `database: ok`.
3. Confirm Vercel **frontend** deployed the matching commit on the canonical domain; its `VITE_API_BASE_URL` should point at the existing Railway API. Canonical origin must be allowed by backend CORS.
4. Execute the new workflow **Production Health and Journey Monitor** via GitHub Actions `workflow_dispatch`. The existing frontend/API public URLs are the defaults.
5. The monitor runs hourly. Failures stay visible in Actions and open/comment on a single `Production monitoring failure` GitHub issue, with Playwright failure traces attached to the run. GitHub notifications require the repository notification settings to be enabled by the owner.

Local/runner-only commands after both services have deployed:

```bash
npm run smoke:production
npm run test:e2e:production
```

For a pre-release legacy baseline, `CHECK_NEARBY=false npm run smoke:production` tests only old endpoints; it **cannot certify** the new map/nearby feature.

## Incident handling

1. Open the failing Actions run and identify `frontend-home`, `railway-health-database`, `catalogue-search`, `place-details`, `nearby-spatial-search`, `nearby-invalid-input-rejected`, or browser journey failure.
2. For API health/database failures, inspect Railway deployment status, PostgreSQL connectivity, and API logs first. Do not patch DB credentials or turn off checks without identifying the cause.
3. For browser-only failures, inspect the uploaded Playwright trace, Vercel deployment and JavaScript console/network logs; verify the backend CORS allowlist includes the actual canonical domain.
4. Roll back the frontend independently if necessary. The API schema change is additive; never drop `places`, `media` or provenance columns as part of an emergency rollback.
5. After correction, rerun `workflow_dispatch`, verify the issue is resolved and close it manually.

## Accuracy limitations

- Latitude/longitude and identity are source-referenced. Opening times, entrances, closure notices, admission prices, live route/travel time, accessibility and user-generated reviews are **not** verified real-time; do not display such claims without a current authoritative feed.
- The map's tile service is third-party OpenStreetMap. Respect its fair-use policy, retain attribution, and plan an appropriate production tile provider as traffic increases.
- The curated list is currently small and static (11 seeded entries plus any records already added by administrators). It is not a nationwide authoritative tourism database. For full-scale coverage, integrate licensed TAT/government/open-data feeds with source auditing and regular updates.
- Current monitoring is hourly synthetic checks and API logs, not full application error analytics. Adding hosted Sentry/OpenTelemetry requires privacy review, a DSN, a data-retention policy and user opt-in where applicable.
