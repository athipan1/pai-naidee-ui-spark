# Chon Buri TAT batch 011 (5 reviewed source records)

Current Railway production baseline after batch 010: **182 nationwide / 59 Chon Buri / 77 provinces**, backed by read-only [workflow #41983269549](https://github.com/athipan1/pai-naidee-ui-spark/actions/runs/41983269549), with 182 distinct location IDs. This batch targets **187 nationwide / 64 Chon Buri** after all CI/Deployment/live API checks.

The original TAT Open Data CSV is fixed by SHA256 `2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`: https://datacatalog.tat.or.th/dataset/tourist-attraction. Names, source TAT IDs and lat/lng in the batch file exactly preserve source fields. Public references below corroborate destination identity, **not** exact location-pin precision or guaranteed current admission.

| Original TAT name | Additional public-source corroboration |
| --- | --- |
| ชมรมส่งเสริมการท่องเที่ยวโดยชุมชนบ้านชากแง้ว | [Tourism Authority of Thailand: community and old Chinese market](https://thai.tourismthailand.org/Articles/เดินเล่นย้อนอดีต-ชุมชนจีนโบราณบ้านชากแง้ว). **Editorial unit:** the established old town/community, not an organization office; retained official TAT name, no invented hours |
| วัดพระใหญ่ | [Ministry of Tourism & Sports Wat Phra Yai attraction](https://www.thailandtourismdirectory.go.th/th/attraction/21350), distinctive temple site; nearby `เขาพระตำหนัก` is already a separate scenic hill in batch 010 |
| พิพิธภัณฑ์ภาพวาด 3 มิติ | [Ministry of Tourism & Sports Art in Paradise Pattaya](https://www.thailandtourismdirectory.go.th/attraction/21304) |
| ถ้ำเขาชะอางค์โอน | [Pluang Thong Municipality environmental survey](https://ploungthong.go.th/public/list_upload/backend/list_255/files_1302_1.pdf) documenting Khao Cha Ang On cave and associated temple (not Khao Cha Ang Ha Yot cave from batch 010) |
| เมืองจำลอง | [Ministry of Tourism & Sports Mini Siam](https://www.thailandtourismdirectory.go.th/attraction/5247) |

## Mandatory release and remaining data review

No fabricated photographs, ratings, opening hours, prices, current reviews, English descriptions or verification timestamps. Do not call Google Places. The existing quality gates, CI and Railway importer apply unchanged, with editor changes preserved. Identity cross-checks are not assurances of venue opening at any particular date; verify before planning real itineraries.

The cumulative source-wide provisional ledger after this batch contains: **63** source rows linked to published attractions, **53** pending individual verification, **76** pending category/location review, **2** with no usable Thai name, total 194. The number of source rows labelled published is not the same as distinct app attractions (some legacy curated places have no matching TAT source row). “All Chon Buri attractions complete” cannot be claimed until every 194 source row receives an evidence-based final disposition. Category-3 records need special validation, because they include duplicates, operators with potentially changed names/closures, and missing coordinates.
