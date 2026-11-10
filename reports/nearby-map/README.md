# Embedded nearby map QA

## Scope and acceptance

Based on main `c27d168316403942b21cac7e8a6fefe1e69eda15` (Explore #396 and lifecycle/image fix #397 included). No repository AGENTS.md found. Existing open PRs were inspected; none implements this feature. `/attraction/:id` uses one shared AttractionDetail component for curated, imported and CMS records. `/explore` redirects to `/discover`.

Acceptance: inline current-place map, 3/5/10/20 km controls defaulting to 5, identical bounded nearby markers/list, canonical self exclusion, safe missing-coordinate/error/empty states, cancel stale requests, preserve published images/credits, verified-entry navigation, Thai/English, mobile scroll and quick actions, no Google calls on opening/panning/zooming, no Production writes or deployment.

## Architecture and API

- Reuse `NearbyRealPlaces`, `useNearbyAttractions`, `/api/places/nearby`, published image resolver, localization helpers and `placeNavigationUrl`.
- Share Leaflet marker assets, ResizeObserver cleanup and non-animated bounds logic in `components/maps/leafletShared.tsx`. Keep #397 teardown protection and OptimizedImage cached-image fix intact.
- Lazy import/mount `NearbyAttractionsMap` within 300px of the section. Fixed 300px mobile / 360px desktop height; explicit activation, no scroll-wheel zoom. Pause returns touch scrolling to the page. Quick map buttons scroll/focus the location section with reduced-motion support.
- Current marker is teal; nearby markers use the existing icon. Popup and equivalent text list share `NearbyPlaceSummary`. React text nodes render names; no place data is injected into Leaflet HTML. Popup Escape/close restores focus. While a popup is open the marker pane is inert to keep obscured markers out of the keyboard/touch order.
- Nearby list is distance ordered, at most 30 cards, and has an explicit limited-results label. Up to 31 markers includes the current place. No clustering dependency added: bounded marker count and equivalent list preserve access when pins overlap.

Existing endpoint (no duplicate service):

`GET /api/places/nearby?lat=18&lng=99&radiusKm=5&excludeId=<canonical-public-id>&limit=30`

`excludeId` is optional and at most 200 characters. `limit` is 1..50, integer. The existing numeric radius range 1..100 km and default 25 remain compatible with Explore; Detail offers only 3/5/10/20. Coordinates are now restricted to the existing Thailand domain box (lat 5..21, lng 97..106), rejecting zero, swapped, blank and non-scalar inputs. This is a domain validation box, not proof of a province boundary or a verified entrance.

Optional response additions: `limit`, `hasMore`. Canonical exclusion happens before limit. Spherical bounding box precedes exact Haversine filtering; stable distance/ID ordering and limit+1 detection precede media aggregation. The existing `(lat,lng)` and media/place indexes are reused. No schema/index/extension migration. `places` is the existing published catalogue; drafts are separate `place_drafts` records and are never joined. The explicit public mapper remains the output boundary. No invented publication-status column or policy changes.

Detail requests use a 30s freshness window, no periodic polling, existing query invalidation and abort signals. Radius/place changes use separate keys; unobserved requests are canceled. HTTP responses retain existing no-store semantics. Other Nearby consumers retain their polling behavior. Backend and frontend changes are additive across deployment order: older backend ignores the optional exclusion/metadata; frontend still excludes its canonical current ID defensively.

Directions keep verified entry coordinates when available; otherwise use the existing name-based external map search with the unverified-entry warning. Nearby data does not claim driving distance or entrance verification. No GPS, Places/Routes API call, tile prefetch, paid service, dependency or configuration expansion.

## Baseline and evidence

- Baseline unit: 155 pass; build/typecheck pass.
- Baseline browser: 390px, 1440px and missing-coordinate detail fixtures pass (3 Chromium cases).
- Read-only real Production baseline: public place detail shows the original map-opening card/modal and 100km suggestions; verified-entry warning retained. `scripts/production-smoke.mjs`: 8 checks pass. This is the old Production release, **not this PR deployed**.
- `before-390.png` / `before-1440.png`: main production build with deterministic QA fixture.
- `after-*-390.png` / `after-*-1440.png`, `dark-popup-*.png`: new production build, deterministic SVG place images and tiles. These are test fixtures, not real-map geography or physical-device screenshots.
- `lab-accessibility.json`: scoped axe-core 4.11.0 audit on `#location`, light/dark/popup, plus lab browser PerformanceObserver measurements. SVG/network fixtures and no throttling; not field data or Lighthouse certification. INP and physical devices not measured.

## Test commands

`npm run lint`, `npm run type-check`, `npm run test:run`, `npm test --prefix api`, `npm run build`.

`npx playwright test --config=playwright.image-consistency.config.ts` includes existing shared-image/detail tests plus Nearby tests in desktop Chromium, Pixel 7 Chromium and iPhone 13 WebKit. CI installs the required browser system libraries. Local WebKit is blocked by missing GTK/Graphene/WOFF/Harfbuzz/Hyphen/Manette/GLES libraries; this is not recorded as a passing test.

`node --test api/admin-cms.integration.cjs` uses only the CI isolated local PostgreSQL fixture, ignoring application DATABASE_URL. New subtest checks 3/5/10/20km boundaries, identical coordinates, canonical exclusion, 500 distant records, missing/invalid coordinates, drafts, output whitelist, limits, tie order and injection-safe inputs. No Production SQL or stress tests.

Existing CI gates remain enabled. Baseline lint warnings: 216; no thresholds or assertions lowered. Related tests were updated for inline-map behavior and scoped status messages, retaining gallery/save/share/planner/history assertions.

## Release and rollback

Await owner approval. Do not merge/deploy automatically. This PR changes backend query logic, so after approval verify Railway's existing API service and the single Vercel Production project against the merge SHA, then run read-only public smoke tests. No Production DB writes, new services or config changes were performed. Roll back by reverting the PR and redeploying the existing frontend/API revisions; no data migration rollback is needed. Dense identical pins remain accessible through the equivalent list. Production query plans/latency at scale and physical iPhone/Android testing remain separate release follow-up evidence.

## Local verification results

- Unit: 177/177 pass. API Node tests: 253/253 pass. Lint: 0 errors, 216 pre-existing warnings. Typecheck/build pass.
- Chromium/shared-image/detail + Nearby/Pixel 7 emulation: 52/52 pass. This includes 10 widths (320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440), empty/error/retry/dense results, stale-response race, popup keyboard/Escape/focus, history, English/dark popup, credits and published hero identity. WebKit and isolated PostgreSQL results are recorded in the PR's CI evidence.
- Scoped axe audit: 0 violations in all 10 before/after light/dark/popup runs. Incomplete automated rules remain listed in the JSON and require human review; this is not a WCAG certification.
- Fixture lab LCP before/after: 390px 92/152ms; 1440px 172/160ms. CLS 0 in these runs. These low fixture values do not demonstrate real-user performance targets.
- Vite bundle: existing Leaflet chunk unchanged, 153.95kB / gzip 44.73kB. Detail chunk 59.29→62.29kB (gzip 18.96→19.72kB). New lazy map 3.22kB (gzip 1.73kB) plus shared bounds 0.91kB; Leaflet is not bundled twice.
