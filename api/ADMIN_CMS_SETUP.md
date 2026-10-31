# PaiNaiDee Admin CMS deployment checklist

This CMS uses the **existing Railway PostgreSQL database**. It never deletes or updates existing places. `place_drafts` is added on startup with `CREATE TABLE IF NOT EXISTS`. A new `cms:<draft UUID>` place is inserted only after an administrator explicitly publishes a validated draft.

## Required configuration

- Railway API: keep `DATABASE_URL` pointing to the existing production PostgreSQL.
- Railway API: set `SUPABASE_URL` and **server-only** `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) for `auth.getUser` and authenticated image uploads. Never add this key to `VITE_` variables or Git.
- Vercel frontend: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`) for user login; these must reference the same Supabase project used by the Railway API.
- Supabase Storage: provision a public bucket named `place-media`, restrict object writes to the server-side service role. A private bucket needs a signed URL flow instead; do not enable public media without permission.
- Assign the `admin` role in Supabase **app_metadata** using a trusted administrative operation. Users must not be allowed to set their own app_metadata.
- CORS: allow the canonical Vercel origin in Railway's `CORS_ALLOWED_ORIGINS` if changed from its default.

## Validation

1. Visit `/login`; an unauthenticated user cannot access `/admin` or any `/api/admin/*` endpoint.
2. Sign in as an account whose server-verified app_metadata role is `admin`.
3. Upload an authorized JPEG/PNG/WebP image (max 5 MB). The API returns its HTTPS URL.
4. Create a draft: verify it is shown only in `/admin` and does not appear in public search.
5. Attempt to publish with an existing name/province or a near-identical location: expect HTTP 409 and **no database changes**.
6. Publish an approved new unique draft: verify the place appears in `GET /api/places?search=...`, has a valid `GET /api/places/:id` detail, and image URL loads.
7. Ensure existing curated place count and representative existing records are unchanged.

### Safety notes

- Publish uses a database transaction; failed duplicate validation leaves the draft intact.
- The search cache is invalidated immediately after a successful publish.
- Uploading a photo before saving a draft can leave unused media in storage; a follow-up cleanup task can prune abandoned objects.
- A successful upload depends on Supabase Storage configuration. Without it, uploads fail closed (503); text drafts and HTTPS image URL references still require valid administrator credentials.
- Do not run an unattended write test against production. Verify publication with an approved real place and image only.
