# TAT open data: staged nationwide import

This is **phase 1 (read-only staging)**, not an instruction to insert the whole
file into Railway. The primary source is the Tourism Authority of Thailand
[tourist-attraction dataset](https://datacatalog.tat.or.th/dataset/tourist-attraction),
listed as *Open Data Common* and released as CSV and JSON. Check the source's
licence/attribution and changed terms at each publication.

The current official CSV resource is:

`https://datacatalog.tat.or.th/dataset/87442079-88ec-42eb-b507-dcf135fc4301/resource/e3774497-a9d4-46f1-a3db-172d0aed5237/download/attraction.csv`

Use the CSV **instead of JSON** where the 17-digit TAT attraction IDs are
preserved as text rather than converted into imprecise JavaScript numbers.

## One review batch

From the **existing repository**, select GitHub Actions → **TAT Open Data Import
Review** → Run workflow. It fetches the official source and uploads an audit
manifest as a GitHub artifact. You can choose a province and a starting index.
The workflow has read-only permissions and **no Railway or Google API keys**.
It does not alter Production, trigger deployments or consume Google quota.

The equivalent offline command, after downloading the original CSV, is:

```sh
cd api
npm ci
npm run stage:tat -- --input /path/to/attraction.csv \
  --output /path/to/tat-batch-001.json --limit 25 --start-index 0
```

For the next batch use the previous report's `scope.nextIndex`. Never alter
the original CSV: each report stores its SHA-256 for provenance. The tool
refuses to overwrite an existing review file.

## Mandatory checks before publishing to Railway

1. Require real Thai name, textual province matching the reviewed 77-province
   list, meaningful sourced description, and coordinates in Thailand. Do not
   turn numeric province IDs into province names without an independently
   verified reference mapping. Other rows are rejected with specific reasons.
   The official 2026 CSV represents coordinates in `ATT_LOCATION` as the
   `latitude, longitude` decimal pair; ambiguous or reversed values are blocked.
   A second coarse gate flags points more than 200 km from every existing
   verified point in the named province. This can reject legitimate remote
   destinations and **does not replace** a proper province-boundary check.
2. Category rules are conservative: known beach type 19, nature category 1,
   culture category 2, and already named categories. Unsupported category
   codes go to review rather than an arbitrary category.
3. Compare each accepted candidate against **current live Railway places**, not
   only the bundled seed, by both place ID and normalized Thai/English name
   within province. Reject duplicates and conflicting coordinates.
4. Manually check identity, province, actual point location, descriptions,
   original license, accessibility and current source page for each candidate.
   A coordinate inside Thailand alone does not prove the place is located there.
5. Do not invent ratings, reviews, English translations, attraction images,
   verified timestamps, opening hours, or ticket prices. The accepted batch
   keeps the image empty and ratings at zero. Source attribution is mandatory.
6. Obtain a separate, human-reviewed approval for each batch before building a
   controlled SQL insert transaction. Any future publisher must be insert-only,
   idempotent, transactional, and must never overwrite editorial records.

The manifest's status stays `requires_manual_review`; having zero audit errors
is **not** sufficient to publish. No database writer is included in phase 1.

### Expected bottlenecks

- The public TAT CSV may not contain all 133,000 rows suggested by another
  resource's preview; confirm its actual row count in the audit report.
- If TAT changed column names, the dry-run must reject unmatched fields rather
  than guessing. Use the `rejectionCounts` and source headers to add a reviewed
  mapping before the next import run.
- Public pages should continue using `/api/places` pagination. The map and
  category views currently assume a small catalogue; plan server-side spatial
  pagination/clustering before publishing thousands of entries.

No new Google Places requests are part of this pipeline. Existing Places/Routes
daily guards and the user's **฿500/month** spending objective remain unchanged.

The first five individually checked records have a separate, explicitly
enumerated publication review in [TAT_OPEN_DATA_RELEASE_BATCH_001.md](./TAT_OPEN_DATA_RELEASE_BATCH_001.md).
The regular staging workflow still never publishes the remaining candidates.

The second review window (source index 79, next index 124) is documented in
[TAT_OPEN_DATA_RELEASE_BATCH_002.md](./TAT_OPEN_DATA_RELEASE_BATCH_002.md).
Only its five individually sourced locations are permitted in release 002;
the other 20 remain unpublished.

The third review window (source index 124, next index 174) is documented in
[TAT_OPEN_DATA_RELEASE_BATCH_003.md](./TAT_OPEN_DATA_RELEASE_BATCH_003.md).
Only three corroborated candidates are selected; the other 22 remain staged
without publication.
