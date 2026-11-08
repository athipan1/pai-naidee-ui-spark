# Google Places (New) manual discovery pilot

Scope: Admin CMS, Chonburi only. This is a preview, **not** a complete province inventory. Uses the existing Railway backend and `GOOGLE_PLACES_API_KEY`. No production database writes or Google content persistence. Google Place IDs are displayed ephemerally; no import endpoint receives them. Existing OSM endpoint remains unchanged.

## Activation (only after CI, billing and terms review)
Default OFF. Railway server-side settings:
- `GOOGLE_DISCOVERY_ENABLED=true`
- `GOOGLE_DISCOVERY_EXPIRES_AT=<approved future ISO date>`
- `GOOGLE_CLOUD_QUOTAS_CONFIRMED=true`
- `GOOGLE_BILLING_ALERTS_CONFIRMED=true`

The pilot reuses the existing durable `places_search` quota ledger, capped at **five requests per day shared with AI Trip Planner**. Each attempted request reserves quota first. This is not a hard monetary spending cap: verify Google Cloud project billing and SKU costs before enabling; do not assume the 500 THB monthly target is enforced by billing alerts. If budget evidence is missing, leave the feature disabled.

Google Text Search uses a Chonburi-area rectangle as a location **bias**, not a province boundary filter. Results may include places outside Chonburi and require independent review. Only a maximum of ten results are returned per click. Never interpret zero results as proof a province is complete.

Google Maps Platform content is live-only, must not be bulk copied, cached, imported, or stored as independent place data. Use authorized independent evidence for creating drafts. Review attribution and display obligations before launch.

## Release gate
1. Run Node regression tests and repository CI.
2. Review Google Maps Platform current Terms and Search Text billing tier.
3. Confirm the existing daily quota ledger and monthly spend controls.
4. Test authenticated Admin endpoint with a temporary pilot enablement and check Google billing metrics.
5. Do not merge or deploy unless the above pass. No production changes are made by this PR.
