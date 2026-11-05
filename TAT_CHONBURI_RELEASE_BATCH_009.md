# Chon Buri TAT batch 009 (ten additional tourist locations)

Original immutable TAT Open Data CSV SHA-256: `2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366` from [TAT Open Data](https://datacatalog.tat.or.th/dataset/tourist-attraction).

This is a **manually reviewed subset**, **not** automatic publication of all 194 TAT Chon Buri source rows. Each record uses its original TAT source ID, Thai name and raw coordinates. Independent government/municipality references establish the named locations, not survey-grade accuracy of TAT GPS. Ratings, reviews, hours, fees, photograph URLs and speculative English translations are deliberately absent.

| TAT place | Corroborating source and duplicate notes |
| --- | --- |
| หาดวงศ์อมาตย์ | [Ministry of Tourism & Sports tourist directory](https://www.thailandtourismdirectory.go.th/attraction/1693); distinct from Pattaya Beach |
| หาดบ้านอำเภอ | [Ministry of Tourism & Sports tourist directory](https://www.thailandtourismdirectory.go.th/attraction/2331) |
| หาดทรายแก้ว | [Ministry of Tourism & Sports tourist directory](https://www.thailandtourismdirectory.go.th/th/attraction/3243); **Sattahip**, not another beach with the same name in another province |
| วัดเขาพระพุทธบาทบางทราย | [TAT site-specific Wat Khao Phra Phutthabat Bang Sai guide](https://thai.tourismthailand.org/Attraction/วัดเขาพระพุทธบาทบางทราย) |
| หอพระพนัสบดี | [Phanat Nikhom Municipality attractions](https://phanatnikhomcity.go.th/เทศบาลเมืองพนัสนิคม/tourism-location/) |
| พระพุทธมิ่งเมือง | [Ministry of Tourism & Sports directory](https://www.thailandtourismdirectory.go.th/attraction/3235) and [municipal 2026 ceremony](https://phanatnikhomcity.go.th/พิธีบวงสรวงพระพุทธมิ่ง/) |
| มณฑปรอยพระพุทธบาท | [Chon Buri Provincial Tourism & Sports Office](https://www.chonburimots.go.th/th/หน้าแรก/98-ภาษาไทย/การท่องเที่ยว/248-มณฑปรอยพระพุทธบาท.html), [TAT Ko Sichang guide](https://thai.tourismthailand.org/Attraction/เกาะสีชัง) |
| ถ้ำจักรพงษ์ | [TAT Ko Sichang guide](https://thai.tourismthailand.org/Attraction/เกาะสีชัง); identifies Phra Lueang and cave-monastery |
| วัดช่องแสมสาร | [Ministry of Tourism & Sports directory](https://www.thailandtourismdirectory.go.th/th/attraction/21395); temple complex and Luang Pho Dam |
| อ่างเก็บน้ำบางพระ | [Bang Phra Municipality official tourism list](https://bangphrachon.go.th/public/list/data/index/menu/1545) and [Ministry of Tourism & Sports directory](https://www.thailandtourismdirectory.go.th/th/attraction/4938); do **not** simultaneously publish the overlapping wildlife sanctuary record until identity/area distinction is reviewed |

Previous production: **164 nationwide / 41 Chon Buri / 77 provinces**. Expected if CI and Railway deployment pass: **174 nationwide / 51 Chon Buri / 77 provinces**, to be confirmed by live API pagination and unique ID tests.

### Outstanding review

The source-wide census in PR #356 counted 194 TAT source rows from Chon Buri: nine previously published TAT rows, 107 initial candidates, 76 other-category rows, and two rows without usable Thai names. Batches 007/008/009 add 41 source records after the earlier baseline of ten published places; a **source record is not necessarily a unique, open destination**. Remaining records require disposition: already-published/alias, reviewed and publishable, closed or uncertain status, unrelated commercial category, or source-data problem. Review explicitly for potentially repeated labels (e.g. วัดเกาะลอย versus เกาะลอย, อ่างเก็บน้ำบางพระ versus its wildlife sanctuary, and multiple show/waterpark names).

Only the existing importer and CI are used; Railway editor changes are preserved through `ON CONFLICT DO NOTHING`. No Google Places API calls or credentials are needed.


### Full 194-row provisional disposition manifest (batch 009)

The source-wide row accounting in `api/chonburi-tat-194-row-dispositions.tsv` is locked by `api/chonburi-194-dispositions.node-test.cjs`, with one row per official TAT source record:

| Provisional status | Count |
| --- | ---: |
| Already published or newly approved across batches 005–009 | 50 TAT source rows |
| Pending individual verification | 66 |
| Pending category mapping and possible missing coordinates | 76 |
| Missing usable Thai attraction name | 2 |
| **Total source rows** | **194** |

These 50 published source rows are not the same as the **51** distinct Chon Buri places in the seeded app: one legacy curated attraction does not correspond to its own independent source row in this census. Records in the pending groups are **not** being published, and the source may contain duplicates or closed operators. “ครบ” requires every row to have an evidence-backed final disposition; these initial statuses are deliberately provisional.
