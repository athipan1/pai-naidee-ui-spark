// Enhanced contextual search service with fuzzy matching and hybrid ranking (Phase 2)
import Fuse from 'fuse.js';
import type {
  Post,
  PostSearchResult,
  Location,
  SearchMetrics,
  RelatedPostsConfig
} from '../types/posts';
import {
  mockPosts,
  mockLocations,
  locationExpansionMap,
  simulateDelay
} from '../data/mockData';

// Phase 2 imports
import { getSearchConfig } from '../../../config/searchConfig';
import { computeHybridScore, createRankingConfig } from '../../search/ranking/hybridRanker';
import type { HybridRankingScores } from '../../search/ranking/hybridRanker';
import { createEmbeddingClient } from '../../search/semantic/embeddingsClient';
import { loadSemanticIndex, semanticSearch as _semanticSearch } from '../../search/semantic/embeddingSearch';
import { applyAdvancedFilters } from '../../search/filters/advancedFilters';
import type { AdvancedSearchFilters } from '../../search/filters/advancedFilters';
import { recordQuery } from '../../metrics/searchMetrics';
import { log } from './logger';

// Search configuration for different entity types
const fuseOptions = {
  // Posts search configuration
  posts: {
    keys: [
      { name: 'caption', weight: 0.4 },
      { name: 'tags', weight: 0.3 },
      { name: 'location.name', weight: 0.2 },
      { name: 'location.nameLocal', weight: 0.2 },
      { name: 'user.name', weight: 0.1 }
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2
  },
  // Locations search configuration  
  locations: {
    keys: [
      { name: 'name', weight: 0.3 },
      { name: 'nameLocal', weight: 0.3 },
      { name: 'aliases', weight: 0.2 },
      { name: 'tags', weight: 0.1 },
      { name: 'province', weight: 0.1 }
    ],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 1
  }
};

// Ranking weights configuration (now uses Phase 2 configuration system)
// This is kept for backward compatibility but will be overridden by the new config
const LEGACY_RANKING_WEIGHTS = {
  semantic: 0.4,      // w_semantic
  popularity: 0.3,    // w_pop  
  recency: 0.2,       // w_recency
  relevance: 0.1      // w_relevance (fuzzy match score)
};

// Phase 2 configuration
let searchConfig = getSearchConfig();
let embeddingClient: ReturnType<typeof createEmbeddingClient> | null = null;
let semanticIndex: Awaited<ReturnType<typeof loadSemanticIndex>> | null = null;

// Initialize Phase 2 components
async function initializePhase2Components() {
  if (searchConfig.features.ENABLE_SEMANTIC && !embeddingClient) {
    try {
      embeddingClient = createEmbeddingClient({ provider: 'mock' });
      semanticIndex = await loadSemanticIndex();
      log.semantic.info('Phase 2 semantic search initialized', { 
        clientReady: embeddingClient.isReady(),
        indexLoaded: !!semanticIndex 
      });
    } catch (error) {
      log.semantic.error('Failed to initialize semantic search', error);
      embeddingClient = null;
      semanticIndex = null;
    }
  }
}

// Initialize Fuse instances
const postsFuse = new Fuse(mockPosts, fuseOptions.posts);
const locationsFuse = new Fuse(mockLocations, fuseOptions.locations);

/**
 * Expand search query using location mappings
 * Example: "เชียงใหม่" → ["เชียงใหม่", "ดอยสุเทพ", "นิมมาน", "ม่อนแจ่ม"]
 */
function expandSearchQuery(query: string): string[] {
  const expanded = [query];
  const lowerQuery = query.toLowerCase();
  
  // Check location expansion mappings
  for (const [location, expansion] of Object.entries(locationExpansionMap)) {
    if (location.toLowerCase().includes(lowerQuery) || 
        expansion.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))) {
      expanded.push(...expansion.popularPlaces);
      expanded.push(...expansion.commonTags);
    }
  }
  
  return [...new Set(expanded)]; // Remove duplicates
}

/**
 * Calculate popularity score (normalized)
 * Formula: normalize(likeCount + α*commentCount)
 */
function calculatePopularityScore(post: Post): number {
  const alpha = 2; // Weight for comments vs likes
  const rawScore = post.likeCount + (alpha * post.commentCount);
  const maxScore = 3000; // Reasonable max for normalization
  return Math.min(rawScore / maxScore, 1);
}

