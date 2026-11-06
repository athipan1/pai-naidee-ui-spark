# Chon Buri TAT batch 014: Wat Khao Bo Kwang Thong (draft, not authorized for deploy)

The existing Railway user-supplied read-only snapshot dated 2026-11-07 showed 70 Chon Buri records and no confirmed match for `tat-2015120421550718075`. **This is not a new direct PostgreSQL read**; re-run read-only SQL and live paginated API reconciliation immediately before merge/deploy.

## Independent place identity and geographic evidence

- Original TAT ID: `tat-2015120421550718075`; Thai name: วัดเขาบ่อกวางทอง; original TAT GPS `13.3242485,101.3090737` is **rejected**, ~4.70 km away from the independently corroborated temple location.
- Municipality official tourism catalogue confirms temple identity in Moo 4, Bo Kwang Thong, Bo Thong, Chon Buri: https://www.bokwangthong.go.th/catalog/travels/206
- Municipality official disaster management plan lists school and temple in Moo 4 with coordinates `13.282958,101.319731` and `13.282924,101.318249` in that order. Verify the actual PDF table if reusing the second point: https://www.bokwangthong.go.th/upload/documents_file/documents_file_38_52_267381.pdf
- Burapha University publicly funded tourism research catalogue explicitly labels `วัดเขาบ่อกวางทอง` as an attraction and supplies its *site* coordinate `13.283030,101.318800`: https://www.gi-cbt.buu.ac.th/location.php?id=27
- The BUU point is only ~61 m from the municipality's temple point. Use the BUU tourism site point, **not a claimed visitor entrance**, until entrance-specific evidence exists.

## Scope and safety

Only one new bundled place in this PR. No fake photo, admission, hours, rating, opening status, English detail, or media rights. Not a claim to have validated the existing production DB live. No Railway database, bucket, Vercel deployment or secrets changed.

Cholatassathan Museum (`tat-2015120421550718062`) remains **HOLD**. Chulalongkorn University confirms a separate nine-zone marine museum inside Chutathut Palace (https://www.chula.ac.th/services/chonlathatsathan-museum/), but does not publish an unambiguous museum-building entrance coordinate. Do not reuse the palace-wide or TAT pin as the building's precise pin and do not publish as a simple alias.

## Merge and release gates

1. Full CI green: all node unit tests, place quality import audit, security/lint, and build.
2. **Mandatory fresh read-only DB + public API**: check existing `id`, normalized Thai/English names and nearby place pins for duplicates. Reconcile `/api/places?province=ชลบุรี&page=1&limit=50` and subsequent pages against total. If duplicate found, close/revise the PR without insert.
3. Verify precise BUU *site point* is acceptable for the public UI; do not call it a guaranteed vehicle entrance.
4. Merge only after explicit user approval; no automatic deploy.
5. After authorized deploy, verify 194 unique nationwide and 71 Chon Buri only if the database was at verified baseline 193/70 immediately before deployment. Verify exact new TAT ID appears once.

Source census: 194 TAT rows, now proposed statuses 70 linked/published (including this PR), 1 documented duplicate, 45 pending individual review, 76 category/location review, 2 missing usable Thai name. This status change is **provisional in the PR** until post-deploy verification.
