# Production database and CMS verification — 7 November 2026

This is a new read-only audit of the existing production database and API after PR #372. It does not authorize another migration, login/session creation, draft, approval or publication. No production POST/PUT/DELETE, schema change, import, merge or deploy was performed for this verification.

## Production evidence

- Production commit rechecked: `740ecf0fc10d8c08d9c9ba791eb8c32f8cc2db30`. Railway deployment `4bdd71c0-56bc-431c-b158-64d3d3a8c083` is SUCCESS; Vercel `dpl_CLainQjzBV5zTudLySuG2Fdvewwf` is READY for that commit.
- SQL used `PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=5000'` and `BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY`. Only catalog/metadata, aggregate counts and existing public place identity fields were selected. No credentials, password hashes or session tokens were exported.
- `schema-snapshot.json`: catalog snapshot at **17:14:48 Asia/Bangkok**. All 10 requested tables plus `province_import_candidates` exist. All **91** expected columns match current code in type/nullability/default. All **11 primary keys, 15 foreign keys, 5 unique constraints**, required check constraints and named indexes are present. All 111 catalog constraints (including 73 NOT NULL entries) are validated; all 25 indexes are valid and ready. The append-only trigger is enabled and its function raises the expected exception.
- Migration SQL SHA-256 in the checked code: `5e83b340179b98a21382416b4fd1e2dd0154342926befc307b5dbad3c3f1a6b2`. Objects match it. No migration ledger exists, so catalog compatibility is not an independent installation-time/digest receipt. **No migration was run in this task.** The operator apply command defaults to offline plan-only and review migration is not called by API startup. The legacy base-schema startup routine remains separate; it was not invoked during this audit.
- SQL counts: **194 places, 71 Chon Buri, 5 drafts, 0 reviews, 0 review events, 0 boundaries, 0 jobs**. All 4 public API pages separately returned 194 unique IDs / 71 Chon Buri. Province labels do not prove completeness.
- `post-api-snapshot.json`: a second read-only SQL transaction proves byte-derived fingerprints of all place rows, draft rows and review-event rows are unchanged after the GET audit. No review or boundary was inserted.
- `api-readonly.json`: health HTTP 200/database ok. All five requested admin GET route families return HTTP 401 without a session. Actual `/admin` UI shows the admin sign-in link.

## Authentication blocker

The database contains **1 enabled administrator and 0 active admin sessions**. A new login calls POST `/api/admin/login` and inserts an `admin_sessions` row. The task explicitly prohibits production POSTs and requires separate write approval, so login was not attempted. Authenticated Production queue/history reads are **BLOCKED**, not PASS. No session was fabricated, token extracted, administrator impersonated or RBAC bypassed. Non-admin/anonymous behavior is tested against the actual guard in unit/isolated PostgreSQL integration tests.

## Isolated fixture verification

The existing CI service `cms-postgres` uses PostgreSQL 16 and the existing `CMS_TEST_DATABASE_PORT` integration harness. That harness hardcodes loopback plus the disposable fixture database, ignoring application DATABASE_URL credentials. No Railway service/database or workflow was created.

This PR adds regression cases to `api/admin-cms.integration.cjs` for missing review migration (HTTP 503, no repair), source/image licence holds, invalid coordinates, site-centre/restricted entrance holds, simultaneous publication of the same draft, complete single-publication audit history, read-only GET fingerprints, and invalid-session writes. Existing cases cover draft privacy, full evidence→verify→review→approve→publish, conflicting drafts, stale versions, external-ID uniqueness and transaction rollback. A unit test separately feeds a non-admin identity into the real Railway guard and requires HTTP 401. The actual admin-user schema disallows non-admin rows; tests do not weaken that constraint.

Local API **220/220**, frontend **135/135**, lint/type/build passed (217 existing lint warnings). This executor has no local PostgreSQL/Docker binaries; the expanded PostgreSQL tests must be proved by this PR's **existing CI fixture**, not labelled passed from local syntax checks. See the PR's final CI status and job logs for the executed fixture/browser results.

## Real candidate disposition

`candidate-readiness.json` compares all 194 fresh SQL identities, all approved aliases and external IDs. Underwater World Pattaya and Wat Khao Ta Bag have no exact ID/normalized-name/alias match in that snapshot, but remain **NEEDS_REVIEW**, **COORDINATE_HOLD** and **LICENSE_HOLD**. Geographic duplicate matching cannot be completed without independently licensed candidate coordinates. The database has no approved province boundaries. No permission or entrance point is inferred from a Google Maps link.

The operator contact page confirms Underwater World Pattaya's name and Bang Lamung/Chon Buri address: https://underwaterworldpattaya.com/contact-us/. The temple site confirms Wat Khao Ta Bag in Si Racha/Chon Buri: https://www.watkhaotabagsriracha.com/contact/. Neither inspected page establishes reusable image/data rights or an independently sourced, publicly authorized vehicle entrance. The temple About page contains template placeholder prose, which must not be copied as factual description. Current Navy gate authority evidence is not established; turtle centre `tat-2010120911214112696` is **existing/update-only**, never a new row.

## Production write gate — not ready

No candidate is ready for a concrete publish request. Coordinates, licence/permission evidence, approved boundary and authorized reviewer identity remain missing. There is no executable import payload or proposed direct SQL write. Approval must not override these holds.

When a real candidate clears all evidence gates, use the existing CMS: separate authenticated draft creation, evidence and review transactions, then publish in the existing transaction (lock draft and catalogue, compare version/hash, recompute gates, claim unique identities, insert/update the place, append audit and mark published). Roll back the whole transaction on error. Repeating publication must return the same place ID. Any post-publication correction uses a separately reviewed edit draft; never automatically delete a place or audit history.

Expected counts are **194→194 for this verification**. A future separately approved single new candidate would be **194→195** only after a fresh baseline; turtle-centre correction would retain the count. No Draft/Approve/Publish or new Production migration is authorized by this report.

## Required result matrix

| Check | Current evidence |
| --- | --- |
| PostgreSQL connection | PASS, fresh read-only transactions |
| Required tables | Present 11/11, Missing 0 |
| Schema compatibility | PASS, 91 columns plus constraints/indexes/trigger |
| Production anonymous authentication guard | PASS, 401 on all requested route families |
| Production authenticated Admin queue/history | BLOCKED, no existing active session |
| Fixture draft / duplicate / evidence / approval / publish / concurrency / rollback | Final result requires this PR CI job logs |
| Real candidate publication | BLOCKED, coordinate/licence/boundary/reviewer evidence missing |
| Production place count | 194, including 71 Chon Buri |
| Production database write | NOT PERFORMED |

The earlier deployed-main CI is https://github.com/athipan1/pai-naidee-ui-spark/actions/runs/42361675392 (success). It proves deployed code, not these added regression cases. The new PR's CI is recorded in its description after completion. No changes in this PR are merged or deployed.
