# TAT Open Data release 004 — four source-reviewed attractions

**Reviewed:** 2026-11-04 (Asia/Bangkok). Source: [TAT attraction
dataset](https://datacatalog.tat.or.th/dataset/tourist-attraction),
`attraction.csv`, SHA-256
`2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`.
Using the unchanged official dataset and existing staging script, source rows
**174–217** were scanned: **44** records, **25** candidates, **19** rejected;
the **next index is 218**. Rejected: unreviewed category 11, missing Thai
name 4, short description 3, duplicate in seed/batch 1.

| Approved Thai name | Province / TAT coordinates | Independent public-sector source |
| --- | --- | --- |
| กลุ่มท่องเที่ยวบ้านน้ำเชี่ยว | ตราด; 12.1892542, 102.4612939 | [Department of Agricultural Extension](https://agrotourismapp.doae.go.th/article/148) community tourism entry; [PRD](https://www.prd.go.th/th/content/category/detail/id/31/iid/253039) confirms local identity |
| ถ้ำภูผาเพชร | สตูล; 7.1246747, 99.9981765 | [ONEP natural site registry](https://naturalsite.onep.go.th/site/detail/413) confirms Palm Pattana, Manang, Satun and limestone cave |
| ชุมชนริมน้ำจันทบูร | จันทบุรี; 12.6127731, 102.1136881 | [ONEP cultural environment registry](https://culturalenvi.onep.go.th/site/detail/2704) identifies historic Chanthaboon riverfront |
| เมืองเก่าอุทัยธานี | อุทัยธานี; 15.4088251, 99.8270594 | [Uthai Thani municipality](https://www.uthaicity.go.th/tourism/contents-4-49) officially describes the old-town conservation area |

These sources verify identities and provinces, not exact tourist entrances;
pins remain unaltered TAT coordinates. The original TAT cave copy claims
it is the **world's fourth largest cave**, which was not independently
substantiated. Published copy instead uses the ONEP-supported description
of a large limestone cave and its formations. Other long descriptions are
shortened to remove unconfirmed services and promotional assertions.

The live production API before release returned 123 unique attractions and
**none** of the four approved Thai names. The other **21 staged candidates
remain unpublished**. Do not invent photographs, ratings, reviews,
translations, entry prices, opening hours or verification timestamps.

Publication uses the existing insert-only Railway seed initialization with
`ON CONFLICT (id) DO NOTHING`. Expected total: **127 places across all 77
provinces**. No Google Places/Routes calls are needed and the user's
฿500/month cost policy remains unchanged.
