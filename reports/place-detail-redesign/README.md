# Place detail redesign — review evidence

Base: `087f532967a3ddaf01ce2d466fe14a4b48397712` (`main`, PR #394). Frontend only. No merge or Production deployment is authorized by this PR.

## Behavior

- Shared responsive gallery: edge-to-edge mobile cover image, desktop primary plus secondary photos, swipe, thumbnails, counters, fullscreen browsing, keyboard arrows, zoom, focus trap/return, safe-area controls, loading and broken-image states. The existing published-image and licence logic remains authoritative. No photo is hardcoded for a destination.
- Clear title/location/category header, real ratings only, readable description with disclosure, visit facts and their evidence links, map section, source disclosure, real nearby image cards, and mobile sticky actions with at least 44px touch targets.
- Favorites store unique IDs on this browser/device using the existing `painaidee_favorites` key. Storage failures are reported. This does not add account/cloud favorites or activate the legacy `/favorites` page, which currently redirects to discovery.
- Share uses native sharing, clipboard, then a selectable canonical-link fallback. The map loads Leaflet only on request; invalid coordinates never become a `(0,0)` marker. Both map and page navigation preserve verified-access directions, falling back to venue-name search when access is unverified.
- Planner opens a **new tab** with a place ID. The existing public detail query resolves the reference and prefills a message without auto-submitting or editing any itinerary. Reference polling is disabled. Inclusion in the generated plan is not guaranteed; adding a stop to an existing plan is not supported by the current planner.
- The authoritative Public API description replaces the former optional Wikipedia lookup. Existing sourced detailed text and Wikipedia/official links remain available. No unsourced enrichment or additional Google request is introduced.
- Fixed a shared image bug: translating only alt text must not reset a loaded image to invisible while its URL remains unchanged.
- Contrast adjustments use existing teal/coral colors scoped to the detail page and its dialogs. Other pages keep their theme.

## Before / after

These are **local fixtures**, not fake records added to Production. Before screenshots use the base commit; after screenshots use the PR implementation. Thai font support was installed in the test host. The gallery art is a deterministic SVG fixture so screenshots do not depend on external photo downloads. These are inspected visual evidence, not a historical pixel-baseline regression suite.

| View | Before | After |
| --- | --- | --- |
| Desktop 1440px | [Before](before-desktop.png) | [Chromium](after-chromium-1440.png), [WebKit](after-webkit-1440.png) |
| Mobile 390px | [Before](before-mobile.png) | [Chromium](after-chromium-390.png), [WebKit](after-webkit-390.png) |
| Fullscreen gallery | — | [Desktop](gallery-desktop.png), [Mobile](gallery-mobile.png) |

## Validation

- TypeScript app and node configurations: passed via `npm run build`.
- ESLint: 0 errors, 216 warnings. Base commit: 0 errors, 218 warnings. No new warning in edited files.
- Frontend unit/integration: **151 passed, 0 failed, 0 skipped** in 30 files, including 14 new detail/image regression tests.
- Image/detail E2E: **28 passed, 0 failed, 0 skipped** across Chromium and WebKit. Includes all seven widths (320/375/390/430/768/1024/1440), image consistency on Home/Discover/Explore/Search/Detail and Planner, missing images/rights/data/coordinates, language switching, gallery/zoom/focus, persistent save, share, map marker/navigation URL, planner reference, history/refresh and touch events.
- Browser tests use fixture API interception and device emulation; they are not certification on physical Android/iPhone hardware. No Firefox binary was used.
- Existing discovery/planner/Admin regression and API/PostgreSQL/security/build checks run in the existing CI workflow. No workflow was added or disabled.
- Production build passed. Existing large-chunk warnings remain; image `sizes`/priority are set, but the current API does not supply responsive image variants, so no imaginary `srcset` or new image service is introduced.
- Automated accessibility and local lab evidence: [JSON report](lab-accessibility.json). Eight axe scans include page and fullscreen gallery on desktop/mobile in both light and dark mode: **0 violations**. Manual/browser assertions cover keyboard arrows, Escape, focus trap/return, text wrapping and touch targets. Automated scans cannot establish complete WCAG conformance.
- Local LCP/CLS values are in the JSON with environment details. These use a local production build, headless Chromium, fixture SVG images and no network/CPU throttling. They do not establish real-user Core Web Vitals. **INP and field data are unavailable**, and must not be marked passed from these lab observations.

### Local lab observations (single run, milliseconds)

| Mode | LCP | CLS |
| --- | ---: | ---: |
| Desktop, light | 936 | 0 |
| Mobile, light | 732 | 0 |
| Desktop, dark | 1580 | 0 |
| Mobile, dark | 1072 | 0 |

These are fixture lab observations, not field performance or an INP result. External Google Fonts are intercepted with an empty stylesheet during fixture browser tests; the test host supplies Noto Sans Thai. This makes the tests independent of a blocked external font host without changing application networking or disabling checks.

## Production baseline and release gate

Read-only baseline on 2026-11-09: `/api/health` reports `status: ok`, `database: ok`; `/api/places?page=1&limit=1` returns the existing public contract and `total: 196`. This is a public GET baseline, not a SQL inventory or proof that data never changed independently. No database mutation, CMS login/write, Google-preview request, infrastructure change or manual deploy was performed.

Before approval: require all applicable CI jobs, no conflicts, review resolution, and successful build artifact. CI status and the exact PR head are reported in the PR. Do not enable auto-merge.

After explicit merge/deploy approval:

1. Merge the reviewed head through the existing process and verify the main Vercel project's Production deployment is Ready for the resulting SHA.
2. Read-only browser smoke on real published detail URLs in desktop/mobile: gallery, language switch, map links, canonical image, direct URL/refresh, Home/Explore/Search/Planner regressions. Do not create fixtures in Production or send paid Google/planner generation requests just for a smoke check.
3. Check relevant Vercel errors and deployment/cache behavior; confirm the new UI, not just Ready status.
4. Recheck existing Railway health/public detail/image URLs with GETs. No Railway redeploy is needed for this frontend-only change; account for any automatic repo deployment separately.
5. Record Vercel deployment ID, Production SHA, browser results and any remaining issue. Production verification is **pending approval**, not complete.

## Risks and rollback

Saved places are device-local; planner integration passes context rather than guaranteeing itinerary membership. Long/varied source images still depend on upstream file sizes. Map tiles and public image hosts can be unavailable independently. Existing account-level favorites are not implemented by this change.

Rollback the frontend commit using the existing main-project release process, after approval. There is no database migration or data rollback. Recheck the published-image contract after any rollback.
