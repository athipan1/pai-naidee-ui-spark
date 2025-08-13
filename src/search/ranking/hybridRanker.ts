// Hybrid ranking system for Phase 2 contextual search

import type { SearchWeightConfig } from '../../../config/searchConfig';

export interface HybridRankingScores {
  lexicalScore: number;      // Fuzzy/keyword match score
  semanticScore: number;     // Embedding similarity score
  popularityScore: number;   // Engagement/popularity score
  recencyScore: number;      // Time-based relevance score
  personalizationScore: number; // User preference score
}

export interface HybridRankingConfig extends SearchWeightConfig {
  normalizeScores?: boolean;
  boostFactors?: {
    exactMatch?: number;
    sameLocation?: number;
    sameCategory?: number;
    highEngagement?: number;
  };
}

/**
 * Compute hybrid ranking score using weighted combination
 * Formula: w_lex * lexical + w_sem * semantic + w_pop * popularity + w_rec * recency + w_pers * personalization
 */
export function computeHybridScore(
  scores: HybridRankingScores,
  config: HybridRankingConfig
): number {
  const { 
    lexical, 
    semantic, 
    popularity, 
    recency, 
    personalization 
  } = config;

  // Normalize scores to [0, 1] if requested
  const normalizedScores = config.normalizeScores ? normalizeScores(scores) : scores;

  // Calculate weighted sum
  const finalScore = 
    lexical * normalizedScores.lexicalScore +
    semantic * normalizedScores.semanticScore +
    popularity * normalizedScores.popularityScore +
    recency * normalizedScores.recencyScore +
    personalization * normalizedScores.personalizationScore;

  // Apply boost factors if configured
  if (config.boostFactors) {
    return applyBoostFactors(finalScore, scores, config.boostFactors);
  }

  return Math.max(0, Math.min(1, finalScore)); // Clamp to [0, 1]
}

/**
 * Normalize all scores to [0, 1] range
 */
export function normalizeScores(scores: HybridRankingScores): HybridRankingScores {
  return {
    lexicalScore: clampScore(scores.lexicalScore),
    semanticScore: clampScore(scores.semanticScore),
    popularityScore: clampScore(scores.popularityScore),
    recencyScore: clampScore(scores.recencyScore),
    personalizationScore: clampScore(scores.personalizationScore)
  };
}

/**
 * Clamp score to [0, 1] range
 */
function clampScore(score: number): number {
  return Math.max(0, Math.min(1, score));
}

/**
 * Apply boost factors for special conditions
 */
function applyBoostFactors(
  baseScore: number,
  scores: HybridRankingScores,
  boostFactors: NonNullable<HybridRankingConfig['boostFactors']>
): number {
  let boostedScore = baseScore;

  // Exact match boost
  if (boostFactors.exactMatch && scores.lexicalScore > 0.9) {
    boostedScore *= boostFactors.exactMatch;
  }

  // High engagement boost
  if (boostFactors.highEngagement && scores.popularityScore > 0.8) {
    boostedScore *= boostFactors.highEngagement;
  }

  return Math.max(0, Math.min(1, boostedScore));
}

/**
 * Create ranking configuration with defaults
 */
export function createRankingConfig(
  weights: SearchWeightConfig,
  options: {
    normalizeScores?: boolean;
    boostFactors?: HybridRankingConfig['boostFactors'];
  } = {}
): HybridRankingConfig {
  return {
    ...weights,
    normalizeScores: options.normalizeScores ?? true,
    boostFactors: options.boostFactors
  };
}

/**
 * Batch compute hybrid scores for multiple items
 */
export function computeBatchHybridScores<T extends { id: string }>(
  items: T[],
  scoreExtractor: (item: T) => HybridRankingScores,
  config: HybridRankingConfig
): Array<T & { hybridScore: number; rankingScores: HybridRankingScores }> {
  return items.map(item => {
    const scores = scoreExtractor(item);
    const hybridScore = computeHybridScore(scores, config);
    
    return {
      ...item,
      hybridScore,
      rankingScores: scores
    };
  });
}

/**
 * Rank items by hybrid score in descending order
 */
export function rankByHybridScore<T extends { hybridScore: number }>(
  items: T[],
  options: {
    limit?: number;
    minScore?: number;
  } = {}
): T[] {
  const { limit, minScore = 0 } = options;
  
  let rankedItems = items
    .filter(item => item.hybridScore >= minScore)
    .sort((a, b) => b.hybridScore - a.hybridScore);
  
  if (limit && limit > 0) {
    rankedItems = rankedItems.slice(0, limit);
  }
  
  return rankedItems;
}

/**
 * Analyze ranking distribution for debugging
 */
export function analyzeRankingDistribution(
  items: Array<{ rankingScores: HybridRankingScores; hybridScore: number }>
): {
  totalItems: number;
  averageScores: HybridRankingScores & { hybrid: number };
  scoreRanges: {
    lexical: { min: number; max: number };
    semantic: { min: number; max: number };
    popularity: { min: number; max: number };
    recency: { min: number; max: number };
    personalization: { min: number; max: number };
    hybrid: { min: number; max: number };
  };
} {
  if (items.length === 0) {
    const emptyScore = { min: 0, max: 0 };
    return {
      totalItems: 0,
      averageScores: {
        lexicalScore: 0,
        semanticScore: 0,
        popularityScore: 0,
        recencyScore: 0,
        personalizationScore: 0,
        hybrid: 0
      },
      scoreRanges: {
        lexical: emptyScore,
        semantic: emptyScore,
        popularity: emptyScore,
        recency: emptyScore,
        personalization: emptyScore,
        hybrid: emptyScore
      }
    };
  }

  // Calculate averages
  const sums = items.reduce(
    (acc, item) => ({
      lexicalScore: acc.lexicalScore + item.rankingScores.lexicalScore,
      semanticScore: acc.semanticScore + item.rankingScores.semanticScore,
      popularityScore: acc.popularityScore + item.rankingScores.popularityScore,
      recencyScore: acc.recencyScore + item.rankingScores.recencyScore,
      personalizationScore: acc.personalizationScore + item.rankingScores.personalizationScore,
      hybrid: acc.hybrid + item.hybridScore
    }),
    {
      lexicalScore: 0,
      semanticScore: 0,
      popularityScore: 0,
      recencyScore: 0,
      personalizationScore: 0,
      hybrid: 0
    }
  );

  const averageScores = {
    lexicalScore: sums.lexicalScore / items.length,
    semanticScore: sums.semanticScore / items.length,
    popularityScore: sums.popularityScore / items.length,
    recencyScore: sums.recencyScore / items.length,
    personalizationScore: sums.personalizationScore / items.length,
    hybrid: sums.hybrid / items.length
  };

  // Calculate ranges
  const getRange = (getValue: (item: typeof items[0]) => number) => {
    const values = items.map(getValue);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  return {
    totalItems: items.length,
    averageScores,
    scoreRanges: {
      lexical: getRange(item => item.rankingScores.lexicalScore),
      semantic: getRange(item => item.rankingScores.semanticScore),
      popularity: getRange(item => item.rankingScores.popularityScore),
      recency: getRange(item => item.rankingScores.recencyScore),
      personalization: getRange(item => item.rankingScores.personalizationScore),
      hybrid: getRange(item => item.hybridScore)
    }
  };
}