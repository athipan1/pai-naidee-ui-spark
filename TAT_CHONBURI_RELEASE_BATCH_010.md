# Chon Buri TAT batch 010 (8 reviewed places)

The current published Railway baseline is **174 nationwide / 51 Chon Buri / 77 provinces**, confirmed by the read-only production API audit in [GitHub Actions #41956611182](https://github.com/athipan1/pai-naidee-ui-spark/actions/runs/41956611182). This change proposes **8 additional Chon Buri places**, target **182 nationwide / 59 Chon Buri** after CI, deployment and another live API audit.

Original immutable [TAT attraction.csv](https://datacatalog.tat.or.th/dataset/tourist-attraction) SHA256 `2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`. Exact source TAT record IDs, Thai names and coordinates are preserved in `api/additional-tat-open-data-batch-010.cjs`. Government pages corroborate attractions and municipality, **not centimetre-level GPS accuracy**.

| TAT name | Additional government / public-sector evidence |
| --- | --- |
| ศูนย์ศึกษาธรรมชาติและอนุรักษ์ป่าชายเลนเพื่อการท่องเที่ยวเชิงนิเวศ | [TAT](https://thai.tourismthailand.org/Attraction/ศูนย์ศึกษาธรรมชาติและอนุรักษ์ป่าชายเลนเพื่อการท่องเที่ยวเชิงนิเวศ) and [2026 Department of Marine and Coastal Resources visit](https://dmcrth.dmcr.go.th/mraccp/detail/28832/) |
| แหลมแท่น | [Ministry of Tourism & Sports tourism directory](https://www.thailandtourismdirectory.go.th/th/attraction/3237) |
| วัดสัตหีบ (วัดหลวงพ่ออี๋) | [Ministry of Tourism & Sports tourism directory](https://www.thailandtourismdirectory.go.th/attraction/3244) |
| วัดตาลล้อม | [Saensuk Municipality tourism list](https://www.saensukcity.go.th/สถานที่สำคัญ.html) and [ONEP cultural site](https://culturalenvi.onep.go.th/site/detail/5266) |
| วัดใต้ต้นลาน | [Fine Arts Department Chon Buri National Library](https://finearts.go.th/chonburilibrary/view/26374-เรื่อง-วัดใต้ต้นลาน) |
| ถ้ำเขาชะอางค์ห้ายอด | [Ministry of Tourism & Sports](https://www.thailandtourismdirectory.go.th/attraction/5064) and [Chon Buri Provincial Tourism & Sports Office](https://chonburi.mots.go.th/news/421) |
| วัดชัยมงคล (พัทยาใต้) | [Ministry of Tourism & Sports: วัดชัยมงคล พระอารามหลวง](https://www.thailandtourismdirectory.go.th/attraction/21708) |
| เขาพระตำหนัก | [Ministry of Tourism & Sports: เขาพระตำหนัก หรือ เขาพระบาท](https://www.thailandtourismdirectory.go.th/th/attraction/1687) |

## Duplicates and editorial safeguards

- The TAT record `เขาพระบาท` points to the same Pattaya viewpoint as `เขาพระตำหนัก`; **do not add** the second as a new distinct attraction. The two names should be linked by the existing alias system after review.
- `เกาะลอยศรีราชา` is already in Production; `สวนสาธารณะเกาะลอย` and `วัดเกาะลอย` represent spaces in or adjacent to the same compound and are **withheld pending granularity review**.
- The 194-row source-wide review ledger `api/chonburi-tat-194-row-dispositions.tsv` now has **58 source records classified published**, **58 pending individual verification**, **76 pending category/location mapping**, and **2 missing a usable Thai name**. It is a **provisional disposition ledger**, not evidence that all remaining rows can or should be separately published.
- All eight additions have **no invented photos, ratings, reviews, current opening hours, admission prices, timestamps or English descriptions**. No Google Places, no new repo/workflow, no safety gate reduction; existing `ON CONFLICT (id) DO NOTHING` preserves editor changes.
- CI and Railway deployment must both be successful before any Production completion claim. Live pagination must show **182 nationwide / 59 Chon Buri / 182 distinct IDs**.

The province is **not yet complete**. Finish all 194 source rows with evidence-backed dispositions, including aliases, closed attractions, wrong coordinates and category-3 leisure operators, before claiming exhaustive coverage.
