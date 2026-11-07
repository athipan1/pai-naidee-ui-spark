# Production baseline — 7 November 2026

Recorded before implementation. No production writes, paid Google calls, environment changes, merge or deploy were performed.

| Surface | Observed evidence | Gap / release implication |
| --- | --- | --- |
| GitHub main | `cd2749d7b82cc7b95855096ef7e4b717cb7d59e7` | Recheck before merge |
| PR 371 | Open draft, policy only; head `1a0d73f0308ad2f06b17dc21307c27769206c5f5`; CI 42352138101 success | No running importer |
| Other open PRs | 260, 259, 249, 244, 242 | Do not merge old competing CMS / database work implicitly |
| Railway API | Deployment `028388e5-ff9f-4c9f-af31-43253c112ede`, SUCCESS, main cd2749d; `/api/health` reports database ok | API auto-deploy source main, checkSuites false: merging API code is effectively a deployment and needs approval |
| Railway PostgreSQL | Existing service `22e877d0-0d2e-4ffb-ac49-dc1cf0a120e0`, online; SELECT through Railway Data UI | No public TCP proxy; no new database created |
| Counts from SQL | 194 places, 71 Chon Buri; 77 distinct province labels; 5 CMS drafts, 0 aliases | Earlier CSV 193/70 is research history, not current truth; province presence is not completeness |
| Existing turtle centre | `tat-2010120911214112696`, TAT source, Chon Buri | Update-only; existing centre coordinate is not a verified vehicle entrance |
| Schema | places, media, place_drafts, place_aliases inspected via information_schema | No Google Place ID or structured source ID columns |
| Constraints | places/media/drafts PK; aliases UNIQUE(place_id,alias_key); province/name/coordinate/media indexes | No global Google/source identifier uniqueness constraint |
| Daily guard | Atomic PostgreSQL ledger; search max 5/day; routes max 25/day; detail/photo default 0, max 2/day each; fail closed on DB failure | Cloud quotas, billing alert configuration, cost estimates and unexpired activation approval still unverified |
| Ledger | Latest observed rows 4 Nov: search 5, routes 25 | Historical cap evidence, not proof of current Cloud quota |
| Vercel | Production `dpl_Eg9FSbUA8YqaJKj2soQf5EAptFqM`, READY, main cd2749d | READY alone is not browser acceptance |
| CMS | Existing Railway bearer authentication, admin-only role, draft version checks, transactional publish, aliases, image uploads | Current publish lacks source/license/entrance evidence and a separate approval state |
| Source pipeline | Existing TAT/Wikidata/OSM staging, Chon Buri OSM polygon, bounded live audit | Bbox is only prefilter; OSM license hold; no automatic publication |
| Detail UI | Responsive gallery, loading/fallback, source/media credits, separate live Google pilot | Wikipedia thumbnail path can bypass per-image license review; audit gallery credits before Phase 2 release |
| CI | Existing ci.yml has API/unit tests, isolated PostgreSQL integration, Chromium/WebKit E2E, lint, types, audit, build | Coverage percentage not yet measured. No new workflow needed |
| Legacy deployment workflow | deploy.yml still builds Node 18 and publishes ./build to GitHub Pages | Conflicts with Vite dist/Vercel architecture; requires a separately reviewed cleanup |

## Google terms checked

Official Places policy and service-specific terms checked on 7 Nov 2026:

- https://developers.google.com/maps/documentation/places/web-service/policies
- https://developers.google.com/maps/documentation/places/web-service/place-id
- https://cloud.google.com/maps-platform/terms/maps-service-terms

Place IDs are exempt from caching restrictions. Do not persist Google names, addresses, coordinates, photos or review payloads in candidate reports. Do not use Google coordinates as point-in-polygon inputs. Use independently licensed coordinates for province/entrance validation. Display Google data fresh with attribution in a separate panel, without a non-Google map. Budget alerts do not stop charges.

## Release boundary

Implementation and tests may run locally/on PRs. Phase 1 acceptance remains incomplete until an explicitly approved, quota-protected live Google test is observed. Phase 2–4 acceptance additionally needs image rights, admin approval, production change approval and post-deploy proof. No current evidence supports declaring all phases complete or Thailand tourism data 100% complete.
