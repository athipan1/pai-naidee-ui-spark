# PaiNaiDee Phase 1 — Chon Buri read-only reconciliation (11 Nov 2026)

**Scope:** Original 194 TAT source rows versus public Railway API, with no SQL writes,
Google Places requests, place imports, merges, or deployments. The downloaded official
TAT CSV contains **8,848 records**, of which **194** belong to Chon Buri. Its SHA-256
matches the digest pinned in `api/chonburi-tat-194-row-dispositions.tsv`:

`2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`

## Proven evidence and scope limits

- API: `https://painaidee-api-production.up.railway.app/api/places?province=ชลบุรี&page=1&limit=50`
  and page 2; API pagination was capped at **50** items per request.
- **72 published Chon Buri places**, 2 pages, **72 distinct IDs**. The API response
  is a live-publication census, **not** a direct `SELECT` from Railway PostgreSQL.
- Railway's existing Production project and Postgres service were inspected using
  read-only service metadata, but a dedicated **SELECT-only PostgreSQL connection**
  was unavailable in this workspace. Consequently **production DB row counts,
  schema, hidden/draft records, and direct DB-to-API consistency remain unverified**.
  Do not replace this gap with a write-capable database credential.
- Attribution checks are based on public API metadata, **not an independent license
  audit or proof that images resolve at their remote hosts**. A lat/lng within
  geographic bounds does not prove a true entrance or point within the Chon Buri polygon.

## TAT 194-row reconciliation

| Previously documented provisional disposition | Source rows | Found in live API | Still unmatched |
| --- | ---: | ---: | ---: |
| `published_seed` | 70 | 70 | 0 |
| `pending_category_location_review` | 76 | **1** | 75 |
| `pending_individual_verification` | 45 | 0 | 45 |
| `missing_usable_thai_name` | 2 | 0 | 2 |
| `duplicate_alias_of_published` | 1 | 0 | 1 |
| **Total source rows** | **194** | **71** | **123** |

Of 72 live API places, 71 match the TAT rows by exact TAT ID or normalized Thai
name. The remaining **one** is a separately published Admin CMS place:
`cms:c60d87d4-cb67-46aa-896a-b04a8946a992` — **สวนพุทธแดนนรก**.
One previously pending TAT entry is already live:
`tat-20160528165231008560` — **อุทยานรังสรรค์นวัตกรรมอวกาศ (สเปซ อินสไปเลียม)**.
Its old provisional row status needs editorial reconciliation, **not rollback**.

**Important:** The **123 unmatched source rows are NOT 123 confirmed missing or
publishable attractions**. They include 1 documented alias/duplicate, 2 rows
without an acceptable Thai name, and 120 records requiring independent checks.
For every pending item, current operator, distinct identity, public access, location,
category, image permission, and source provenance must be verified before publication.

## Public API data quality

| Test | Result | Editorial response |
| --- | ---: | --- |
| Unique published IDs | 72 / 72 | No duplicate ID found |
| Exact normalized Thai-name duplicates | 0 | Does not rule out aliases |
| Pins with invalid/missing numeric lat/lng | 0 | Real entrance and province polygon not independently checked |
| Pins outside broad Thailand latitude/longitude limits | 0 | Country bounds are not a Chon Buri boundary check |
| Pairs under 75 metres | 0 | Threshold is a review heuristic, not a proof |
| Missing published primary image / placeholder | **68 / 72** | Priority media verification, no scraping or invented credits |
| Visible primary image without matching credit metadata | 0 / 4 | Rights still need independent review |
| Empty description | 0 | Text accuracy remains unverified |
| Missing `source.verifiedAt` | **69 / 72** | Metadata absence must not be presented as verified |

### API versus original TAT coordinate differences (at least 100 metres)

These are **review flags**, not confirmed mapping errors. TAT's general site pin
and a curated visitor entrance may legitimately differ. No pins have been altered.

| Place | API–TAT separation | Priority |
| --- | ---: | --- |
| หาดเทียนทะเล (`tat-2015120421550718119`) | **18.989 km** | High: independently identify beach and visitor approach |
| วัดเขาบ่อกวางทอง (`tat-2015120421550718075`) | **4.703 km** | High: confirm main entrance with operator |
| เกาะล้าน (`curated-ko-lan`) | 0.758 km | Check island versus pier reference |
| ปราสาทสัจธรรม (`curated-sanctuary-of-truth`) | 0.406 km | Check access entrance versus building location |
| หาดบางแสน (`curated-bang-saen-beach`) | 0.218 km | Check beach extent versus curated point |

## Next small editorial review batch — **not approved for publication**

Before proposing a seed/import PR, independently verify this maximum-three-row
batch from the existing 45 `pending_individual_verification` records. These
source pins are **unverified** and must not be accepted without corroboration.

1. `tat-2015120421550718001` — หมู่บ้านจักรสาน พนัสนิคม (พนัสนิคม):
   current visitor entrance, public access, official name, overlap with other sites.
2. `tat-2015120421550718002` — หอศิลปและวัฒนธรรมภาคตะวันออก (เมืองชลบุรี):
   current operator and opening status, exact building entrance, license-safe image.
3. `tat-2015120421550717993` — สวนรุกขชาติหนองตาอยู่ (ศรีราชา):
   access restrictions, actual entrance and duplicate/province-boundary checks.

Do not import any of these until independent owner/authority evidence and DB
SELECT-only duplicate checks are available. This first PR deliberately contains
only **audit tooling, tests and this report**; it does not alter seed/production
place data. The current Google Maps spending ceiling remains **500 THB/month**,
and the audit has no paid Maps API requests.

## Reproduce the checks

1. Fetch the original TAT CSV from the official catalog as `attraction.csv`.
2. From the repository root, run:

   `node scripts/audit-chonburi-live.mjs --live --tat-csv /path/to/attraction.csv`

   Or pass `--pages <page-1.json> <page-2.json>` instead of `--live` for a
   deterministic API snapshot. Reports print to stdout as JSON; the script
   never connects to PostgreSQL or writes files. The CSV checksum/row IDs are
   verified before reconciliation.
3. Run `node --test api/chonburi-live-reconciliation.node-test.cjs` and
   `npm test --prefix api` with existing API dependencies installed.

**Release gate:** Do not merge this PR, deploy it, or write to Railway PostgreSQL
until explicit user approval. CI success alone is not production approval.
