# TAT Open Data release 002 — five source-reviewed attractions

**Review date:** 2026-11-04 (Asia/Bangkok). **Source:** [TAT official
attraction open dataset](https://datacatalog.tat.or.th/dataset/tourist-attraction),
`attraction.csv`; original SHA-256
`2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`.
Second review window: [GitHub Actions run 41859841159](https://github.com/athipan1/pai-naidee-ui-spark/actions/runs/41859841159),
artifact `tat-open-data-review-41859841159` (ID `13338439593`).

## Five individually checked locations

| TAT ID | Thai name / province | TAT point (lat, lng) | Independent corroboration |
| --- | --- | --- | --- |
| 20251225110647001 | พิพิธภัณฑ์ศาลรัฐธรรมนูญ / กรุงเทพฯ | 13.7420208, 100.5008664 | [Bangkok secondary educational authority](https://www.sesao1.go.th/school-activities/44093/), museum at Ban Chao Phraya Rattanathibet, Phra Nakhon |
| 20251224114028001 | วิสาหกิจชุมชนบ้านหน้าเขา-ในวัง / ตรัง | 8.00575743001172, 99.74576681575446 | [Ministry of Tourism and Sports sustainable tourism directory](https://www.mots.go.th/download/Research/ProjectToPromoteSustainableTourism.pdf), Trang community enterprise |
| 20251215120121001 | เขตห้ามล่าสัตว์ป่าถ้ำผาท่าพล / พิษณุโลก | 16.5088643, 100.6602245 | [Department of National Parks official location bounds](https://portal.dnp.go.th/DNP/FileSystem/download?uuid=bcd5a82c-ea5b-4260-a741-d0137a54a60b.pdf), lat 16°29′56″–16°31′28″ N, long 100°39′27″–100°40′17″ E |
| 20251213065714001 | วัดเขาสิงโต / สระแก้ว | 13.9895613, 102.0081452 | [Sa Kaeo Provincial Public Relations Office](https://sakaeo.prd.go.th/th/content/category/detail/id/391/iid/99230), temple in Ban Kaeng, Mueang Sa Kaeo |
| 20251213063829001 | พิพิธภัณฑ์การแพทย์แผนไทยอภัยภูเบศร / ปราจีนบุรี | 14.0541674, 101.394816 | [Prachin Buri Tourism and Sports Office](https://prachinburi.mots.go.th/news/1405), museum inside Chao Phraya Abhaibhubejhr Hospital |

These independently establish the attraction identities and province, and DNP
also independently confirms the Pha Tha Phon coordinates to within its official
protected-area bounds. The others' TAT coordinates remain **location pins,
not independently certified site entrances**. Do not promise visiting hours,
prices, photography or operational availability.

## Manual source corrections and quarantines

- `วัดเขาสิงโต`: the official TAT **English description incorrectly calls the
  temple part of Prachinburi Province**. Its TAT Thai province and independent
  Sa Kaeo government records say **Sa Kaeo**. The suspect English description
  is deliberately **not published** (`descriptionEn: null`). The Thai text is
  shortened at a complete sentence to avoid unverified access restrictions.
- `พิพิธภัณฑ์ศาลรัฐธรรมนูญ`: the English TAT field says `THE CONSTITUIONAL
  COURT MUSEUM` (misspelled). The name is corrected to `Constitutional Court
  Museum`, with the source Thai name preserved exactly. No English description
  is made up.
- `พิพิธภัณฑ์การแพทย์แผนไทยอภัยภูเบศร`: the staging preview clips its very
  long description at 1,200 characters **mid-sentence**. Publish only an
  earlier complete sourced excerpt; its English summary is also clipped at a
  complete sourced sentence.
- The other 20 staged candidates stay **unpublished** pending per-record review.
  Do not lower category, name, source, coordinate or duplicate requirements.

## Source and live-production reconciliation

- Source rows **79–123** scanned: 45 rows, 25 staged candidates, 20 rejected.
  Rejection counts: category unreviewed 14, missing Thai names 2, descriptions
  too short 4. No fabricated ratings, media, translations or visit details.
- Source digest matches release 001 exactly. Read-only live Railway check on
  2026-11-04 returned **115** attractions and **zero** duplicate TAT IDs or
  normalized Thai/English names among all 25 staged candidates.
- Release 002 is **exactly five** immutable IDs; Railway startup uses `INSERT
  ... ON CONFLICT (id) DO NOTHING`, without overwriting existing editorial
  rows. The expected total after successful publication is **120**.
- The import workflow uses **no Google Places/Routes API calls** and does not
  modify the existing Google Cloud daily guard or ฿500/month spending policy.
- Continue a future review batch at source index **124**. Keep all other rows
  gated for manual inspection; do not auto-ingest the 8,848-row source file.
