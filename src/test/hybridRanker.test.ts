// Tests for hybrid ranking system

import { describe, it, expect } from 'vitest';
import {
  computeHybridScore,
  normalizeScores,
  createRankingConfig,
  computeBatchHybridScores,
  rankByHybridScore,
  analyzeRankingDistribution
} from '../search/ranking/hybridRanker';
import type { HybridRankingScores } from '../search/ranking/hybridRanker';
import { DEFAULT_SEARCH_WEIGHTS } from '../../config/searchConfig';

describe('Hybrid Ranking System', () => {
  const mockScores: HybridRankingScores = {
    lexicalScore: 0.8,
    semanticScore: 0.6,
    popularityScore: 0.4,
    recencyScore: 0.7,
    personalizationScore: 0.2
  };

  describe('computeHybridScore', () => {
    it('should compute weighted score correctly with default weights', () => {
      const config = createRankingConfig(DEFAULT_SEARCH_WEIGHTS);
      const score = computeHybridScore(mockScores, config);
      
      // Expected: 0.45*0.8 + 0.25*0.6 + 0.15*0.4 + 0.10*0.7 + 0.05*0.2
      // = 0.36 + 0.15 + 0.06 + 0.07 + 0.01 = 0.65
      expect(score).toBeCloseTo(0.65, 2);
    });

    it('should compute different scores with different weights', () => {
      const semanticHeavyWeights = {
        lexical: 0.2,
        semantic: 0.6,
        popularity: 0.1,
        recency: 0.05,
        personalization: 0.05
      };
      
      const config = createRankingConfig(semanticHeavyWeights);
      const score = computeHybridScore(mockScores, config);
      
      // Expected: 0.2*0.8 + 0.6*0.6 + 0.1*0.4 + 0.05*0.7 + 0.05*0.2
      // = 0.16 + 0.36 + 0.04 + 0.035 + 0.01 = 0.605
      expect(score).toBeCloseTo(0.605, 2);
    });

    it('should clamp scores to [0, 1] range', () => {
      const extremeScores: HybridRankingScores = {
        lexicalScore: 2.0, // Will be clamped
        semanticScore: -0.5, // Will be clamped
        popularityScore: 1.5,
        recencyScore: 0.8,
        personalizationScore: -1.0
      };
      
      const config = createRankingConfig(DEFAULT_SEARCH_WEIGHTS, { normalizeScores: true });
      const score = computeHybridScore(extremeScores, config);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('normalizeScores', () => {
    it('should clamp scores to [0, 1] range', () => {
      const unnormalizedScores: HybridRankingScores = {
        lexicalScore: 1.5,
        semanticScore: -0.3,
        popularityScore: 0.5,
        recencyScore: 2.0,
        personalizationScore: -1.0
      };
      
      const normalized = normalizeScores(unnormalizedScores);
      
      expect(normalized.lexicalScore).toBe(1.0);
      expect(normalized.semanticScore).toBe(0.0);
      expect(normalized.popularityScore).toBe(0.5);
      expect(normalized.recencyScore).toBe(1.0);
      expect(normalized.personalizationScore).toBe(0.0);
    });

    it('should not change already normalized scores', () => {
      const normalized = normalizeScores(mockScores);
      
      expect(normalized).toEqual(mockScores);
    });
  });

  describe('computeBatchHybridScores', () => {
    it('should compute scores for multiple items', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' }
      ];
      
      const scoreExtractor = (item: typeof items[0]) => ({
        lexicalScore: item.id === '1' ? 0.9 : 0.5,
        semanticScore: item.id === '2' ? 0.8 : 0.4,
        popularityScore: 0.6,
        recencyScore: 0.7,
        personalizationScore: 0.3
      });
      
      const config = createRankingConfig(DEFAULT_SEARCH_WEIGHTS);
      const results = computeBatchHybridScores(items, scoreExtractor, config);
      
      expect(results).toHaveLength(3);
      expect(results[0]).toHaveProperty('hybridScore');
      expect(results[0]).toHaveProperty('rankingScores');
      expect(results[0].id).toBe('1');
      
      // Item 1 should have higher score due to higher lexical score
      expect(results[0].hybridScore).toBeGreaterThan(results[1].hybridScore);
    });
  });

  describe('rankByHybridScore', () => {
    it('should rank items by hybrid score in descending order', () => {
      const items = [
        { id: '1', hybridScore: 0.5 },
        { id: '2', hybridScore: 0.8 },
        { id: '3', hybridScore: 0.3 },
        { id: '4', hybridScore: 0.9 }
      ];
      
      const ranked = rankByHybridScore(items);
      
      expect(ranked).toEqual([
        { id: '4', hybridScore: 0.9 },
        { id: '2', hybridScore: 0.8 },
        { id: '1', hybridScore: 0.5 },
        { id: '3', hybridScore: 0.3 }
      ]);
    });

    it('should apply minimum score filter', () => {
      const items = [
        { id: '1', hybridScore: 0.5 },
        { id: '2', hybridScore: 0.8 },
        { id: '3', hybridScore: 0.3 },
        { id: '4', hybridScore: 0.9 }
      ];
      
      const ranked = rankByHybridScore(items, { minScore: 0.6 });
      
      expect(ranked).toEqual([
        { id: '4', hybridScore: 0.9 },
        { id: '2', hybridScore: 0.8 }
      ]);
    });

    it('should apply limit', () => {
      const items = [
        { id: '1', hybridScore: 0.5 },
        { id: '2', hybridScore: 0.8 },
        { id: '3', hybridScore: 0.3 },
        { id: '4', hybridScore: 0.9 }
      ];
      
      const ranked = rankByHybridScore(items, { limit: 2 });
      
      expect(ranked).toHaveLength(2);
      expect(ranked[0].id).toBe('4');
      expect(ranked[1].id).toBe('2');
    });
  });

  describe('analyzeRankingDistribution', () => {
    it('should analyze score distribution correctly', () => {
      const items = [
        {
          hybridScore: 0.8,
          rankingScores: {
            lexicalScore: 0.9,
            semanticScore: 0.7,
            popularityScore: 0.6,
            recencyScore: 0.8,
            personalizationScore: 0.5
          }
        },
        {
          hybridScore: 0.6,
          rankingScores: {
            lexicalScore: 0.7,
            semanticScore: 0.5,
            popularityScore: 0.4,
            recencyScore: 0.6,
            personalizationScore: 0.3
          }
        }
      ];
      
      const analysis = analyzeRankingDistribution(items);
      
      expect(analysis.totalItems).toBe(2);
      expect(analysis.averageScores.lexicalScore).toBe(0.8);
      expect(analysis.averageScores.semanticScore).toBe(0.6);
      expect(analysis.averageScores.hybrid).toBe(0.7);
      
      expect(analysis.scoreRanges.lexical.min).toBe(0.7);
      expect(analysis.scoreRanges.lexical.max).toBe(0.9);
      expect(analysis.scoreRanges.semantic.min).toBe(0.5);
      expect(analysis.scoreRanges.semantic.max).toBe(0.7);
    });

    it('should handle empty array gracefully', () => {
      const analysis = analyzeRankingDistribution([]);
      
      expect(analysis.totalItems).toBe(0);
      expect(analysis.averageScores.hybrid).toBe(0);
      expect(analysis.scoreRanges.lexical.min).toBe(0);
      expect(analysis.scoreRanges.lexical.max).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should demonstrate complete ranking pipeline', () => {
      // Simulate search results with different characteristics
      const searchResults = [
        { id: 'perfect-match', isExactMatch: true },
        { id: 'popular-place', isPopular: true },
        { id: 'recent-post', isRecent: true },
        { id: 'semantic-match', isSemanticallyRelevant: true },
        { id: 'average-result', isAverage: true }
      ];
      
      // Score extractor that simulates different ranking factors
      const scoreExtractor = (item: typeof searchResults[0]) => ({
        lexicalScore: item.id === 'perfect-match' ? 0.95 : 0.6,
        semanticScore: item.id === 'semantic-match' ? 0.9 : 0.5,
        popularityScore: item.id === 'popular-place' ? 0.9 : 0.4,
        recencyScore: item.id === 'recent-post' ? 0.95 : 0.3,
        personalizationScore: 0.2
      });
      
      const config = createRankingConfig(DEFAULT_SEARCH_WEIGHTS);
      
      // Compute hybrid scores
      const scoredResults = computeBatchHybridScores(searchResults, scoreExtractor, config);
      
      // Rank results
      const rankedResults = rankByHybridScore(scoredResults, { limit: 3 });
      
      // Analyze distribution
      const analysis = analyzeRankingDistribution(scoredResults);
      
      expect(rankedResults).toHaveLength(3);
      expect(analysis.totalItems).toBe(5);
      
      // Perfect match should rank highly due to default lexical weight
      const perfectMatchResult = rankedResults.find(r => r.id === 'perfect-match');
      expect(perfectMatchResult).toBeDefined();
      expect(perfectMatchResult!.hybridScore).toBeGreaterThan(0.6);
    });
  });
});