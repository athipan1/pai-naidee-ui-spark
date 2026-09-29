# Phase 1 Security Hardening Runbook

## Status

The public repository previously tracked a real Supabase legacy `service_role` JWT in `.env`.
The file has been removed from the branch, but deleting the file from the current tree does **not**
remove it from Git history. Treat that credential as compromised.

The Supabase project associated with the repository was inactive during this hardening pass, so no
database or key mutation was performed against the hosted project.

## Required before the next production deployment

1. Restore/open the intended Supabase project only when you are ready to deploy.
2. In **Project Settings → API Keys**, create a new **publishable** key for the browser and a new
   **secret** key for server-side code.
3. Update deployment secrets:
   - Browser: `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Server/API: `SUPABASE_SECRET_KEY`
   - Server URL: `SUPABASE_URL`
4. Confirm the app and API work with the new keys.
5. Disable the compromised legacy `service_role` key. Do not re-use the value from Git history.
6. Apply `supabase/migrations/20260929150000_phase1_security_hardening.sql`.
7. Verify:
   - public users can read places/media;
   - viewer/moderator accounts cannot create/update/delete places;
   - editor can create/update but cannot delete;
   - admin can create/update/delete;
   - Storage bucket `place-media` follows the same rules.
8. Run Supabase Security Advisors after the migration and resolve any new findings.

## Authorization model

Authorization must be sourced from `auth.users.raw_app_meta_data` / JWT `app_metadata`.

Supported roles:

- `admin`: full content management
- `editor`: create/update content and media
- `moderator`: no place/media management in Phase 1
- `viewer`: read-only

Never authorize from `user_metadata`, localStorage, development mode, or a user ID supplied by the
browser.

## Repository controls added

- tracked `.env` removed;
- secret values are no longer printed by the admin bootstrap script;
- `scripts/check-secrets.mjs` rejects tracked environment files, `sb_secret_...` values, and
  legacy JWTs whose payload role is `service_role`;
- CI executes the secret guard and API security tests;
- frontend admin access uses Supabase session + `app_metadata.role`;
- API mutations validate Bearer tokens before accepting uploads;
- API uses restricted CORS, request limits, upload limits, and rate limiting.

## Git history

Rewriting public Git history is optional after credential rotation and can disrupt forks/clones.
Credential rotation is the security boundary. If history cleanup is desired, perform it as a
separate maintenance operation after all collaborators are notified.
