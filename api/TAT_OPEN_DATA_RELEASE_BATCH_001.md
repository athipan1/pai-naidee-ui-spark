# TAT Open Data release 001 — five source-reviewed attractions

**Review date:** 2026-11-04 (Asia/Bangkok). **Data source:**
[TAT tourist attractions](https://datacatalog.tat.or.th/dataset/tourist-attraction),
official `attraction.csv`. Original CSV SHA-256:
`2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`.
Downloaded and staged in the existing `TAT Open Data Import Review` GitHub
Action [run 41852634375](https://github.com/athipan1/pai-naidee-ui-spark/actions/runs/41852634375).

## Eligibility and independent identity review

All five records are verbatim TAT IDs and TAT-provided Thai names, names in
English, provinces, decimal coordinates and Thai descriptions. English summaries
are either sourced from the TAT row or shortened to match it. No geocoding,
imagery, review counts, prices or visiting hours were synthesized. A point
represents the place, **not** a navigation-certified entrance.

| TAT attraction ID | Thai name | Province | TAT coordinates (lat, lng) | Independent official check |
| --- | --- | --- | --- | --- |
| 20260209144621001 | เมืองเก่าสตูล | สตูล | 6.613603691140582, 100.06622314453125 | [ONEP old town entry](https://culturalenvi.onep.go.th/site/detail/4852): Satun Old Town around 6.622233, 100.065076 |
| 20260204141052001 | ศูนย์เรียนรู้โฮงฮอมผญ๋า ล้านนา | เชียงราย | 20.0344254, 99.85596450000001 | [Nang Lae Municipality](https://nanglae.go.th/traveldetail.php?id=3): the learning centre is in Wat Phra That Doi Ong, Nang Lae, Chiang Rai |
| 20260203143512001 | อุทยานแห่งชาติเขาพนมเบญจา | กระบี่ | 8.240163599999999, 98.91414739999999 | [TAT national-park page](https://thai.tourismthailand.org/Attraction/อุทยานแห่งชาติเขาพนมเบญจา): national park in Krabi |
| 20260203120214001 | ชุมชนหนองปลาไหล | ชลบุรี | 12.9791195, 100.9601339 | [DASTA](https://www.dasta.or.th/th/article/4444): Nong Pla Lai, Bang Lamung, Chon Buri, community rice farming |
| 20260126145509001 | ชุมชนบ้านออนใต้ | เชียงใหม่ | 18.7376401, 99.23324 | [Ministry of Tourism and Sports](https://www.mots.go.th/news/1002294): Ban On Tai, San Kamphaeng, Chiang Mai |

This review verifies each place's identity and named province against an
independent authoritative source; it does **not** certify the exact GPS position
inside a site boundary or business opening status. Coordinate validation uses
the static Thailand box and a 200-km maximum distance to verified seed points
within the named province. A future administrative boundary check is still
recommended as more records are added.

## Safety checks

1. Official CSV: **8,848** source rows; the first 79 rows yielded 25 staged
   candidates and 54 rejected rows. Reasons: 19 descriptions too short, 1
   missing Thai name, 33 categories without reviewed mapping, 1 GPS/province
   outlier. The outlier remains unpublished.
2. Read-only live check of `https://painaidee-api-production.up.railway.app/api/places`
   showed **110** records, and **zero** ID or normalized Thai/English name
   collisions among the 25 candidates on 2026-11-04. Check again if the live
   count changed before deployment.
3. Publish **only these five**, with null images, zero ratings/reviews, TAT
   provenance, no invented dates or hours. Keep the other 20 staged records
   for further review. On restart `ensureSchema` performs an **insert-only**
   `ON CONFLICT (id) DO NOTHING`, never overwriting published editorial data.
4. Verify the API health and `GET /api/places?search=...` for all five names,
   and confirm the total increases from 110 to 115. If deployment fails,
   retain the older release; do not bypass the normal deployment checks.

The TAT import does not use Google Places or Routes and does not increase their
API usage. This release is a first small controlled batch, **not** a promise
that all 8,848 rows will be publishable without further checks.
