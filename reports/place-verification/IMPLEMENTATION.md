# Phase 0 / Phase 1 review foundation

## What runs

An existing Admin CMS draft can request a read-only quality review. The server authenticates with the existing Railway admin guard, reads the complete catalogue plus approved aliases in one repeatable-read read-only transaction (5 second statement timeout; abort above 20,000 rows), and returns duplicate matches and missing evidence. No draft is modified. A CSV response uses the same authenticated route and escapes spreadsheet formula prefixes.

- `GET /api/admin/places/:draftId/quality-review`
- `GET /api/admin/places/:draftId/quality-review?format=csv`
- `GET /api/admin/google-verification/status`
- `POST /api/admin/google-verification` — manual action, default disabled

The pure duplicate engine handles canonical TAT source IDs, namespaced source IDs, existing IDs, Google Place IDs when supplied, normalized Thai/English names, approved aliases, distance and cross-source batch comparisons. An ID match means update-only, not approval. Confidence descriptions distinguish identifier matches, name matches and proximity; they are not invented calibrated probabilities.

Province math accepts trusted independent boundary geometry and independently sourced coordinates only. The current CMS has no such stored evidence/registry yet, so its review correctly returns province/evidence holds. Google coordinates are not requested. The live Google panel displays a minimal ID/name/address/type result with attribution, no map, no storage, no automatic identity match, no photo/rating/review fields. Only the existing detail quota bucket is used; no new quota ledger or schema.

## Reproduce the real research report

```
node api/review-place-candidates.cjs reports/place-verification/research-candidates.json reports/place-verification/production-baseline.json /tmp/new-candidate-review
```

Output is research only: 3 candidates, 1 existing entity (turtle centre, update-only), 2 unmatched entities pending review, 3 coordinate holds, 3 source-license holds, 0 province proofs, 0 approved, 0 published, 0 Google calls. Empty coordinates are intentional, not fabricated. Baseline API pagination returned 194 unique IDs over 4 pages, agreeing with live PostgreSQL SELECT counts (71 Chon Buri, 77 province labels).

## Activation / release gates

No environment values have been changed. A later, separately approved release would need all of:

- Existing `GOOGLE_PLACES_API_KEY` available, without printing it.
- Explicit short-lived `GOOGLE_PLACE_VERIFICATION_ENABLED=true` and `GOOGLE_PLACE_VERIFICATION_EXPIRES_AT`.
- Cloud-side quota and Billing Alerts actually inspected and configured; then operator attestation using `GOOGLE_CLOUD_QUOTAS_CONFIRMED` and `GOOGLE_BILLING_ALERTS_CONFIRMED`. These booleans do not enforce Cloud quotas and do not prove a billing cap.
- Existing `GOOGLE_PLACE_DETAIL_DAILY_LIMIT` explicitly approved (default 0; hard maximum 2), shared with the detail pilot. No increase in hard daily limits.
- Current SKU/THB estimate across Places, Routes and photos consistent with the 500 THB/month target, including other consumers of the same project. Budget alerts never stop spending.
- Successful live Google test after explicit approval, authoritative entrance coordinates, province polygon evidence and source/media rights review.
- CI, conflict check against latest main, explicit merge/deployment approval. Railway and Vercel deploy from main automatically; a merge must be treated as a production release.

## Explicit unfinished work

This is not a Phase 1–4 completion claim. Existing CMS publish behavior is not represented as a newly enforced quality gate. Its separate approval workflow still needs Phase 3; do not use this read-only report as authorization to publish.

| Phase | Remaining acceptance work |
| --- | --- |
| 0 | Finish CI live browser proof, address or separately retire failing legacy GitHub Pages workflow; test coverage percentage not yet established |
| 1 | Approved live Google request, persistent Place ID/source identity design and unique constraints, trusted province registry, source/entrance rights evidence, server-enforced publication gate |
| 2 | Media licence and URL/dimension/duplicate gate, all-gallery attribution, eliminate unreviewed Wikipedia thumbnail bypass, verify details/entrance navigation on all target browsers |
| 3 | Candidate lifecycle and human approvals, reviewer/audit/provenance persistence, transactional idempotent import and uniqueness migration, isolated PostgreSQL + Admin E2E proof; migration must be separately approved before production |
| 4 | Reusable multi-province source orchestration, checkpointed jobs, province quality dashboard, second-province proof and post-release API/browser verification; no automatic imports |

No database migration is included or applied. No production rows were added or changed by this work. No paid service was activated. No merge or deploy was performed.