/**
 * Calculate recency score with exponential decay
 * Formula: exp(-Δt / τ) where τ is decay constant
 */
function calculateRecencyScore(post: Post): number {
  const now = Date.now();
  const postTime = new Date(post.createdAt).getTime();
  const deltaT = (now - postTime) / (1000 * 60 * 60 * 24); // days
  const tau = 30; // 30-day decay constant
  return Math.exp(-deltaT / tau);
}

/**
 * Calculate semantic similarity score using Phase 2 embeddings (if enabled)
 * Falls back to keyword matching if semantic search is disabled or fails
 */
async function calculateSemanticScore(post: Post, query: string, expandedTerms: string[]): Promise<number> {
  // Check if semantic search is enabled and available
  if (!searchConfig.features.ENABLE_SEMANTIC || !embeddingClient || !semanticIndex) {
    // Fallback to legacy keyword matching
    return calculateLegacySemanticScore(post, query, expandedTerms);
  }

  try {
    // Generate query embedding
    const queryEmbedding = await embeddingClient.generateEmbedding(query);
    
    // Find post in semantic index
    const postDocument = semanticIndex.documents.find(
      (doc: { id: string; type: string; embedding?: number[] }) => doc.id === post.id && doc.type === 'post'
    );
    
    if (!postDocument) {
      log.semantic.debug('Post not found in semantic index, using fallback', { postId: post.id });
      return calculateLegacySemanticScore(post, query, expandedTerms);
    }
    
    // Calculate cosine similarity
    const similarity = cosineSimilarity(queryEmbedding, postDocument.embedding);
    
    log.semantic.debug('Calculated semantic similarity', { 
      postId: post.id, 
      similarity,
      method: 'embedding'
    });
    
    return Math.max(0, Math.min(1, similarity));
    
  } catch (error) {
    log.semantic.warn('Semantic scoring failed, using fallback', error, { postId: post.id });
    return calculateLegacySemanticScore(post, query, expandedTerms);
  }
}

/**
 * Legacy semantic score calculation (keyword matching)
 * Maintained for backward compatibility and fallback scenarios
 */
function calculateLegacySemanticScore(post: Post, query: string, expandedTerms: string[]): number {
  // Simple keyword matching for now - will be replaced with embedding similarity
  const content = `${post.caption} ${post.tags.join(' ')} ${post.location?.name || ''}`.toLowerCase();
  
  let matches = 0;
  for (const term of expandedTerms) {
    if (content.includes(term.toLowerCase())) {
      matches++;
    }
  }
  
  return Math.min(matches / expandedTerms.length, 1);
}

/**
 * Simple cosine similarity calculation
 */
function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    log.semantic.warn('Vector length mismatch in cosine similarity', { 
      lengthA: vectorA.length, 
      lengthB: vectorB.length 
    });
    return 0;
  }

  if (vectorA.length === 0) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Calculate final ranking score using Phase 2 hybrid ranking
 * Falls back to legacy calculation if Phase 2 is disabled
 */
function calculateFinalScore(
  semanticScore: number,
  popularityScore: number, 
  recencyScore: number,
  relevanceScore: number,
  personalizationScore: number = 0
): number {
  // Use Phase 2 hybrid ranking if available
  if (searchConfig && searchConfig.weights) {
    const hybridScores: HybridRankingScores = {
      lexicalScore: relevanceScore,
      semanticScore,
      popularityScore,
      recencyScore,
      personalizationScore
    };
    
    const rankingConfig = createRankingConfig(searchConfig.weights);
    const finalScore = computeHybridScore(hybridScores, rankingConfig);
    
    log.ranking.debug('Computed hybrid score', {
      scores: hybridScores,
      finalScore,
      method: 'phase2'
    });
    
    return finalScore;
  }
  
  // Fallback to legacy calculation
  return (
    LEGACY_RANKING_WEIGHTS.relevance * relevanceScore +
    LEGACY_RANKING_WEIGHTS.semantic * semanticScore +
    LEGACY_RANKING_WEIGHTS.popularity * popularityScore +
    LEGACY_RANKING_WEIGHTS.recency * recencyScore
  );
}

/**
 * Extract matched terms from Fuse.js search results
 */
