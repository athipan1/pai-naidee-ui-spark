# Chon Buri TAT Open Data batch 005 — review evidence

The source is the Tourism Authority of Thailand public attraction CSV (`attraction.csv`),
SHA-256 `2b8d35bbcb58c12b5c57f7f52e95d418867d4892a962362567c0d28a5be51366`.

Province-specific inventory: 194 source rows labelled ชลบุรี, spanning eight districts.
This is **not** a claim that all 194 are valid, unique, or open to visitors. The current
production baseline is 127 nationwide, four in Chon Buri. This first release proposes
just three independently cross-checked places; no Google Places API is used.

| TAT ID | Thai name | District | Independent public source |
| --- | --- | --- | --- |
| `20211221230034734283` | แกรนด์แคนยอนคีรี | เมืองชลบุรี | [Tourism Authority of Thailand](https://thai.tourismthailand.org/Attraction/แกรนด์แคนยอน-ชลบุรี) |
| `20160528165231008560` | อุทยานรังสรรค์นวัตกรรมอวกาศ (สเปซ อินสไปเลียม) | ศรีราชา | [Government of Thailand](https://www.thailand.go.th/public/index.php/visit-thailand-detail/--space-inspirium-) |
| `20160528170226008563` | ป่าสิริเจริญวรรษ | สัตหีบ | [Royal Development Projects Board](https://km.rdpb.go.th/Project/View/6508) |

Names, IDs and coordinates are copied from the TAT CSV. The cited public sources
independently confirm the attractions and their locations, but not pin-level GPS
precision; coordinate verification on a map should remain part of final review.
Source descriptions were deliberately shortened to exclude unsupported claims.
Ratings, reviews and image URLs are not fabricated.

The 191 other Chon Buri source rows remain unpublished pending individual checks,
including aliases, closure status, location quality, and duplicates. The goal of
completing Chon Buri coverage is not met by this small release.
