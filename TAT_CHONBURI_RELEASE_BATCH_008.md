# Chon Buri TAT Open Data batch 008

This is the second reviewed group following the **full 194-row Chon Buri TAT audit** in `TAT_CHONBURI_RELEASE_BATCH_007.md`. The published baseline before this PR is 150 nationwide / 27 Chon Buri, with 77 provinces. This PR proposes 14 additional distinct attractions, target **164 nationwide / 41 Chon Buri**.

TAT official dataset: https://datacatalog.tat.or.th/dataset/tourist-attraction
CSV checksum: `2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`.
Coordinates and Thai names come from the TAT CSV. Secondary government / public-sector published descriptions below corroborate these places, but these references do not independently prove the exact source latitude/longitude.

| Place(s) | Public-sector corroboration |
| --- | --- |
| หาดนางรำ; หาดนางรอง; หาดน้ำใส | [TAT 2026 three Sattahip beaches](https://thai.tourismthailand.org/Articles/nang-ram-beach-nang-rong-beach-nam-sai-beach-th) |
| หาดเตยงาม | [TAT Toey Ngam Beach](https://thai.tourismthailand.org/Attraction/หาดเตยงาม) |
| เกาะลอยศรีราชา | [TAT Ko Loi Si Racha](https://thai.tourismthailand.org/Attraction/เกาะลอยศรีราชา) |
| พิพิธภัณฑ์ธรรมชาติวิทยาเกาะและทะเลไทย | [TAT official marine museum](https://thai.tourismthailand.org/Attraction/พิพิธภัณฑ์ธรรมชาติวิทยา-เกาะและทะเลไทย-เกาะแสมสาร) |
| พิพิธภัณฑ์ทหารนาวิกโยธิน | [Government Tourism Directory](https://www.thailandtourismdirectory.go.th/attraction/4965) |
| ตลาดน้ำสี่ภาคพัทยา | [TAT four-region floating market](https://thai.tourismthailand.org/Attraction/ตลาดน้ำ-4-ภาค-พัทยา) |
| วัดใหญ่อินทราราม (พระอารามหลวง) | [TAT Wat Yai Intharam](https://thai.tourismthailand.org/Attraction/วัดใหญ่อินทราราม) |
| น้ำตกชันตาเถร | [TAT Chan Ta Then Falls](https://thai.tourismthailand.org/Attraction/น้ำตกชันตาเถร) |
| เกาะสาก; เกาะครก; หาดแสม | [TAT Ko Lan (nearby islands and Samae Beach)](https://thai.tourismthailand.org/Attraction/เกาะล้าน), [TAT Ko Sak](https://thai.tourismthailand.org/Attraction/เกาะสาก) |
| เกาะขามใหญ่ (Ko Sichang area, **not** Ko Kham Sattahip) | [TAT Ko Sichang destination guide](https://thai.tourismthailand.org/Attraction/เกาะสีชัง) |

All selected IDs were counted as initial candidates by the immutable TAT full-source audit, with no exact-identity match in the already-published seed. Close proximity or related compound names are not automatically duplicate attractions: e.g. the Ko Loi island and its temple are different entities; Ko Kham Yai near Ko Sichang is distinct from Ko Kham in Sattahip.

**Safety:** no fabricated photographs, opening hours, prices, ratings, English translations or review counts. No Google API calls. Seed import remains append-only and does not overwrite editor changes. Do not claim the whole province is exhaustively complete: source has further candidates requiring review, category expansion and possible closure/district corrections.
