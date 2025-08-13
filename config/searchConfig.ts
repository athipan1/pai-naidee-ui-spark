// Search configuration and feature flags for Phase 2 implementation

export interface SearchWeightConfig {
  lexical: number;
  semantic: number;
  popularity: number;
  recency: number;
  personalization: number;
}

export interface FeatureFlags {
  ENABLE_SEMANTIC: boolean;
  ENABLE_PERSONALIZATION: boolean;
  ENABLE_ADV_FILTERS: boolean;
}

// Default weight configuration
export const DEFAULT_SEARCH_WEIGHTS: SearchWeightConfig = {
  lexical: 0.45,
  semantic: 0.25,
  popularity: 0.15,
  recency: 0.10,
  personalization: 0.05
};

// Default feature flags
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  ENABLE_SEMANTIC: false, // Start disabled for safety
  ENABLE_PERSONALIZATION: false,
  ENABLE_ADV_FILTERS: false
};

/**
 * Validate that search weights sum to approximately 1.0 (±0.05 tolerance)
 */
export function validateSearchWeights(weights: SearchWeightConfig): boolean {
  const sum = weights.lexical + weights.semantic + weights.popularity + weights.recency + weights.personalization;
  const tolerance = 0.05;
  return Math.abs(sum - 1.0) <= tolerance;
}

/**
 * Get search configuration with environment variable overrides
 */
export function getSearchConfig(): {
  weights: SearchWeightConfig;
  features: FeatureFlags;
} {
  // Get weights from environment or use defaults
  const weights: SearchWeightConfig = {
    lexical: parseFloat(process.env.SEARCH_WEIGHT_LEXICAL || String(DEFAULT_SEARCH_WEIGHTS.lexical)),
    semantic: parseFloat(process.env.SEARCH_WEIGHT_SEMANTIC || String(DEFAULT_SEARCH_WEIGHTS.semantic)),
    popularity: parseFloat(process.env.SEARCH_WEIGHT_POPULARITY || String(DEFAULT_SEARCH_WEIGHTS.popularity)),
    recency: parseFloat(process.env.SEARCH_WEIGHT_RECENCY || String(DEFAULT_SEARCH_WEIGHTS.recency)),
    personalization: parseFloat(process.env.SEARCH_WEIGHT_PERSONALIZATION || String(DEFAULT_SEARCH_WEIGHTS.personalization))
  };

  // Validate weights and fallback to defaults if invalid
  if (!validateSearchWeights(weights)) {
    console.warn('[search] Invalid weight configuration, falling back to defaults:', weights);
    return {
      weights: DEFAULT_SEARCH_WEIGHTS,
      features: getFeatureFlags()
    };
  }

  return {
    weights,
    features: getFeatureFlags()
  };
}

/**
 * Get feature flags from environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    ENABLE_SEMANTIC: process.env.ENABLE_SEMANTIC === 'true' || DEFAULT_FEATURE_FLAGS.ENABLE_SEMANTIC,
    ENABLE_PERSONALIZATION: process.env.ENABLE_PERSONALIZATION === 'true' || DEFAULT_FEATURE_FLAGS.ENABLE_PERSONALIZATION,
    ENABLE_ADV_FILTERS: process.env.ENABLE_ADV_FILTERS === 'true' || DEFAULT_FEATURE_FLAGS.ENABLE_ADV_FILTERS
  };
}