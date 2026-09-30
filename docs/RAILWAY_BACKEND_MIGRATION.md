# Railway Backend Migration

PaiNaiDee is migrating its public attraction-data path from Supabase to a Railway backend.

## Production architecture

```text
Vercel (React + Vite)
        |
        | HTTPS /api/places
        v
Railway: painaidee-api
        |
        | DATABASE_URL service reference
        v
Railway: PostgreSQL + persistent volume
```

The frontend reads `VITE_API_BASE_URL` when provided and otherwise uses the production Railway
API domain. The database password is not stored in the repository. Railway injects
`DATABASE_URL` through a service reference.

## Migrated in this phase

- attraction list
- attraction search/filter parameters used by `useAttractions`
- attraction detail
- database health check
- seed data for the four built-in destinations
- public app boot no longer requires Supabase configuration

## Intentionally not migrated yet

Supabase Auth, Community, and Admin media-management flows remain isolated behind their existing
authorization rules. They must not be replaced with unauthenticated Railway write routes.

The next migration phase should introduce a server-side authentication/session strategy and
Railway object storage before switching admin/community writes.

## Railway service

- API health endpoint: `/api/health`
- Places endpoint: `/api/places`
- Place detail endpoint: `/api/places/:id`
- API root directory: `/api`
- API container: `api/Dockerfile`
- PostgreSQL schema/bootstrap: `api/postgres-db.cjs`

The API creates missing tables and inserts built-in seed rows with `ON CONFLICT DO NOTHING`, so
restarts are idempotent and do not overwrite edited records.
