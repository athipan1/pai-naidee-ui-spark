# PaiNaiDee: Google Maps verification before new place records

**Policy:** Google Maps/Places (New) is a verification service and a navigation link, **not** a license to bulk-copy Google place coordinates, names, ratings, business data, reviews or photos into permanent PaiNaiDee PostgreSQL records.

## Existing infrastructure (reuse only)

- Railway Production Postgres and existing `places` / `place_drafts` records.
- Existing Google Places Text Search (New), `google-place-preview.cjs` and `google-trip-places.cjs`, with shared `google-daily-usage.cjs` quota reservation.
- Existing review/admin workflow, dedup/alias handling and CI. No new service, repository, paid subscription, or independent importer workflow.
- Keep Google usage disabled by default until actual project quotas, SKU costs, API restrictions and billing alerts have been checked by the owner. The **฿500/month target is not guaranteed by billing alerts or app-side counters**.

## Required checks per new or corrected site

1. **Independent source record**: official tourism agency, venue owner, or another suitably licensed source supplies the proposed Thai name, exact site identity and permanent coordinates. Save source URL, license/permission and evidence date. Never promote unsourced Google Maps coordinates as independently sourced.
2. **Google verification (opt-in, quota-reserved and user/reviewer-triggered)**: query Google Places (New) with a narrow FieldMask, inspect Place ID, display name, relevant category/address and map location **ephemerally**. Prefer a place-specific lookup over large scans; retain only the Google **Place ID** as allowed by terms. The Google map pin may represent a site centre, not a customer entrance.
3. **Entrance evidence**: separate `site_location`, `vehicle_entrance`, `parking` and `pedestrian_access` concepts. A Google Maps pin or map link is *not* owner confirmation of a vehicle gate. Store a permanent entrance GPS coordinate only when an independent licensed/public owner record confirms it. For military/restricted facilities, publish only owner-authorized public navigation points.
4. **Duplicates**: compare live Railway Production `id`, existing `source_name/source_id`, `google_place_id` where present, Thai alternate names and nearby independent coordinates. Exact IDs and aliases take precedence; close names within a small radius require manual review. Never overwrite an existing confirmed TAT place automatically; update/attach verified references to the existing record.
5. **Review and import**: generate a dry-run candidate manifest, with `status=needs_review` until all required independently licensed evidence is present. Admin approves specific records and coordinates after duplicate and licensing review. Only the existing approved backend/Admin CMS import path can write to the *same* Railway PostgreSQL; never import Google payload dumps into `places`. Production insert/update must be idempotent and logged, followed by live API pagination and browser card verification.

## Minimum import fields and gates

| Field | Required source | Permanent DB policy |
| --- | --- | --- |
| `name_local`, `province`, `category` | Independent source verified by reviewer | May persist with source/license |
| `lat`, `lng` (site) | Independent source with appropriate rights | May persist after pin quality gate |
| `entrance_lat`, `entrance_lng` (if supported) | Venue authority / independently licensed evidence | Never infer from Google search or from site centroid |
| `google_place_id` (if supported) | Places API (New) | May persist; verify format and deduplicate |
| Google-sourced coordinates/address/reviews/photos | Google Places | **Do not permanently persist**. Live display under Google terms, correct attribution and relevant map UI only |
| `source_name`, `source_url`, license and review timestamp | Original independent source | Persist as audit evidence when rights allow |

## Safe initial targets: Chon Buri

- **Underwater World Pattaya**: venue name and address independently confirmed. Google search can help cross-check identity; official automobile entrance/parking coordinates still require owner confirmation before persistent import.
- **Wat Khao Tabaek / Skywalk**: official temple site evidence exists; do not assume pin to temple, pedestrian skywalk and vehicle entrance are the same.
- **Royal Thai Navy Sea Turtle Conservation Center**: update existing `tat-2010120911214112696` only, if needed, using the Navy-authorized *public* visitor point. Do not persist or publish restricted military gate coordinates without authorization.

## Do not bypass these conditions

- Source authorizations and geographic quality gate are distinct from a Google match.
- Google Place ID is not evidence of exact official entrance.
- Never copy or cache Google lat/lng beyond applicable maximum temporary limits (usually 30 days for eligible services). Do not mix Google-provided Places locations into a non-Google map in contravention of terms.
- No bulk API usage, no test that incurs API charges until pilot opt-in and upstream budgets are checked.
- Fail closed on quota exhaustion, mismatched identity, conflicting location, missing permission, missing independent pin or duplicate risk.

Official policy: https://developers.google.com/maps/documentation/places/web-service/policies
Google SKU field mask: https://developers.google.com/maps/billing-and-pricing/sku-details/places
