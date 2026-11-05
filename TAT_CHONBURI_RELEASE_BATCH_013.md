# Chon Buri TAT batch 013: source-first review, three validated sites

Source: [official TAT open data](https://datacatalog.tat.or.th/dataset/tourist-attraction); `attraction.csv` SHA-256 `2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`.

Production verified before this change: **190 destinations nationwide, 67 in Chon Buri, 77 provinces** (read-only production API workflow #42032663647). After this release, **expected** 193 nationwide and 70 in Chon Buri, subject to CI + Railway + live API verification. The 3 original TAT IDs and Thai names are retained. **One incorrect TAT coordinate is corrected using an independent government UTM survey; the correction is explicitly documented below.** Government source text confirms destinations and public relevance, but not survey-grade TAT pin precision or guaranteed current opening times.

| Destination | Corroborating public-sector source | Important caveat |
|---|---|---|
| `tat-201005182246293428` อ่าวดงตาล | [Ministry of Tourism: หาดดงตาล](https://www.thailandtourismdirectory.go.th/th/attraction/4939), [DASTA: อ่าวดงตาล](https://cbtthailand.dasta.or.th/webapp/relattraction/content/1889/) | In Sattahip military area; access rules can change. The TAT site calls the bay `อ่าวดงตาล`, the Ministry calls the beach `หาดดงตาล`. Same coastal visitor area, publish once only. |
| `tat-2015120421550718119` หาดเทียนทะเล | [Ministry of Tourism: หาดเทียนทะเล](https://www.thailandtourismdirectory.go.th/attraction/1707) | Separate adjacent beach, military access restrictions apply; don't infer opening hours from unusual source time fields. **Original TAT pin 12.8139169,100.9168171 was about 19 km north and REJECTED.** [Department of Mineral Resources geological site data](https://data.dmr.go.th/dataset/8df9e619-2c15-4592-aaa5-42424b334b6f/resource/c0a6790d-4249-40ec-a2ff-bfa74c755522/download/66_summary_gmdb.pdf) places this beach at WGS84 UTM zone 47P E709445 N1398486. Converting UTM EPSG:32647 to WGS84 EPSG:4326 gives **12.643518498083282,100.92836536539475**. [Royal Thai Navy marine science survey](https://science.navy.mi.th/storage/frontend/article/23168/file/th/รายงานผลการศึกษาและวิเคราะห์คุณภาพน้ำทะ.pdf) reports a sea sampling point in front of the same beach at 12.643735,100.927740, independently confirming the region. This is a corrected geology survey landmark coordinate, not a guaranteed pedestrian entrance pin. |
| `tat-201005182246293336` เมืองพระรถ | [Chon Buri Provincial Administrative Organization local development plan](https://www.chon.go.th/cpao/Download?file=jdownloads%2Fplan%2Fplan66-70.pdf&id=13664) | Ancient settlement/archaeological location in Phanat Nikhom, distinct from previously published temple and art sites. |

Full-source TAT Chon Buri review ledger: `api/chonburi-tat-194-row-dispositions.tsv`.

| Provisional source record disposition | Count |
|---|---:|
| Linked to published seed records, including proposed 3 | 69 |
| Confirmed alias/duplicate (Viharn Sien) | 1 |
| Pending independent location/identity/access review | 46 |
| Pending category-3 venue and coordinates review | 76 |
| Missing usable Thai name | 2 |
| **Total** | **194** |

**124 records still require follow-up**: the 46 individual candidates, 76 type-3 entries without mapped GPS, and 2 records without valid Thai name. Every source row has an explicit action and evidence or blocker. Verified *existence* without coordinates, such as Burapha University's Marine Science Institute, is not an authorization to invent GPS or publish. The existing Space Inspirium type-3 entry is a source duplicate of an existing published TAT ID, not another new place.

No invented photos, ratings, reviews, admission prices, hours or GPS. No Google Places call or additional charges. Use the existing Railway project, main repo and existing CI; do not merge if any check fails. After Railway deploy, run read-only paginated API verification for **193 unique IDs, at least 70 Chon Buri, 77 provinces** and presence of all three TAT IDs. This is not yet an exhaustive list of destinations in the province.
