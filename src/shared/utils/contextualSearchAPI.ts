// Enhanced contextual search service with fuzzy matching and semantic ranking
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

// Ranking weights configuration (can be moved to environment variables)
const RANKING_WEIGHTS = {
  semantic: 0.4,      // w_semantic
  popularity: 0.3,    // w_pop  
  recency: 0.2,       // w_recency
  relevance: 0.1      // w_relevance (fuzzy match score)
};

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
 * Calculate semantic similarity score (placeholder for now)
 * In Phase 2, this will use actual embeddings
 */
function calculateSemanticScore(post: Post, query: string, expandedTerms: string[]): number {
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
 * Calculate final ranking score using weighted formula
 * score = w_semantic * semanticScore + w_pop * popularityNorm + w_recency * recencyDecay + w_relevance * relevanceScore
 */
function calculateFinalScore(
  semanticScore: number,
  popularityScore: number, 
  recencyScore: number,
  relevanceScore: number
): number {
  return (
    RANKING_WEIGHTS.semantic * semanticScore +
    RANKING_WEIGHTS.popularity * popularityScore +
    RANKING_WEIGHTS.recency * recencyScore +
    RANKING_WEIGHTS.relevance * relevanceScore
  );
}

/**
 * Extract matched terms from Fuse.js search results
 */
function extractMatchedTerms(fuseResult: any): string[] {
  if (!fuseResult.matches) return [];
  
  const terms: string[] = [];
  fuseResult.matches.forEach((match: any) => {
    if (match.indices) {
      match.indices.forEach((index: any) => {
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
 * Enhanced contextual search for posts
 */
export async function searchPosts(
  query: string,
  options: {
    limit?: number;
    language?: 'th' | 'en' | 'auto';
    includeRelated?: boolean;
  } = {}
): Promise<{
  results: PostSearchResult[];
  totalCount: number;
  processingTime: number;
  expandedTerms: string[];
}> {
  const startTime = Date.now();
  await simulateDelay(200); // Simulate network delay
  
  const { limit = 20, language = 'auto' } = options;
  
  // Expand search query
  const expandedTerms = expandSearchQuery(query);
  
  // Perform fuzzy search
  const fuseResults = postsFuse.search(expandedTerms.join(' '));
  
  // Calculate enhanced search results with metrics
  const results: PostSearchResult[] = fuseResults
    .slice(0, limit)
    .map(fuseResult => {
      const post = fuseResult.item;
      const relevanceScore = 1 - (fuseResult.score || 0); // Invert Fuse score (lower is better)
      const popularityScore = calculatePopularityScore(post);
      const recencyScore = calculateRecencyScore(post);
      const semanticScore = calculateSemanticScore(post, query, expandedTerms);
      
      const searchMetrics: SearchMetrics = {
        relevanceScore,
        popularityScore,
        recencyScore,
        semanticScore,
        finalScore: calculateFinalScore(semanticScore, popularityScore, recencyScore, relevanceScore)
      };
      
      const matchedTerms = extractMatchedTerms(fuseResult);
      const highlightedCaption = highlightMatches(post.caption, matchedTerms);
      
      return {
        ...post,
        searchMetrics,
        matchedTerms,
        highlightedCaption
      };
    })
    .sort((a, b) => b.searchMetrics.finalScore - a.searchMetrics.finalScore); // Sort by final score
  
  const processingTime = Date.now() - startTime;
  
  return {
    results,
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