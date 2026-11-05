# Chon Buri TAT batch 012: three reviewed cultural places and 194-row triage

The verified existing Railway baseline is **187 nationwide / 64 Chon Buri / 77 provinces**, verified after PR #361. The present PR proposes just **three new** distinct sites; expected only after CI and production proof: **190 nationwide / 67 Chon Buri**.

The TAT dataset source is `attraction.csv` from [TAT Open Data](https://datacatalog.tat.or.th/dataset/tourist-attraction), SHA256 `2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`. TAT source IDs, exact Thai names and source GPS coordinates are kept unchanged. Public authorities confirm existence and identity, **not** every GPS pin's survey-grade accuracy.

| TAT record | Evidence independently checked | Notes |
|---|---|---|
| `tat-201005182246293051` หอพระพุทธสิหิงค์มิ่งมงคลสิรินาถ | [Office of National Buddhism, Chon Buri, event Oct 27, 2026](https://cbi.onab.go.th/th/content/category/detail/id/9/iid/134865) | Office of Buddhism reports shrine and street in Chon Buri's Bang Pla Soi district; no invented visit times |
| `tat-201005182246293199` อเนกกุศลศาลา (วิหารเซียน) | [DASTA CBT Thailand listing](https://cbtthailand.dasta.or.th/webapp/relattraction/content/1521/) and [SMART DASTA](https://smartdastaapp.dasta.or.th/place/39) | Its other TAT entry `tat-2015120421550718071` (มูลนิธิอเนกกุศลศาลาในพระสังฆราชูปถัมภ์) is ~2 metres away: **classify as alias/duplicate**, not a second destination |
| `tat-2015120421550718116` พิพิธภัณฑ์เรือนไทย | [Ministry of Tourism & Sports official directory](https://www.thailandtourismdirectory.go.th/th/attraction/4942) and [OKMD government museum register](https://mlic.okmd.or.th/table-about.php?province1=ชลบุรี) | Local museum at Ban Map Sam Kliew, Don Hua Lo; no unverified hours or admission prices |

## Review accounting across all 194 TAT Chon Buri source rows

`api/chonburi-tat-194-row-dispositions.tsv` contains **all 194 original source records**, with an explicit triage action and independent evidence or a blocker for each row. The inventory is reproducible from the source CSV, and the 194-row regression test checks every row's status, action, evidence and absence of duplicate TAT IDs.

| Status after batch 012 (provisional source-row disposition) | Rows |
|---|---:|
| Linked to published seed, including these 3 | 66 |
| Identified alias of a published place, not a separate place | 1 |
| Pending individual source/operating-status/pin review | 49 |
| Category-3 entries pending verified operating status & location | 76 |
| Missing usable Thai name | 2 |
| **Total** | **194** |

From the initial 131 unresolved source rows, the three reviewed attractions and one confirmed duplicate mean **127 rows still need final decisions**. The 76 category-3 entries have no usable coordinates in the parser's current mapped data; do **not** invent coordinates, reclassify all retail/venues as nature, or publish operators known only from old records. The 49 individual candidates also need review. Examples flagged in the TSV:

- `tat-2015120421550718065`: museum has publicly reported opening only on selected hospital special days, and source GPS needs correction; **do not auto-publish** ([Museum Thailand](https://www.museumthailand.com/index.php/museum/info-queen-savang-vadhana-museum)).
- `tat-201005182246293289` Ko Phai: source coordinates appear implausible for the island; **no fabricated corrected pin**.
- `tat-201005182246293300` Khao Phra Bat: possible alias/part of already published Khao Phra Tamnak, verify granularity before new place.
- `tat-20100518224629889` Bang Saray community: compare with already published Bang Saray old fishing village before creating duplicates.
- `tat-2015120421550718049` Bang Phra wildlife reserve: may be distinct administrative area but overlaps published Bang Phra Reservoir; confirm public entry and visitor unit.
- `tat-2015120421550718048` Ko Sichang homestay: a lodging business, not necessarily an attraction.
- `tat-20160528165231008560` Space Inspirium: already present in Production, do not publish again.
- `tat-2015120421550717990` Cartoon Network Amazone: possible earlier name of Columbia Pictures Aquaverse, identity/closure must be checked.

## Safety / release gate

The 3 proposed records contain no made-up images, user reviews, prices, admission times, English descriptions, or verification timestamps. No Google Places use. This uses the **existing** Railway DB, main repo and CI, with `ON CONFLICT (id) DO NOTHING` preserving user edits. Require all CI, security/quality checks, Vercel/frontend tests, and Railway deployment to succeed, then verify the **live API** is at least 190 nationwide and 67 in Chon Buri with unique IDs and source records present before any claim of completion. This is not full province coverage and is not an authorization to publish remaining 127 unresolved records.
