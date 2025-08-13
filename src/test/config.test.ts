// Tests for search configuration and feature flags

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_SEARCH_WEIGHTS,
  DEFAULT_FEATURE_FLAGS,
  validateSearchWeights,
  getSearchConfig,
  getFeatureFlags
} from '../../config/searchConfig';

describe('Search Configuration', () => {
  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.SEARCH_WEIGHT_LEXICAL;
    delete process.env.SEARCH_WEIGHT_SEMANTIC;
    delete process.env.SEARCH_WEIGHT_POPULARITY;
    delete process.env.SEARCH_WEIGHT_RECENCY;
    delete process.env.SEARCH_WEIGHT_PERSONALIZATION;
    delete process.env.ENABLE_SEMANTIC;
    delete process.env.ENABLE_PERSONALIZATION;
    delete process.env.ENABLE_ADV_FILTERS;
  });

  describe('Default Configuration', () => {
    it('should have valid default weights that sum to 1', () => {
      const weights = DEFAULT_SEARCH_WEIGHTS;
      const sum = weights.lexical + weights.semantic + weights.popularity + weights.recency + weights.personalization;
      
      expect(sum).toBeCloseTo(1.0, 2);
      expect(validateSearchWeights(weights)).toBe(true);
    });

    it('should have semantic disabled by default for safety', () => {
      expect(DEFAULT_FEATURE_FLAGS.ENABLE_SEMANTIC).toBe(false);
      expect(DEFAULT_FEATURE_FLAGS.ENABLE_PERSONALIZATION).toBe(false);
      expect(DEFAULT_FEATURE_FLAGS.ENABLE_ADV_FILTERS).toBe(false);
    });
  });

  describe('Weight Validation', () => {
    it('should validate correct weights', () => {
      const validWeights = {
        lexical: 0.4,
        semantic: 0.3,
        popularity: 0.2,
        recency: 0.1,
        personalization: 0.0
      };
      
      expect(validateSearchWeights(validWeights)).toBe(true);
    });

    it('should reject weights that sum too high', () => {
      const invalidWeights = {
        lexical: 0.5,
        semantic: 0.5,
        popularity: 0.3,
        recency: 0.2,
        personalization: 0.1
      };
      
      expect(validateSearchWeights(invalidWeights)).toBe(false);
    });

    it('should reject weights that sum too low', () => {
      const invalidWeights = {
        lexical: 0.2,
        semantic: 0.2,
        popularity: 0.1,
        recency: 0.1,
        personalization: 0.1
      };
      
      expect(validateSearchWeights(invalidWeights)).toBe(false);
    });

    it('should allow small tolerance in weight sum', () => {
      const slightlyOffWeights = {
        lexical: 0.45,
        semantic: 0.25,
        popularity: 0.15,
        recency: 0.1,
        personalization: 0.03 // Sum: 0.98, within tolerance
      };
      
      expect(validateSearchWeights(slightlyOffWeights)).toBe(true);
    });
  });

  describe('Environment Variable Override', () => {
    it('should use environment variables when provided', () => {
      process.env.SEARCH_WEIGHT_LEXICAL = '0.5';
      process.env.SEARCH_WEIGHT_SEMANTIC = '0.3';
      process.env.SEARCH_WEIGHT_POPULARITY = '0.1';
      process.env.SEARCH_WEIGHT_RECENCY = '0.05';
      process.env.SEARCH_WEIGHT_PERSONALIZATION = '0.05';
      
      const config = getSearchConfig();
      
      expect(config.weights.lexical).toBe(0.5);
      expect(config.weights.semantic).toBe(0.3);
      expect(config.weights.popularity).toBe(0.1);
      expect(config.weights.recency).toBe(0.05);
      expect(config.weights.personalization).toBe(0.05);
    });

    it('should fallback to defaults when environment weights are invalid', () => {
      // Mock console.warn to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      process.env.SEARCH_WEIGHT_LEXICAL = '0.8';
      process.env.SEARCH_WEIGHT_SEMANTIC = '0.8'; // Invalid: sum > 1
      
      const config = getSearchConfig();
      
      expect(config.weights).toEqual(DEFAULT_SEARCH_WEIGHTS);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[search] Invalid weight configuration'),
        expect.any(Object)
      );
      
      consoleSpy.mockRestore();
    });

    it('should enable features when environment variables are set', () => {
      process.env.ENABLE_SEMANTIC = 'true';
      process.env.ENABLE_PERSONALIZATION = 'true';
      
      const flags = getFeatureFlags();
      
      expect(flags.ENABLE_SEMANTIC).toBe(true);
      expect(flags.ENABLE_PERSONALIZATION).toBe(true);
      expect(flags.ENABLE_ADV_FILTERS).toBe(false); // Not set, should remain default
    });

    it('should not enable features for non-true values', () => {
      process.env.ENABLE_SEMANTIC = 'false';
      process.env.ENABLE_PERSONALIZATION = '1';
      process.env.ENABLE_ADV_FILTERS = 'yes';
      
      const flags = getFeatureFlags();
      
      expect(flags.ENABLE_SEMANTIC).toBe(false);
      expect(flags.ENABLE_PERSONALIZATION).toBe(false);
      expect(flags.ENABLE_ADV_FILTERS).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should return complete configuration with weights and features', () => {
      const config = getSearchConfig();
      
      expect(config).toHaveProperty('weights');
      expect(config).toHaveProperty('features');
      expect(config.weights).toHaveProperty('lexical');
      expect(config.weights).toHaveProperty('semantic');
      expect(config.weights).toHaveProperty('popularity');
      expect(config.weights).toHaveProperty('recency');
      expect(config.weights).toHaveProperty('personalization');
      expect(config.features).toHaveProperty('ENABLE_SEMANTIC');
      expect(config.features).toHaveProperty('ENABLE_PERSONALIZATION');
      expect(config.features).toHaveProperty('ENABLE_ADV_FILTERS');
    });
  });
});