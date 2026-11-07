# PaiNaiDee Phase 0–4 — implementation and release boundary

## Verified baseline

- Main audited: `cd2749d7b82cc7b95855096ef7e4b717cb7d59e7`.
- Existing Railway PostgreSQL SELECT and all four API pages agree: **194 places, 71 Chon Buri, 77 province labels**. Province presence is not completeness.
- Phase 0/1 foundation commit `8a08b777b45a2dc1f187ee51111a9390f80f0d3d`: CI [42354866674](https://github.com/athipan1/pai-naidee-ui-spark/actions/runs/42354866674) passed all applicable jobs; isolated PostgreSQL, 22 discovery E2E, 12 trip planner E2E, 12 Admin E2E and 15 live Production E2E passed. The live Production tests used Desktop Chromium, Android Chromium and iPhone WebKit, not physical devices.
- That CI run proves the foundation and current Production baseline; the expanded Phase 2–4 implementation requires a new CI run on its final commit.
- Local browser limits: WebKit libraries cannot be installed in this executor, and live HTTPS through the executor proxy fails Chromium certificate trust. TLS validation was not disabled. CI provides browser evidence.
- Google Cloud console returns “Site Unavailable” to this browser. Current Cloud quotas, Billing Alerts, aggregate usage and the 500 THB cost target are **not verified**.

## Phase 1 — identity and coordinate review

Existing TAT/Wikidata/OSM staging and Admin CMS share duplicate gates: existing IDs, namespaced source IDs, Google Place IDs, Thai/English normalized names, aliases, proximity and cross-source batch matches. Exact identifiers require update of the existing entity; they cannot be dismissed as a different place.

Independent boundary geometry is read from an explicitly reviewed province registry. Bbox checks never prove province membership. Site centres, vehicle entrances, parking and trailheads stay distinct. Restricted sites require public access and authority evidence. The Navy turtle centre `tat-2010120911214112696` remains update-only.

Google verification is a fresh, attributed, manually requested panel without a non-Google map. It requests no coordinates/photos/reviews, never persists response content, and shares the existing detail quota (default 0, hard max 2/day). No new ledger or quota allowance is created. Activation requires a short-lived explicit approval, existing key, Cloud quota and Billing Alerts attestations. Attestation booleans are not Cloud enforcement; alerts never stop charges.

Original real Chon Buri research: 3 candidates, 1 existing entity, 2 unmatched candidates pending review, 3 coordinate holds, 3 licence holds, **0 approved, 0 published, 0 Google calls**. A second read-only report uses actual CC0 Wikidata structured entities for Chon Buri and Chiang Mai; its missing polygons/entrances remain holds. These reports are not import payloads.

## Phase 2 — media and details

The server media probe accepts the existing private CMS S3 bucket and bounded HTTPS requests to Wikimedia upload/thumb hosts only. It rejects redirects, arbitrary server-side destinations, Google photo URLs, SVG, files over 5 MiB, unsuitable dimensions/aspect ratios, incomplete signatures/PNG chunks and unconfirmed image licences. It records actual dimensions, SHA-256 and a one-day probe expiry; identical published image hashes are held for review. It does not infer reuse permission from a website merely being public.

Gallery images need exact matching attribution. Wikipedia summary thumbnails cannot bypass per-image rights review. Each displayed gallery image has credit links; loading and broken-image placeholders remain. Navigation uses an approved independent entrance/parking/trailhead snapshot only. Legacy places open a name search on Google Maps instead of treating a centre pin as an entrance. Optional hours/admission facts require independent sources and a check within 30 days; expired facts are hidden. Unknown hours/fees are explicitly unknown.

## Phase 3 — human approval and integrity

The existing CMS publisher now enforces the review on the server inside its publication transaction. The lifecycle is `DISCOVERED → STAGED → VERIFIED → REVIEW_PENDING → APPROVED → PUBLISHED`, with duplicate, licence, coordinate and rejection holds. Saving evidence, probing an image or changing draft content cannot silently retain approval. Exact payload hashes, evidence revisions, reviewer identity, immutable event history, fresh quality gates and unique external identifiers protect publication. Draft edits and place row versions are checked again at publish time. All new routes reuse the existing admin bearer/RBAC guard and tagged SQL; normal users cannot stage, approve or publish.

A prepared **manual additive migration** creates review/event/external-ID/boundary/publication/job tables in the existing PostgreSQL database. API startup does not run it. If it is missing, review mutations/publication fail closed while public catalogue reads remain available. It is applied only to the isolated CI PostgreSQL fixture for integration tests.

Plan-only command (does not connect to a database):

```
node api/apply-place-review-migration.cjs
```

Production application requires separate approval of the printed SQL SHA-256, an approved release reference, existing DATABASE_URL and `PLACE_REVIEW_MIGRATION_SHA256`. Do not run `--apply` until that approval and an existing Railway backup/preflight are complete. Province boundary rows also require separately reviewed independent geometry; no fabricated boundary is bundled for Production.

Rollback plan: disable publication/stop the release, roll application code back only with an explicit publishing freeze, retain additive review tables and immutable audit history, and reconcile any published rows through edit drafts. Do not automatically delete places or drop evidence tables as a rollback. Export and separately review any future destructive schema rollback.

## Phase 4 — bounded province expansion

The existing API hosts resumable, manually initiated province jobs: known 77-province registry, one province per batch, at most 20 candidates, at most 5 reviews per resume, stable idempotency keys with input hashes, transaction checkpoints and isolated failure state. They create private drafts only. Passing automated gates sends a candidate to human review; it never publishes. No workflow, service, project or database was added. Existing source adapters can stage a selected second province without declaring it polygon-verified.

The CMS province dashboard shows existing/discovered/confirmed-new/duplicate/licence-hold/coordinate-hold/approved/published/missing-image/missing-detail counts and verified dates. A paginated queue lets an admin open drafts for evidence, approval and preview. Counts are not a claim of 100% completeness. Failed jobs resume from the last committed checkpoint and never affect another province.

## Main API surface

| Route (all under `/api/admin`) | Behavior |
| --- | --- |
| GET `/places/:id/quality-review[?format=csv]` | Read-only duplicate/missing-evidence report; CSV formula escaping |
| GET `/google-verification/status`, POST `/google-verification` | Activation/expiry/quota guard; fresh identity panel only |
| GET `/places/:id/review` | Evidence, preview, fresh gates and review history |
| PUT `/places/:id/evidence` | Allowlisted independent provenance; resets approval |
| POST `/places/:id/probe-media` | Server-controlled bounded media probe |
| POST `/places/:id/review-transition` | Verify / request review / approve / reject / request changes |
| Existing POST `/places/:id/publish` | Fresh approval gate, version checks, uniqueness, transaction and audit |
| GET `/candidate-queue`, `/province-quality` | Pagination and province metrics |
| POST `/province-import-jobs`, GET `/:jobId`, POST `/:jobId/resume` | Explicit staging, idempotency and bounded resume; no publishing |

## Production gate — still not passed

No production database write, migration, source import, Google API request, environment/quota change, merge or deploy has been performed by this work. Production place count remains the audited baseline, not an increased count. Railway and Vercel auto-deploy main, so merge approval is also release approval.

Release requires final CI success and latest-main conflict check, approval of the exact migration/release, reviewed independent province boundaries, owner/entrance and media evidence, approved live Google testing with inspected Cloud quotas/Billing Alerts and cost estimate, then post-deploy SQL/API/browser checks. The nationwide expansion acceptance remains unproven until approved real candidates in more than one province are actually published and verified. Isolated fixtures and read-only research are never labelled Production imports.

## Approved province boundary configuration

The operator can now validate a complete original OSM administrative relation without editing SQL:

```
node api/import-province-boundary.cjs /private/source-relation.json ชลบุรี
```

This default offline command checks administrative identity, province name, ISO code, finite geometry, complete outer/inner rings and size caps; then prints the exact canonical SHA-256 and ODbL attribution. It does not open the database or grant licence approval. Google payloads, timeout/ambiguous source responses and unresolved nested boundary relations are rejected.

After separate review of the exact geometry, ODbL obligations and the approved release, an operator may supply `--apply --reviewer-id <existing-enabled-admin> --approved-release <reference>` with `PLACE_BOUNDARY_APPROVAL_SHA256` equal to the printed digest. The existing review schema must already be approved/applied. Storage uses a transaction and reviewer identity, is idempotent for identical approved data, and refuses any different existing boundary. It never overwrites public places. The isolated PostgreSQL suite checks these guarantees. No boundary has been applied to Production by this work.
