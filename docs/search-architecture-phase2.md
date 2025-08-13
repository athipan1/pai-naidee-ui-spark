# Search Architecture - Phase 2

This document describes the Phase 2 implementation of the contextual search and recommendation system with semantic capabilities and hybrid ranking.

## Overview

Phase 2 extends the existing fuzzy search system with:
- **Semantic embeddings** for understanding content meaning
- **Hybrid ranking** combining multiple relevance signals
- **Advanced filters** for precise search refinement  
- **Observability** for performance monitoring
- **Feature flags** for safe deployment

## Data Flow

```
Query Input
    ↓
1. Query Expansion (location mapping, synonyms)
    ↓
2. Parallel Search Execution:
   ├── Lexical Search (Fuse.js fuzzy matching)
   └── Semantic Search (embedding similarity) [if enabled]
    ↓
3. Hybrid Ranking
   ├── Lexical Score (0.45 weight)
   ├── Semantic Score (0.25 weight) 
   ├── Popularity Score (0.15 weight)
   ├── Recency Score (0.10 weight)
   └── Personalization Score (0.05 weight)
    ↓
4. Advanced Filters Application
   ├── Category Filter
   ├── Date Range Filter
   ├── Media Filter
   ├── Location/Radius Filter
   └── Rating Filter
    ↓
5. Final Results (ranked and filtered)
```

## Architecture Components

### 1. Semantic Layer (`src/search/semantic/`)

#### Embeddings Client (`embeddingsClient.ts`)
- **Interface**: `EmbeddingClient` with `generateEmbedding()` method
- **Mock Implementation**: Deterministic vector generation for testing
- **Future Support**: OpenAI, Cohere, HuggingFace providers

```typescript
const client = createEmbeddingClient({ provider: 'mock' });
const embedding = await client.generateEmbedding("Beautiful temple in Bangkok");
```

#### Embedding Indexer (`embeddingIndexer.ts`)
- **Purpose**: Build semantic index from posts and locations
- **Output**: `semanticIndex.json` with document embeddings
- **CLI**: `npm run build:semantic-index`

```typescript
const index = await buildIndex(posts, locations);
// Creates semantic index with 384-dimensional embeddings
```

#### Embedding Search (`embeddingSearch.ts`)
- **Cosine Similarity**: `(Σ Ai*Bi) / (sqrt(Σ Ai^2) * sqrt(Σ Bi^2))`
- **Vector Length Protection**: Guards against dimension mismatches
- **Multi-query Support**: Average, max, or weighted aggregation

```typescript
const results = await semanticSearch(queryEmbedding, semanticIndex, {
  limit: 20,
  minSimilarity: 0.3
});
```

### 2. Hybrid Ranking (`src/search/ranking/`)

#### Hybrid Ranker (`hybridRanker.ts`)
- **Formula**: `w_lex × lexical + w_sem × semantic + w_pop × popularity + w_rec × recency + w_pers × personalization`
- **Score Normalization**: Clamps all scores to [0, 1] range
- **Boost Factors**: Optional multipliers for special conditions

```typescript
const score = computeHybridScore({
  lexicalScore: 0.8,
  semanticScore: 0.6,
  popularityScore: 0.4,
  recencyScore: 0.7,
  personalizationScore: 0.2
}, config);
```

### 3. Configuration (`config/searchConfig.ts`)

#### Default Weights
```typescript
const DEFAULT_SEARCH_WEIGHTS = {
  lexical: 0.45,        // Fuzzy/keyword matching
  semantic: 0.25,       // Embedding similarity  
  popularity: 0.15,     // Engagement metrics
  recency: 0.10,        // Time-based relevance
  personalization: 0.05 // User preferences
};
```

#### Feature Flags
```typescript
const DEFAULT_FEATURE_FLAGS = {
  ENABLE_SEMANTIC: false,        // Semantic search
  ENABLE_PERSONALIZATION: false, // User-specific ranking
  ENABLE_ADV_FILTERS: false      // Advanced filter UI
};
```

#### Environment Override
```bash
# Override weights
SEARCH_WEIGHT_SEMANTIC=0.4
SEARCH_WEIGHT_LEXICAL=0.3

# Enable features
ENABLE_SEMANTIC=true
ENABLE_ADV_FILTERS=true
```