function extractMatchedTerms(fuseResult: { matches?: Array<{ indices?: Array<[number, number]>; value: string }> }): string[] {
  if (!fuseResult.matches) return [];
  
  const terms: string[] = [];
  fuseResult.matches.forEach((match: { indices?: Array<[number, number]>; value: string }) => {
    if (match.indices) {
      match.indices.forEach((index: [number, number]) => {
        const term = match.value.substring(index[0], index[1] + 1);
        terms.push(term);
      });
    }
  });
  
  return [...new Set(terms)]; // Remove duplicates
}

/**
 * Highlight matched terms in post caption
 */
function highlightMatches(caption: string, matchedTerms: string[]): string {
  let highlighted = caption;
  
  matchedTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  });
  
  return highlighted;
}

/**
 * Enhanced contextual search for posts with Phase 2 capabilities
 */
export async function searchPosts(
  query: string,
  options: {
    limit?: number;
    language?: 'th' | 'en' | 'auto';
    includeRelated?: boolean;
    filters?: AdvancedSearchFilters;
  } = {}
): Promise<{
  results: PostSearchResult[];
  totalCount: number;
  processingTime: number;
  expandedTerms: string[];
}> {
  const startTime = Date.now();
  await simulateDelay(200); // Simulate network delay
  
  const { limit = 20, language = 'auto', filters } = options;
  
  // Initialize Phase 2 components if not already done
  await initializePhase2Components();
  
  // Refresh config in case environment variables changed
  searchConfig = getSearchConfig();
  
  log.info('search', 'Starting contextual search', { 
    query, 
    language, 
    semanticEnabled: searchConfig.features.ENABLE_SEMANTIC,
    filtersEnabled: !!filters
  });
  
  // Expand search query
  const expandedTerms = expandSearchQuery(query);
  
  // Perform fuzzy search
  const fuseResults = postsFuse.search(expandedTerms.join(' '));
  
  // Calculate enhanced search results with metrics
  const results: PostSearchResult[] = [];
  
  for (const fuseResult of fuseResults.slice(0, Math.min(limit * 2, 50))) { // Pre-filter for performance
    const post = fuseResult.item;
    const relevanceScore = 1 - (fuseResult.score || 0); // Invert Fuse score (lower is better)
    const popularityScore = calculatePopularityScore(post);
    const recencyScore = calculateRecencyScore(post);
    
    // Calculate semantic score (with Phase 2 enhancement)
    const semanticScore = await calculateSemanticScore(post, query, expandedTerms);
    
    // Personalization score (placeholder for now)
    const personalizationScore = searchConfig.features.ENABLE_PERSONALIZATION ? 0.5 : 0;
    
    const searchMetrics: SearchMetrics = {
      relevanceScore,
      popularityScore,
      recencyScore,
      semanticScore,
      finalScore: calculateFinalScore(semanticScore, popularityScore, recencyScore, relevanceScore, personalizationScore)
    };
    
    const matchedTerms = extractMatchedTerms(fuseResult);
    const highlightedCaption = highlightMatches(post.caption, matchedTerms);
    
    results.push({
      ...post,
      searchMetrics,
      matchedTerms,
      highlightedCaption
    });
  }
  
  // Sort by final score
  results.sort((a, b) => b.searchMetrics.finalScore - a.searchMetrics.finalScore);
  
  // Apply advanced filters if provided
  let finalResults = results;
  if (filters && searchConfig.features.ENABLE_ADV_FILTERS) {
    const filteredResults = applyAdvancedFilters(results, filters);
    finalResults = filteredResults.results;
    
    log.filters.info('Applied advanced filters', {
      originalCount: results.length,
      filteredCount: filteredResults.filteredCount,
      appliedFilters: filteredResults.appliedFilters
    });
  }
  
  // Apply final limit
  finalResults = finalResults.slice(0, limit);
  
  const processingTime = Date.now() - startTime;
  
  // Record metrics
  recordQuery({
    query,
    durationMs: processingTime,
    resultCount: finalResults.length,
    cacheHit: false,
    usedSemantic: searchConfig.features.ENABLE_SEMANTIC && !!embeddingClient && !!semanticIndex,
    usedFilters: !!filters && searchConfig.features.ENABLE_ADV_FILTERS,
    language,
    source: 'web'
  });
  
  log.info('search', 'Contextual search completed', {
    query,
    resultCount: finalResults.length,
    processingTime,
    usedSemantic: searchConfig.features.ENABLE_SEMANTIC
  });
  
  return {
    results: finalResults,
    totalCount: fuseResults.length,
    processingTime,
    expandedTerms
  };
}

