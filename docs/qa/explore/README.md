# Explore redesign QA

Base: main 968fce8f82059ac9c50058c911b39bb6936bd351.

## Audit and acceptance before implementation

- Real Explore route is `/discover`; `/explore` redirects. `pages/Explore.tsx` is unused.
- Current search has no desktop search input; mobile search is behind Filters and opens a Home hero. Advanced filters are collapsible on mobile; retain that behavior.
- Search is server paginated (20/page), facets and alias suggestions use public Railway endpoints. No supported server sort parameter; retain server order and label it honestly.
- Map currently reads all pages separately and ignores search filters. New search map will show exactly the current result page with valid coordinates; legacy standalone nearby map remains available.
- URL state is initialized once and ignores history navigation; page/favorites are memory-only. Preserve query/filter/page on navigation and keep discovery favorite IDs in session storage without introducing a backend.
- Search remaps images via historical name lookup even though Railway service already applies published image resolver; remove redundant lookup in this flow.
- Scope: DiscoverLayout, SearchView, discovery URL hook, existing AttractionCard optional discovery presentation, extracted reusable Leaflet map, MapView reuse, regression tests. No API contract or backend/DB changes.
- Accept: compact header, visible search, real facet chips, collapsible filters, reset, server order, count/page, map of same page, keyboard controls, consistent published hero, no overflow, bilingual UI, empty/error/retry, no paid API calls.

Baseline: npm ci; lint 0 errors/216 warnings; 151 unit tests pass; typecheck/build pass. Runtime local Node 24 vs repo/CI Node 22 (CI remains authoritative). Before screenshots were attempted with intercepted fixture data; local Chromium was blocked by socket permission (Operation not permitted). No before image is claimed. CI captures the redesigned UI using fixture data, not Production writes.


## Browser follow-up
Read-only Production baseline was inspected in shared Chrome: public rows and facets loaded, no desktop search input, unequal card heights, no writes. CI run 42766451729 passed existing 22 discovery E2E tests, frontend/API/integration tests, security audit, lint/typecheck and build. New Explore tests exposed two harness issues: initial request race before interception (wait for baseline cards), and WebKit full-page screenshot pixel-size limit on a 20-card mobile list (capture the viewport; keep all overflow assertions). Category deep links now reuse paginated SearchView, preserving filters and avoiding an all-category download. Discovery reuses existing public detail contrast tokens. Map popups preserve directions/source links and photo attribution.

Local environment became unavailable during follow-up; final source updates and verification use the connected GitHub API and required CI. No local browser or final local rerun is claimed for the follow-up.
