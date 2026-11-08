# Admin-initiated province discovery (TAT + OSM)

## Confirmed behavior
- Admin explicitly selects one of Thailand's 77 provinces, independently of whether the province has existing places.
- Discovery starts only when the authenticated Admin clicks **ค้นหาสถานที่ท่องเที่ยวใหม่**. No timer, page-load auto-fetch, or auto-publish.
- Query both TAT Open Data and OpenStreetMap using permitted access methods, with source-specific license and attribution recorded. A failed source must be identified, not silently presented as a complete result.
- Return a preview of candidates, with source identity, coordinates, licensing/evidence, duplicates and quality holds. Never write places or drafts during discovery.
- Admin explicitly selects previewed candidates before sending them to the existing province import / candidate review workflow. The existing review and publish gates remain mandatory.

## API contract proposal (not implemented yet)
POST /api/admin/place-discovery/search
Body: {province: string, sources: ['tat','osm'], limit: 100}
Returns: {province, sources: [{source,status,warning}], candidates: [{source,sourceId,name,nameLocal,province,lat,lng,license,attribution,duplicateStatus,holds,evidence}]}

- Require existing admin authentication and rate limiting; validate province against canonical 77-name list; limit results and request duration.
- TAT: confirm endpoint credentials, terms and permissible data fields before implementation; do not scrape an undocumented endpoint.
- OSM: respect Overpass/Nominatim usage limits, attribution and ODbL obligations; do not import image URLs without independent permission.
- Deduplicate using stable source identity first, then normalized/alias names and geospatial distance. Ambiguous matches must remain review holds.
- Existing Railway PostgreSQL is the only persistence store. Use parameterized queries and read-only comparisons during discovery.
- Never create a draft without an explicit separate Admin action. Never publish without approval.

## Acceptance tests
1. Province selector includes all 77 provinces even with zero existing places; default can be ชลบุรี.
2. No external request before click; one click searches only the selected province.
3. Both source statuses are visible; unavailable TAT does not get fabricated results.
4. Duplicate and ambiguous candidates are clearly distinguished; no duplicate drafts on repeated import.
5. Search action creates zero database writes; selected import creates drafts only.
6. Unauthorized access fails; invalid province, large payload, timeout and rate limit are handled.
7. Mobile, desktop and province switching are tested.
8. No production deploy until CI, rights verification and integration tests pass.

## Implementation checkpoints
- [ ] Confirm authorized TAT Open Data API and its data license.
- [ ] Add canonical province selector and explicit search button in ProvinceQualityDashboard.
- [ ] Implement admin-only discovery API and source adapters.
- [ ] Reuse existing candidate review/import pipeline; no duplicate workflow.
- [ ] Add unit, API integration and Playwright regression tests.
- [ ] Run CI and review before merge.
