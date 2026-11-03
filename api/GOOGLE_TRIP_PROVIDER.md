# Google Places trip coverage (opt-in)

This provider supplements **missing** trip days without changing the existing
Railway-first and OpenRouter-first flow. It is **disabled by default**.

## Railway Production settings

- `GOOGLE_PLACES_API_KEY`: server-only Google Maps Platform key, restricted to
  Places API (New) and Routes API. Never place it in `VITE_*` variables or Git.
- `GOOGLE_PLACES_ENABLED=true`: opt in only after the release gate below passes.
- `GOOGLE_PLACES_MAX_SEARCHES_PER_HOUR=20`: optional per-instance query limit
  (maximum permitted by the code: 60). This is **not** a globally enforced cost
  cap, so also configure quotas and billing alerts in Google Cloud Console.

The backend searches Places Text Search (New) on demand using one bounded query
(`pageSize=20`) and a strict field mask. Google Places content is not written
to Postgres, cached, or sent to OpenRouter. Results have a `source` marker,
Google Maps URL and attribution in the trip UI. The Leaflet/OpenStreetMap
overlay is not used for days containing Google Places results. Instead users
open that day's route in Google Maps.

Road legs involving Google-provided stops use **Google Routes API**. If Routes
API is disabled, the quota is exceeded, the API call fails, or a route can't be
verified, the planner must stay `partial`; it must not invent travel times.

## Release gate

1. Enable and authorize **Places API (New)** and **Routes API** for the key;
   configure API quotas and budget alerts. Confirm that the project's Google
   Maps Platform billing account accepts the intended usage.
2. Publish a publicly accessible PaiNaiDee Terms of Use and Privacy Policy
   incorporating the required Google terms/policy, and review the use of Google
   data in the site with the current Google Maps Platform terms.
3. `npm --prefix api ci --ignore-scripts` then
   `node --test api/*.node-test.cjs`; `npm run type-check`, `npm run test:run`,
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
