Phase 2: Hybrid Search & Advanced Features Checklist

Legend:
✅ = เสร็จ  🚧 = กำลังทำ  💤 = รอ backend / dependency  ⚠️ = ต้องรีวิว

Core Search / Strategies
- [ ] Introduce SearchStrategy abstraction (baseStrategy.ts)
- [ ] Refactor existing fuzzy search into fuzzyStrategy.ts
- [ ] Add mock embeddings JSON (data/embeddings/postsEmbeddings.sample.json)
- [ ] Embeddings loader + validation (embeddingsLoader.ts)
- [ ] HuggingFace inference client (huggingfaceClient.ts) + fallback
- [ ] Query embedding cache (IndexedDB + in-memory)
- [ ] Vector strategy (vectorStrategy.ts) with cosine similarity
- [ ] Hybrid composer (hybridSearch.ts)

Ranking & Scoring
- [ ] Cosine similarity util (cosine.ts) + unit tests
- [ ] Recency score (recency.ts) + configurable half-life
- [ ] Popularity normalization (popularity.ts)
- [ ] Weights manager (weights.ts) with defaults from env
- [ ] Hybrid ranker (hybridRanker.ts) merging lexical + semantic + recency + popularity
- [ ] Score breakdown annotation on results (debug mode)

Modes & Dev Tools
- [ ] Search mode toggle (lexical | semantic | hybrid)
- [ ] Feature flags (featureFlags.ts) + env wiring
- [ ] Dev Mode gate via ?dev=1 param (devModeGate.ts)
- [ ] Weight sliders (WeightsAdjuster.tsx) + localStorage persistence
- [ ] SearchDebugPanel (metrics, breakdown, cache state)

Filters
- [ ] Define SearchFilters interface (types.ts)
- [ ] FilterPanel UI (date range, tags, min popularity, hasMedia, location)
- [ ] Apply filters pre-ranking
- [ ] Persist last-used filters (localStorage)

Caching / Persistence
- [ ] IndexedDB setup (indexeddb.ts)
- [ ] Result set cache (search_results store)
- [ ] Embeddings cache (embeddings store) + TTL
- [ ] Stale-while-refresh logic (cached flag)
- [ ] Cache pruning / size guard

Trending & Recommendations
- [ ] Trending query store (trendingStore.ts) + decay
- [ ] Related posts service (relatedPostsService.ts) using tag overlap + recency
- [ ] RecommendationsPanel (trending vs related)
- [ ] Hook: useRecommendations

Place Detail Integration
- [ ] PlaceDetailPage route (/places/:id)
- [ ] Navigation from search results (preserve query + scroll)
- [ ] Prefetch place-related posts/embeddings
- [ ] Breadcrumb / back handling

User Content (Stubs)
- [ ] MyPostsPage.tsx
- [ ] Edit caption modal (local simulation)
- [ ] Flag / soft delete simulation

Performance & Metrics
- [ ] measureSearch timing wrapper (lexicalMs, semanticMs, mergeMs, totalMs)
- [ ] Event logging helper (logEvent) for search_performed
- [ ] Attach search trace id (uuid) across components
- [ ] Display metrics in Dev Panel

Local / Offline Enhancements
- [ ] Query hash function (hash.ts)
- [ ] Embedding prefetch for top results
- [ ] Offline fallback (serve last cached results when offline)

Tests
- [ ] cosine.ts edge cases (zero vector)
- [ ] recencyScore correctness (half-life)
- [ ] hybrid merge (duplicate ids combining scores)
- [ ] filters application (date range + popularity)
- [ ] cache path (miss -> store -> hit -> stale refresh)
- [ ] recommendations (ordering: related > trending)
- [ ] weight adjustment impacts ordering

Documentation
- [ ] Update README (Phase 2 section + feature flags)
- [ ] ARCHITECTURE_SEARCH.md (hybrid pipeline diagram, scoring formula)
- [ ] DEV_MODE.md (how to enable, sliders, debug info)
- [ ] SECURITY_NOTES.md (HF token caution / recommend backend proxy later)
- [ ] Update .env.example with new vars

Env Variables (add to .env.example)
VITE_HF_API_TOKEN=
VITE_HF_EMBEDDING_MODEL=intfloat/multilingual-e5-small
VITE_VECTOR_ENABLE=true
VITE_VECTOR_DIM=384
VITE_SEARCH_DEFAULT_MODE=hybrid
VITE_RECENCY_HALF_LIFE_DAYS=7
VITE_RECOMMENDATIONS_ENABLE=true
VITE_DEV_MODE_DEFAULT=false

Acceptance Snapshots (mark done when validated)
- Hybrid search combines sources with documented scoring order
- Disabling semantic (flag off) cleanly falls back to lexical
- Cache hit reduces totalMs vs cold search
- Adjusting weights reorders at least one result pair
- Dev Mode UI hidden unless ?dev=1 present

(ปรับ / ลบ รายการได้ตามต้องการ)

ถ้าต้องการให้เริ่มไฟล์ ARCHITECTURE_SEARCH.md / DEV_MODE.md หรือมาร์คข้อไหนว่าเสร็จ บอกได้เลยครับ.