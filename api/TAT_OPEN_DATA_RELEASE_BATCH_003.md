# TAT Open Data release 003 — three individually checked attractions

**Review date:** 2026-11-04 (Asia/Bangkok). Official [TAT attraction
dataset](https://datacatalog.tat.or.th/dataset/tourist-attraction),
`attraction.csv` SHA-256
`2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`.
Source rows **124–173** scanned: 50 rows, 25 staged, 25 excluded. The
existing [review workflow](https://github.com/athipan1/pai-naidee-ui-spark/actions/runs/41862617965)
was queued when the same immutable official CSV was downloaded and processed
locally with the existing staging script. Next index **174**.

| Official TAT record | Province, TAT pin | Independent corroboration |
| --- | --- | --- |
| โฮมสเตย์บ้านท่าขันทองการท่องเที่ยวโดยชุมชน | เชียงราย; 20.1964598, 100.2372647 | [DASTA CBT Thailand](https://cbtthailand.dasta.or.th/webapp/community/content/44/) confirms Ban Tha Khan Thong community and Chiang Saen, Chiang Rai; [MOTS](https://www.mots.go.th/images/v2022_1744169293689MTIzMjE0NS5wZGY%3D.pdf) lists the community |
| หอภาพถ่ายล้านนา | เชียงใหม่; 18.7898668, 98.9885823 | [Chiang Mai Provincial Administration](https://infoera.chiangmaipao.go.th/Assets/upload/Education_Outdoor/%E0%B8%AB%E0%B8%AD%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%A5%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%99%E0%B8%B2.pdf) identifies it across from the Three Kings Monument; [CMU Fine Arts](https://www.finearts.cmu.ac.th/visualart/) lists its photography center |
| ศูนย์ศึกษาวิจัยและพิพิธภัณฑ์ไดโนเสาร์ | ขอนแก่น; 16.6777635, 102.2661556 | [Department of Mineral Resources official museum](https://e-service.dmr.go.th/rcmk/) confirms museum identity and Khon Kaen province |

The coordinates are **original TAT location pins**, not independently certified
building entrances. Three names were absent from the live 120-record
production set when checked across all three API pages before release.

Rejected reasons in the stage-003 manifest: unreviewed category 17,
missing Thai name 7, insufficient description 1. The other **22 staged
candidates are not published**; including a record explicitly marked
`(ซ้ำ)` in its Thai name. No speculative reviews, ratings, images, English
translations, opening times or prices are published. All three records use
`verifiedAt: null` rather than falsely implying on-site verification.

Ingestion is append-only via the existing Railway seed path, with
`ON CONFLICT (id) DO NOTHING`. Expected total is **123**, retaining all 77
provinces. This batch makes **no Google Places/Routes API calls**, preserving
the user's ฿500/month spending policy. Next review starts at **174**.