### 4. Advanced Filters (`src/search/filters/`)

#### Supported Filters
- **Category**: `['temple', 'beach', 'mountain']`
- **Date Range**: `{ start: Date, end: Date }`
- **Media**: `hasMedia: boolean`
- **Location**: `locationId: string`
- **Radius**: `radiusKm: number` (with locationId)
- **Rating**: `minRating: number`
- **Language**: `'th' | 'en'`
- **Tags**: `['culture', 'nature']`
- **Province**: `'Bangkok'`

#### Usage
```typescript
const filters = {
  category: ['temple'],
  dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
  hasMedia: true,
  minRating: 4.0
};

const filtered = applyAdvancedFilters(results, filters);
```

### 5. Observability (`src/metrics/`)

#### Search Metrics (`searchMetrics.ts`)
- **Query Recording**: Duration, result count, cache hits
- **Rolling Window**: Last 50 queries in memory
- **Performance Insights**: Slow queries, frequent patterns
- **Usage Analytics**: Semantic adoption, filter usage

```typescript
recordQuery({
  query: "temples in bangkok",
  durationMs: 250,
  resultCount: 15,
  cacheHit: false,
  usedSemantic: true,
  language: 'en',
  source: 'web'
});

const metrics = getSearchMetrics();
// Returns aggregate statistics and insights
```

### 6. Logging (`src/shared/utils/logger.ts`)

#### Structured Logging
```typescript
log.semantic.info('Building semantic index', { documents: 100 });
log.ranking.warn('Low semantic similarity scores', { avgScore: 0.15 });
log.filters.error('Invalid date range', error, { filter: dateRange });
```

#### Component-specific Loggers
- `log.semantic.*` - Embedding operations
- `log.ranking.*` - Score calculations  
- `log.filters.*` - Filter application
- `log.metrics.*` - Performance tracking

## Weight Configuration

### Default Configuration Rationale

| Component | Weight | Rationale |
|-----------|--------|-----------|
| Lexical | 0.45 | Primary relevance signal, proven effective |
| Semantic | 0.25 | Contextual understanding, gradual adoption |
| Popularity | 0.15 | Social proof, engagement quality |
| Recency | 0.10 | Freshness preference |  
| Personalization | 0.05 | Conservative start, privacy-friendly |

### Validation Rules
- **Sum Constraint**: Total weights must equal 1.0 (±0.05 tolerance)
- **Range Limits**: Each weight between 0.0 and 1.0
- **Fallback**: Invalid configurations revert to defaults with warning

### Environment Tuning
```bash
# Semantic-heavy configuration
SEARCH_WEIGHT_LEXICAL=0.3
SEARCH_WEIGHT_SEMANTIC=0.4
SEARCH_WEIGHT_POPULARITY=0.2  
SEARCH_WEIGHT_RECENCY=0.1
SEARCH_WEIGHT_PERSONALIZATION=0.0

# Popularity-focused configuration  
SEARCH_WEIGHT_LEXICAL=0.4
SEARCH_WEIGHT_SEMANTIC=0.2
SEARCH_WEIGHT_POPULARITY=0.3
SEARCH_WEIGHT_RECENCY=0.1
SEARCH_WEIGHT_PERSONALIZATION=0.0
```

## Regenerating Semantic Index

### Single Command
```bash
npm run build:semantic-index
```

### Manual Process
1. **Prepare Data**: Ensure posts and locations are available
2. **Run Indexer**: Execute the build script
3. **Verify Output**: Check `semanticIndex.json` file
4. **Test Integration**: Run semantic search queries

### Index Structure
```json
{
  "documents": [
    {
      "id": "post_1",
      "type": "post",
      "content": "Beautiful temple in Bangkok",
      "embedding": [0.123, -0.456, ...],
      "metadata": {
        "title": "Beautiful temple...",
        "tags": ["temple", "culture"],
        "language": "en",
        "lastUpdated": "2024-01-15T10:00:00Z"
      }
    }
  ],
  "version": "1.0.0",
  "createdAt": "2024-01-15T10:00:00Z",
  "embeddingDimensions": 384,
  "totalDocuments": 100
}
```