/**
 * Find related posts based on location and tags similarity
 */
export async function getRelatedPosts(
  sourcePost: Post,
  config: RelatedPostsConfig = {
    maxResults: 4,
    minSimilarityThreshold: 0.3,
    useSemanticSimilarity: false,
    weightByPopularity: true,
    weightByRecency: true
  }
): Promise<PostSearchResult[]> {
  await simulateDelay(100);
  
  const relatedPosts = mockPosts
    .filter(post => post.id !== sourcePost.id) // Exclude source post
    .map(post => {
      let similarityScore = 0;
      
      // Location similarity (highest weight)
      if (post.locationId === sourcePost.locationId) {
        similarityScore += 0.5;
      } else if (post.location?.province === sourcePost.location?.province) {
        similarityScore += 0.3;
      }
      
      // Tags similarity  
      const commonTags = post.tags.filter(tag => 
        sourcePost.tags.some(sourceTag => 
          sourceTag.toLowerCase() === tag.toLowerCase()
        )
      );
      const tagSimilarity = commonTags.length / Math.max(post.tags.length, sourcePost.tags.length);
      similarityScore += tagSimilarity * 0.3;
      
      // Category/theme similarity
      if (post.user.id === sourcePost.user.id) {
        similarityScore += 0.2; // Same user
      }
      
      // Apply weights
      let finalScore = similarityScore;
      
      if (config.weightByPopularity) {
        finalScore *= (1 + calculatePopularityScore(post) * 0.2);
      }
      
      if (config.weightByRecency) {
        finalScore *= (1 + calculateRecencyScore(post) * 0.1);
      }
      
      const searchMetrics: SearchMetrics = {
        relevanceScore: similarityScore,
        popularityScore: calculatePopularityScore(post),
        recencyScore: calculateRecencyScore(post),
        semanticScore: config.useSemanticSimilarity ? 0.5 : 0, // Placeholder
        finalScore
      };
      
      return {
        ...post,
        searchMetrics,
        matchedTerms: commonTags,
        highlightedCaption: post.caption
      };
    })
    .filter(post => post.searchMetrics.relevanceScore >= config.minSimilarityThreshold)
    .sort((a, b) => b.searchMetrics.finalScore - a.searchMetrics.finalScore)
    .slice(0, config.maxResults);
  
  return relatedPosts;
}

/**
 * Search locations with fuzzy matching
 */
export async function searchLocations(query: string, limit: number = 10): Promise<Location[]> {
  await simulateDelay(150);
  
  const expandedTerms = expandSearchQuery(query);
  const fuseResults = locationsFuse.search(expandedTerms.join(' '));
  
  return fuseResults
    .slice(0, limit)
    .map(result => result.item)
    .sort((a, b) => b.popularityScore - a.popularityScore); // Sort by popularity
}

/**
 * Get nearby locations based on geographical distance  
 */
export async function getNearbyLocations(
  centerLocation: Location,
  radiusKm: number = 50,
  limit: number = 10
): Promise<Location[]> {
  await simulateDelay(100);
  
  // Haversine distance calculation
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  return mockLocations
    .filter(location => location.id !== centerLocation.id)
    .map(location => ({
      ...location,
      distance: calculateDistance(
        centerLocation.geo.lat,
        centerLocation.geo.lng,
        location.geo.lat,
        location.geo.lng
      )
    }))
    .filter(location => location.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/**
 * Get trending search terms (mock implementation)
 */
export async function getTrendingSearches(language: 'th' | 'en' = 'th'): Promise<string[]> {
  await simulateDelay(50);
  
  const trending = {
    th: ["เกาะพีพี", "ดอยสุเทพ", "วัดพระแก้ว", "ตลาดน้ำ", "เชียงใหม่", "กระบี่"],
    en: ["Phi Phi Islands", "Doi Suthep", "Grand Palace", "Floating Market", "Chiang Mai", "Krabi"]
  };
  
  return trending[language];
}