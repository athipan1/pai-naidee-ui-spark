// Application constants for development
export const APP_CONFIG = {
  APP_NAME: 'PaiNaiDee',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'en' as const,
  SUPPORTED_LANGUAGES: ['en', 'th'] as const,
  API_ENDPOINTS: {
    ATTRACTIONS: '/attractions',
    SEARCH: '/search',
    FAVORITES: '/favorites',
    CATEGORIES: '/categories'
  }
};

export const CATEGORY_TYPES = {
  ALL: 'all',
  BEACH: 'beach',
  TEMPLE: 'temple', 
  MOUNTAIN: 'mountain',
  WATERFALL: 'waterfall',
  ISLAND: 'island',
  NATURE: 'nature',
  CULTURE: 'culture',
  FOOD: 'food'
} as const;

export const STORAGE_KEYS = {
  FAVORITES: 'painaidee_favorites',
  LANGUAGE: 'painaidee_language',
  THEME: 'painaidee_theme',
  USER_PREFERENCES: 'painaidee_user_prefs'
} as const;