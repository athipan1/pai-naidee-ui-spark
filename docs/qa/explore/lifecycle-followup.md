# Explore Production lifecycle follow-up

Approved PR #396 merged at 35044e1b2d5396ab16e536b988c820f9b865cf1f.
Main Vercel project prj_4VyXWNAtJZrgMf184vxW1l0dDMr3 deployed dpl_HSfwN8bwwtbnf7awjW85v4icmBFK (READY, production, canonical domain assigned).

Read-only Production smoke script passed 8 checks: home, SVG fallback, health/database, public catalogue/coordinates/CORS, details, search, nearby, invalid nearby rejection. Shared Chrome verified real search, combined Chon Buri/Culture filters, 1 marker + popup, detail/back navigation, session favorites, Thai/English, empty/reset, page 2/10 (20 cards), no desktop overflow.

Two real browser regressions were retained instead of reporting a clean release:
1. Changing away from an active Leaflet zoom recorded TypeError reading _leaflet_pos in _onZoomTransitionEnd after the map pane was removed.
2. Returning to grid left cached images invisible: complete=true, naturalWidth=960 (or 400 for SVG), opacity=0. OptimizedImage's mount effect reset the earlier cached load to loading.

Fix: disable animations on the rapidly mounted results map and make camera changes immediate; reconcile image completion against the same normalized DOM src after mount, without changing published image choice/rights/fallback policy.

Regression evidence: cached-image unit test failed on main (opacity-0), then passed with the fix. Add a replacement-src loading test, browser tests for leaving mid-zoom and repeated cached grid/map remounts. Existing full unit suite now 155 passes, lint 0 errors/216 existing warnings; final build and CI recorded in PR.

Main CI run 42828293416 failed the old live card-centre click selector on desktop viewports; the actual image/title/details buttons navigate correctly in Production. Update the production proof to click the labelled details button and find the new Map view control, preserving all navigation assertions. Run the existing read-only live proof on this follow-up branch too; no new workflow or relaxed timeout/assertion.

Local browser launch remains blocked (socket permission); WebKit system libraries are unavailable locally. Browser regression + live Android/iPhone emulation runs use CI. No Production DB writes, test destinations, services, credentials, backend changes, or automatic follow-up release. Owner approval remains required before merging/deploying this fix.
