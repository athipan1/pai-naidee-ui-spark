# Google Places photo/details pilot — Chon Buri only

This change adds a **user-initiated** Google Maps preview card on PaiNaiDee attraction detail pages for Chon Buri. Existing Railway descriptions, photos, ratings and database records remain authoritative and unchanged. **No Google requests happen merely by opening a place page**.

## Default-off operator controls (Railway backend only)

- `GOOGLE_PLACE_DETAIL_ENABLED=true` (default unset/disabled)
- `GOOGLE_PLACE_DETAIL_PILOT_EXPIRES_AT=2026-12-01T00:00:00+07:00` (required expiry; expired/missing means disabled)
- `GOOGLE_PLACES_API_KEY` (existing server-only key; not exposed to the browser)
- `GOOGLE_PLACE_DETAIL_DAILY_LIMIT=1` (optional explicit opt-in; defaults 0, hard maximum 2)
- `GOOGLE_PLACE_PHOTO_DAILY_LIMIT=1` (optional explicit opt-in; defaults 0, hard maximum 2)

These are **independent** from `GOOGLE_PLACES_DAILY_LIMIT` used by the AI trip planner and from Routes quota. The quota ledger uses atomic PostgreSQL daily reservations in Asia/Bangkok and fails closed if the database is down. Each Google request attempt consumes one slot even if upstream fails. Maximum 2 details and 2 photos/day in this backend does **not** guarantee a Google Cloud billing ceiling, because other keys, APIs, SKUs and other callers may incur charges.

## Technical flow

- Browser shows a dedicated **Show Google details** button only when the Railway place belongs to Chon Buri.
- The backend loads the place by its Railway ID; no client-supplied arbitrary search query, Place ID or photo resource is accepted.
- A bounded Text Search (New) requests only selected fields, checks the Google name against the local name and location within 1.5 km.
- If photo is present and a separate photo reservation succeeds, the backend uses Place Photos (New), `skipHttpRedirect=true`, `maxWidthPx=960`. Photo URLs and source payloads are not persisted or cached.
- Google data is presented in a separate section with Google attribution, photo author credit and link to Google Maps. If disabled, quota-limited, unmatched or temporarily unavailable, the Railway data remains visible.
- Responses are marked `Cache-Control: private, no-store`. Photo media URLs can expire.

## Mandatory production gates

1. Run Backend tests, TypeScript check, frontend build, security tests and mobile E2E through the existing CI workflow. Do not bypass any failed check.
2. Deploy with `GOOGLE_PLACE_DETAIL_ENABLED=false` and **both new daily limits unset/0**. Confirm usual production pages still work without Google calls.
3. In the actual Google Cloud project check current Places Text Search and Place Photos SKU costs, allowlisted API key restrictions, budget alerts and enforceable cloud quotas. Confirm legal compliance and correct photo author attribution. **Billing budget alerts alone do not stop charges.**
4. Only after explicit operator verification, temporarily enable the pilot with daily limits `1` and `1`, test **one** Chon Buri place and verify Railway runtime, Google billing and Google photo credits. Disable immediately if usage or cost is unexpected.
5. Review the Google Maps Platform terms and imagery presentation requirements before widening to more provinces, photo galleries or automatic thumbnails.

Official references: [Place Photos (New)](https://developers.google.com/maps/documentation/places/web-service/place-photos), [Places policies](https://developers.google.com/maps/documentation/places/web-service/policies).
