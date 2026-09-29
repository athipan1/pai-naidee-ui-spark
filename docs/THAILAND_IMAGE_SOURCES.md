# Thailand Attraction Image Sources

PaiNaiDee uses place-specific travel photos for its built-in Thailand attraction fallbacks.

The browser loads these images from Unsplash. The source photo page and photographer are retained
in `src/shared/data/thailandPlaceImages.ts` so the image set can be audited or replaced later.

| Place | Photographer | Source |
| --- | --- | --- |
| Phi Phi Islands | Ranjith Alingal | https://unsplash.com/photos/white-boat-on-beach-shore-during-daytime-rB1CSCwu3ls |
| Wat Phra Kaew | Worachat Sodsri | https://unsplash.com/photos/yaksha-guardians-wat-phra-kaew-bangkok-thailand-VtBvATAwMUA |
| Doi Inthanon | Haydn Golden | https://unsplash.com/photos/a_P2nDysDt0 |
| Damnoen Saduak Floating Market | Marek Okon | https://unsplash.com/photos/people-riding-on-boat-on-river-during-daytime-S4WDLqubwoc |
| Wat Arun | Martijn Vonk | https://unsplash.com/photos/wat-arun-temple-on-the-chao-phraya-river-bangkok-7KSiPWt82us |
| Phuket Beach | Denys Nevozhai | https://unsplash.com/photos/guNIjIuUcgY |
| Khao Yai National Park | Hongbin | https://unsplash.com/photos/Q9pRPbCt658 |
| Bangkok / Yaowarat street food | Kaden Taylor | https://unsplash.com/photos/nighttime-street-food-vendors-in-bangkok-k8dwH-poJ2c |

All selected photos were surfaced by Unsplash as free to use under the Unsplash License at the time
they were added. If the application later migrates these images into Supabase Storage or another
CDN, preserve this source metadata.