## Error Handling & Fallbacks

### Semantic Search Failures
1. **Empty Index**: Falls back to lexical search only
2. **Embedding Errors**: Logs warning, continues with lexical
3. **Similarity Calculation**: Guards against vector dimension mismatches
4. **Timeout Protection**: Configurable timeout for embedding generation

### Configuration Errors  
1. **Invalid Weights**: Reverts to defaults with console warning
2. **Missing Environment Variables**: Uses sensible defaults
3. **Feature Flag Errors**: Disables affected features gracefully

### Filter Validation
1. **Date Range**: Validates start < end, no future dates
2. **Numeric Ranges**: Clamps to valid bounds (rating 0-5, radius 0-1000km)
3. **Type Safety**: TypeScript interfaces prevent common errors

## Performance Considerations

### Semantic Search Optimization
- **Top-N Pre-filtering**: Calculate semantic scores only for top 50 lexical results
- **Batch Processing**: Generate embeddings in batches where possible
- **Caching Strategy**: Cache frequently requested embeddings
- **Index Partitioning**: Split large indices by category/geography

### Memory Management
- **Rolling Windows**: Limit in-memory metrics storage
- **Index Size**: Monitor embedding index memory usage
- **Garbage Collection**: Clear old cached embeddings

### Monitoring Thresholds
- **Slow Queries**: > 1000ms duration
- **Low Relevance**: < 0.1 average semantic similarity  
- **Cache Efficiency**: < 30% hit rate
- **Error Rates**: > 5% semantic search failures

## Testing Strategy

### Unit Tests
- **Configuration Validation**: Weight sum validation, environment overrides
- **Ranking Calculations**: Hybrid score computation with different weights
- **Filter Logic**: Category, date, media, and location filtering
- **Embedding Generation**: Deterministic mock vectors for consistency

### Integration Tests  
- **End-to-End Search**: Query → Expansion → Search → Ranking → Filtering
- **Fallback Scenarios**: Semantic disabled, empty index, errors
- **Performance Tests**: Latency under load, memory usage patterns

### Test Data
- **Mock Embeddings**: Consistent, deterministic vectors
- **Diverse Content**: Thai/English, different categories
- **Edge Cases**: Empty results, single results, large result sets

## Future Enhancements

### Phase 3 Roadmap
1. **Real Embedding Providers**: OpenAI, Cohere integration
2. **Personalization Models**: User preference learning
3. **A/B Testing Framework**: Ranking algorithm comparison
4. **Advanced Analytics**: Conversion tracking, engagement metrics
5. **Distributed Search**: Multi-region index deployment
6. **Real-time Updates**: Incremental index updates

### Scalability Preparations
- **Microservice Architecture**: Separate search service
- **Database Integration**: PostgreSQL with vector extensions
- **Caching Layer**: Redis for hot embeddings
- **Load Balancing**: Geographic distribution
- **Monitoring Stack**: Prometheus, Grafana integration

## Troubleshooting

### Common Issues

#### Semantic Search Not Working
```bash
# Check feature flag
echo $ENABLE_SEMANTIC

# Verify index exists
ls -la semanticIndex.json

# Check logs for errors
grep -i "semantic" logs/*.log
```

#### Performance Issues
```bash
# Check slow queries in metrics
# Monitor memory usage
# Verify index size vs available RAM
```

#### Weight Configuration Errors
```bash
# Check environment variables
env | grep SEARCH_WEIGHT

# Verify sum equals 1.0
# Check console warnings in application logs
```

## API Integration

For future API integration, the search system exposes:

### Search Endpoint (Future)
```typescript
POST /api/search
{
  "query": "temples in bangkok",
  "filters": {
    "category": ["temple"],
    "hasMedia": true
  },
  "options": {
    "limit": 20,
    "enableSemantic": true
  }
}
```

### Metrics Endpoint (Future)
```typescript
GET /api/search/metrics
{
  "aggregate": { ... },
  "recent": [ ... ],
  "insights": { ... }
}
```

This architecture provides a solid foundation for advanced search capabilities while maintaining backward compatibility and performance.