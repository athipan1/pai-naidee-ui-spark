# Admin direct publication

Base: main `27ef7631089c2cc8dc0339b4dcd729bdfa2d8dfa`.

Authenticated admins can now save a draft, then click Publish and confirm to make it public. The CMS no longer mounts the automatic evidence/quality form or requires a review/approval transition. Drafts still support starting with a name only; publication requires name, province, category and a valid manually entered Thai coordinate pair. Incomplete drafts show a short Thai message directing the admin to edit them.

Preserved server checks: existing admin authentication/authorization, optimistic draft/place version conflicts, HTTPS/image-format validation, exact duplicate names in a province, Google external identity ownership, atomic writes, gallery preservation and search-cache invalidation. No database schema, infrastructure, secrets, quota or paid-service changes.

Direct publication records an immutable `direct_publish` event with the actual actor and `qualityReviewPerformed: false`. It never creates an APPROVED review or pretends independent evidence was checked. Previous evidence remains stored, marked as historical for a direct edit, and is not shown as current verified navigation/facts. Existing image credits and external identity ownership remain preserved. Description edits update the public detail text. Repeat publish requests remain idempotent.

Regression coverage: direct publication without any review row/evidence, actual public API persistence after publication, private-to-public images, edit/gallery consistency, conflicts, duplicate races, rollback, honest audit records, historical evidence preservation, and Google identity conflicts. Browser fixtures assert that no evidence/review/quality/Google verification requests are sent and the evidence form is absent on desktop/Android/WebKit iPhone/iPad. Existing public discovery/image/trip-planner suites still run in CI.

Production validation is read-only by default. No existing Production draft will be published automatically by this change. Account-dependent signed-in actions and real Production writes remain NOT VERIFIED without an authorised account. All write proofs use isolated fixture storage/PostgreSQL, never fake Production places.

Rollback: revert this application change through the existing deployment workflow if a regression occurs. Do not roll back the database or delete immutable publication history. Reverting reinstates the previous reviewed-publication prerequisite for remaining drafts.
