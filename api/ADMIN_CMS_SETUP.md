# PaiNaiDee Admin CMS — Railway-only setup

The production website remains hosted on Vercel. **All Admin CMS identity, drafts, publication records and image storage live on Railway**; Supabase credentials are not required by this CMS. The existing Railway PostgreSQL is reused and curated places remain untouched.

## Storage

1. In the **existing** Railway `PaiNaiDee` project, create a private Storage Bucket, preferably in `sin` (Singapore), named `painaidee-place-media`. Do not create a second PostgreSQL service.
2. Connect Bucket credentials to the existing `painaidee-api` service using Railway variable references or its secure Variables UI, with names:
   - `AWS_ENDPOINT_URL`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET_NAME`
   - `AWS_DEFAULT_REGION=sin`
   - `AWS_S3_URL_STYLE=path` **only** for older path-style buckets; omit for virtual-hosted buckets.
3. Set `PUBLIC_API_BASE_URL=https://painaidee-api-production.up.railway.app` unless the service's canonical URL differs.
4. Never place Bucket keys in Git, Vercel `VITE_` variables, or the client bundle. Bucket remains private. The API serves images only after they are linked to a published media record.

## First administrator

There is intentionally **no default password** and no admin account created automatically. After deploying the API with its additive schema migration, open an authenticated Railway service shell and run:

```sh
node bootstrap-admin.cjs your-admin-email@example.com
```

Enter and confirm a strong password (12+ characters) at the interactive hidden prompts. Only a previously unused email can be created by this command. The password is stored as a salted `scrypt` hash in the **existing** PostgreSQL; session tokens are random, stored hashed in `admin_sessions`, and expire after 12 hours. `/api/admin/logout` revokes the session. The UI keeps the token in **sessionStorage**, not persistent localStorage.

## Production validation (do not create dummy places)

1. An unauthenticated `GET /api/admin/places`, `POST /api/admin/places`, and upload must return 401, without touching place data.
2. Log in at `/login` as the newly provisioned administrator; `/admin/me` must return role `admin`.
3. Upload one authorized JPEG/PNG/WebP (max 5 MB), and create a draft for an approved, genuine place. Public `/api/places` must **not** list the draft.
4. Duplicate name/province or very close coordinates must return 409 on publish, leaving the existing place untouched.
5. Publish the approved new draft once, then verify search, detail, and `/api/media/cms/<filename>` image on the live website.
6. Confirm curated place counts and representative old records are unchanged.

## Data safety

- Additive `CREATE TABLE IF NOT EXISTS` creates only `admin_users`, `admin_sessions`, and `place_drafts` alongside existing tables.
- Publication is explicitly requested, checked for duplicates, and transactional; existing places are never updated or deleted.
- Image references are stable Railway API URLs; the underlying Bucket is private.
- Uploads made before publishing are private and may need later cleanup if the draft is abandoned.
- The CMS must not be merged/deployed while setup is incomplete or CI is failing.
