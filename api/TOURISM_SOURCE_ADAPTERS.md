# Chon Buri Wikidata / OSM evidence adapters (review-only)

This PR adds **offline JSON adapters** and a **read-only online proof**. It does
not insert/update Railway, publish places, create migrations, use Google Places,
or assume a broad geographic bounding box proves the province.

## Production baseline requirement

1. Obtain a *fresh* read-only PostgreSQL dump (a SELECT-only credential, if
   available) using `node export-chonburi-readonly.cjs /private/chonburi.json`.
   Never print or commit the credential or private export. The export includes
   a schema report and a count reconciled with the rows.
2. Export source data from Wikidata SPARQL in
   `{results:{bindings:[...]}}` shape or OSM Overpass `{elements:[...]}`
   shape. Each candidate needs original source IDs, Thai name and coordinates.
3. Run, from `api/`:

```bash
node stage-chonburi-sources.cjs wikidata wikidata.json wikidata-review.json /private/chonburi.json
node stage-chonburi-sources.cjs osm overpass.json osm-review.json /private/chonburi.json
```

The comparison input is **mandatory** and must be nonempty. The exporter JSON
`{status:'read_only',province:'ชลบุรี',counts:{chonburi:N},places:[...]}`
is accepted and must be internally count-consistent. Plain arrays also work for
explicit caller-supplied existing records, but are not independent proof of a
direct PostgreSQL snapshot. For an actual Production merge gate verify the
database export is recent.

Candidate status is only `needs_review`; **approved is always 0**. Same
Wikidata ID across sources, same source ID, or normalized Thai name within
300 metres of an existing site is flagged as `possible_duplicate`. The name
and radius are safety heuristics, not a conclusive dedup algorithm. A site
within the coarse bbox still requires an exact Chon Buri province geometry
check, actual owner and tourism access confirmation, explicit licensing,
administrative verification and an exact visitor access pin.

## Live public-source smoke test

`node verify-chonburi-sources-live.cjs`

Uses *public GET requests only*: Wikidata entity Q3576017, OSM way 132599367
(full geometry), and **all** Railway public API pages for Chon Buri. These
two real external records refer to Khao Kheow Open Zoo and illustrate
cross-source references. Geometry center is NOT an independently
verified entrance. CI executes this read-only proof on the PR branch, does
not mutate databases and only logs a compact summary. External source
availability can affect smoke results; failures must be investigated rather
than interpreted as permission to publish automatically.

**Restrictions:** no secret variables, no extra production services, no
automatic approval/publication, no inferred opening hours or license rights.
