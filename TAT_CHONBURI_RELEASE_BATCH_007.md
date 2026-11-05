# Chon Buri full-inventory QA and reviewed release 007

## Reproducible official source census

Official dataset: https://datacatalog.tat.or.th/dataset/tourist-attraction
Official CSV SHA-256: `2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`

The existing read-only `TAT Open Data Import Review` workflow downloaded the original CSV and used `api/chonburi-tat-inventory.cjs` to inspect **all** source rows, not just a first page or 25-place batch. Run: https://github.com/athipan1/pai-naidee-ui-spark/actions/runs/41943226291

- 8,848 TAT rows nationwide; **194 Chon Buri-labelled source rows**.
- Existing published Chon Buri seed baseline: **10** locations.
- From those 194 rows: **9 already published**, **107 pass initial schema/name/pin filters**, **76 have unreviewed categories**, **2 lack a usable Thai name**.
- Of the 107 initial candidates, **17** in this PR have corroborating public references below and are proposed for publication. **90** remain for follow-up individual review. The 76 unreviewed-category records are *not necessarily invalid attractions*: their category/coordinates must be separately assessed. A TAT source record is not automatically an independently visitable attraction.
- Expected after deploy (subject to CI and Railway confirmation): **150 locations nationwide, 27 in Chon Buri, 77 provinces**. No claim of exhaustive tourist-place coverage.

## Independent public verification / source cross-checks

Each selected record keeps the original TAT source ID, Thai name and source coordinates. Descriptions are intentionally short and do not include prices, operating hours, review ratings or fabricated photos. Where an operator has a different spelling (e.g. the Royal Thai Navy's Chakri Naruebet ship) or district metadata, the original TAT source is not silently modified. Those aliases and administrative differences warrant a separate review.

| Selected attractions (TAT source names) | Corroborating official source |
| --- | --- |
| พิพิธภัณฑ์พระจุฑาธุชราชฐาน; สะพานอัษฎางค์ | [Chulalongkorn University museum](https://www.cuartculture.chula.ac.th/about/departments/phra-chudhadhuj-ratchasthan-palace-museum/) |
| ช่องเขาขาด; ศาลเจ้าพ่อเขาใหญ่; หาดถ้ำเขาพัง | [TAT Ko Sichang destination description](https://thai.tourismthailand.org/Attraction/เกาะสีชัง) |
| หาดจอมเทียน | [TAT Hat Jomtien](https://thai.tourismthailand.org/Attraction/หาดจอมเทียน) |
| หาดพัทยา | [TAT Pattaya Beach](https://thai.tourismthailand.org/Attraction/หาดพัทยา) |
| เขาสามมุข | [TAT Khao Sam Muk](https://thai.tourismthailand.org/Attraction/เขาสามมุข) |
| ตลาดเก่าอ่างศิลา | [TAT Ang Sila historic market](https://thai.tourismthailand.org/Attraction/ตลาดเก่าอ่างศิลา-133-ปี) |
| เรือรบหลวงจักรีนฤเบศร์ | [Royal Thai Navy visitor information](https://www.navy.mi.th/index.php/d27a5f387f42a51a45571d50a464df1e) |
| ศูนย์อนุรักษ์พันธุ์เต่าทะเล ฐานทัพเรือสัตหีบ | [Royal Thai Navy conservation center](https://acdc.navy.mi.th/xmsqeigshefc) |
| เกาะแสมสาร | [TAT official island guide](https://thai.tourismthailand.org/Articles/เรื่องน่ารู้ก่อนไปเกาะแสมสาร-จ-ชลบุรี) |
| อุทยานใต้ทะเลเกาะขาม | [TAT official Ko Kham guide, Sattahip](https://thai.tourismthailand.org/Articles/ko-kham-th) |
| สวนนงนุช | [TAT Nong Nooch attraction](https://thai.tourismthailand.org/Attraction/สวนนงนุช) |
| พระพุทธรูปแกะสลักเขาชีจรรย์ | [TAT Khao Chi Chan](https://thai.tourismthailand.org/Attraction/พระพุทธรูปแกะสลักเขาชีจรรย์) |
| วิหารเทพสถิตพระกิติเฉลิม | [TAT Na Ja shrine](https://thai.tourismthailand.org/Attraction/วิหารเทพสถิตพระกิติเฉลิม-ศาลเจ้าหน่าจาซาไท้จื้อ) |
| วัดญาณสังวรารามวรมหาวิหาร | [Ministry of Tourism directory](https://www.thailandtourismdirectory.go.th/th/attraction/1696) |

TAT web pages are additional publication channels from the same authority, *not* independent of TAT Open Data in an institutional sense. Navy, Chulalongkorn University and Ministry of Tourism references provide independently operated sources for their respective entries. Latitude and longitude are copied from the TAT CSV; **corroborating public pages are not proof of exact GPS pin accuracy**. A reviewer must resolve any incorrect map pin or name alias identified later before attaching directions/booking features.

## Pending items and production discipline

The original set includes duplicate attractions with different names, potential overlaps between a building and its compound, older venue entries, sometimes inaccurate districts, and source coordinates requiring checking. For example, the TAT record for วัดญาณสังวรารามวรมหาวิหาร lists สัตหีบ but the Ministry of Tourism directory identifies บางละมุง; this release seeds *province* and GPS only, not an unverified district.

No TAT content is imported into the Google Places quota system. No external photo is created. `ensureSchema` uses `ON CONFLICT (id) DO NOTHING`, retaining user edits. Only merge after existing CI succeeds; after Railway deployment, verify live API pagination, Chon Buri count and duplicate IDs. Do not represent this as covering every possible attraction in Chon Buri.
