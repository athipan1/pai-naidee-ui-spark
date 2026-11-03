# Google Places trip coverage (opt-in)

This provider supplements **missing** trip days without changing the existing
Railway-first and OpenRouter-first flow. It is **disabled by default**.

## Railway Production settings

- `GOOGLE_PLACES_API_KEY`: server-only Google Maps Platform key, restricted to
  Places API (New) and Routes API. Never place it in `VITE_*` variables or Git.
- `GOOGLE_PLACES_ENABLED=true`: opt in only after the release gate below passes.
- `GOOGLE_PLACES_PILOT_EXPIRES_AT=2026-12-01T00:00:00+07:00`: **required**
  pilot expiry switch. Missing, invalid, or elapsed expiry disables Google
  calls automatically; renew only after reviewing usage and billing state.
- `GOOGLE_PLACES_DAILY_LIMIT=5` / `GOOGLE_ROUTES_DAILY_LIMIT=25`: shared,
  PostgreSQL-backed Bangkok-calendar-day quotas. Defaults are 5 and 25 and
  code will not accept a higher value. `0` immediately disables that API.
  A reservation is committed atomically **before** each Google HTTP attempt.
  Failed upstream attempts still consume quota (conservative budgeting).
  When the quota database is unavailable, the integration fails closed.
- `GOOGLE_PLACES_MAX_SEARCHES_PER_HOUR=20`: optional per-instance query limit
  (maximum permitted by the code: 60). This is **not** a globally enforced cost
  cap, so also configure quotas and billing alerts in Google Cloud Console.
- `GOOGLE_ROUTES_MAX_CALLS_PER_HOUR=40`: process-local Routes backstop
  (maximum 120); each trip also has a 12-call Google Routes limit. Multiple
  instances each have their own counter, so these are **not billing ceilings**.

The backend searches Places Text Search (New) on demand using one bounded query
(`pageSize=20`) and a strict field mask. Google Places content is not written
to Postgres, cached, or sent to OpenRouter. Results have a `source` marker,
Google Maps URL and attribution in the trip UI. The Leaflet/OpenStreetMap
overlay is not used for days containing Google Places results. Instead users
open that day's route in Google Maps.

Road legs involving Google-provided stops use **Google Routes API**. If Routes
API is disabled, the quota is exceeded, the API call fails, or a route can't be
verified, the planner must stay `partial`; it must not invent travel times.

### Free Trial, daily guard, and hard limits

On startup the existing Railway PostgreSQL migration creates
`google_api_daily_usage` with a `(usage_day, api_name)` primary key. All API
replicas share a single atomic `INSERT ... ON CONFLICT DO UPDATE ... WHERE
request_count < limit RETURNING` reservation, so concurrent calls cannot
overspend the application's daily request quota. The date is computed by
PostgreSQL in `Asia/Bangkok`; counters survive restarts, redeploys and replica
changes. The database contains **only** date, API name, request count and
timestamp, **never** Google Places content.

The app cap restricts only the calls made by this PaiNaiDee backend. It cannot
limit requests using the same key elsewhere, other Google Cloud APIs, or
charges already accrued. It is **not** a guaranteed ฿500 Google Cloud billing
ceiling. During the Google Cloud Free Trial, users are not charged until they
explicitly upgrade to paid billing. Do **not** upgrade or remove the expiry
without separately verifying cloud-side quotas and actual monthly cost.
If all five Places searches are used, newer requests fall back to the local
catalog and may show fewer trip days. Set reasonable user-facing expectations.

### Production verification without a real-money overshoot

1. Deploy a tested commit with Google Places OFF and verify that the new table
   exists through a successful startup and `/api/health`.
2. Temporarily enable `GOOGLE_PLACES_ENABLED=true`, set an expiry in the future,
   set Places daily limit to `1`, and issue two incomplete trip requests from
   different conversations. First should include a Google-sourced stop; second
   should contain no Google-sourced stops. Inspect
   `google_daily_quota_exhausted places_search` in Railway deployment logs.
3. Restore the pilot limits `5`/`25`; verify fresh calls **cannot** exceed the
   first day's already-consumed quota; verify no 5xx errors.
4. Monitor the actual Google Cloud costs. Keep the explicit pilot expiry.

When the local catalog is empty or the AI response fails validation, the same
verified Smart Planner runs deterministically. With Google disabled, an empty
catalog returns `422 NO_VERIFIED_ITINERARY`; it never fabricates stops.

## Google Cloud hard quota/budget checklist (manual owner access required)

1. In the exact Google Cloud billing project connected to the Railway key,
   open **Google Maps Platform → Quotas** for Places API (New) Text Search
   and Routes API Compute Routes. Inspect current limits and 7/30-day use.
2. Agree on a **daily/monthly spend ceiling in THB** and translate it into
   conservative **per-minute/per-day API request quotas** using the project's
   *actual* SKU prices. Set separate quota limits for each billable API.
3. Add Billing **Budgets & alerts** (e.g. 50%, 80%, 100%) and notify the
   project owner. Budget alerts **do not stop charges**. Only approved Google
   quota limits (or an external automated billing kill switch) bound usage.
4. Confirm the server key is API-restricted to Places API (New) and Routes
   API and Application restrictions match the backend's environment.
5. Verify one live Places Text Search and one Routes Compute Routes request,
   monitor actual Google Cloud request counts and charges, then enable the
   flag. Recheck on Android Chrome and iPhone Safari in production.

No Google Cloud quotas or billing settings are changed by a GitHub deploy or
by adding the Railway feature flag. **Do not enable the flag before the Cloud
project owner confirms the provider-side quotas and alerts.**

## Release gate

1. Enable and authorize **Places API (New)** and **Routes API** for the key;
   configure API quotas and budget alerts. Confirm that the project's Google
   Maps Platform billing account accepts the intended usage.
2. Publish a publicly accessible PaiNaiDee Terms of Use and Privacy Policy
   incorporating the required Google terms/policy, and review the use of Google
   data in the site with the current Google Maps Platform terms. The project
   owner must review the legal text and designate a private contact for data
   subject requests. Google source attribution remains visible on cards and
   mixed-source days open Google Maps instead of OSM/Leaflet overlays.
3. `npm --prefix api ci --ignore-scripts` then
   `npm --prefix api test`; `npm run type-check`, `npm run test:run`,
   `npm run build`.
4. `npx playwright test --config=playwright.trip-planner.config.ts` in an
   environment with Chromium and WebKit dependencies, checking both Pixel 5
   and iPhone 13 profiles and the Google Places mock.
5. Deploy the reviewed commit to the **primary** PaiNaiDee production project
   only, initially with `GOOGLE_PLACES_ENABLED` unset/false. Verify the existing
   AI Planner still works; enable the flag only after real API and browser E2E
   checks succeed and monitor usage + 5xx errors.

Official source policies: <https://developers.google.com/maps/documentation/places/web-service/policies>.
Google API security guidance: <https://developers.google.com/maps/api-security-best-practices>.
