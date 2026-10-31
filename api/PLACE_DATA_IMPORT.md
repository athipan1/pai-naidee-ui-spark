# Nationwide place seed import gate

The curated seed is a minimum coverage catalogue, **not** an exhaustive list of
Thai attractions. The current baseline is 110 locations in all 77 provinces.

Before changing or deploying the bundled seed, run:

```sh
cd api
npm run audit:places
npm test
```

`audit:places` is read-only, uses no Railway credentials, and exits nonzero for
blocking issues. `ensureSchema()` invokes the same gate **before database
connections or writes**; an invalid seed cannot partially import on startup.

Blocking checks: unique IDs and normalized Thai/English names within the same
province, known province/category, usable description, HTTPS source and source
name, numeric Thailand-bounded coordinates, zero unverified seed ratings and
review counts, valid image URLs, linked place IDs, Wikimedia credit/license
metadata, and existence of local user-provided gallery files **when the web
assets are present** (full-repository CI). API-only Railway deploys verify the
strict approved production URL and filename, as the public assets are hosted
separately on Vercel. All 77 provinces
must be represented. Warnings include approximate pins reused by different
records and places without verified photographs.

New provinces in v5: Phichit (Wat Tha Luang) and Sing Buri (Bang Rachan Heroes
Monument). Both pins approximate grounds, **not** verified entrances. Both lack
verified photographs, so no substitutes or fabricated credits are seeded.

This gate validates **bundled seed data**, not arbitrary records already
stored in Railway, and does not independently verify remote webpage uptime,
photo subject identity, geographic province boundaries or source truth. For a
bulk external import, stage and review the source records, verify real-world
identities and images manually, then pass the final normalized batch through
this gate before any production write. Never delete or overwrite editorial
records because a seed differs.
