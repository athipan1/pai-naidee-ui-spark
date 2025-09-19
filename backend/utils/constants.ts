/**
 * Application constants
 * Shared between frontend and backend
 */

/**
 * API endpoint paths
 * Use these constants to ensure consistency across the application
 */
export const API_ENDPOINTS = {
  // Health & System
  HEALTH: '/api/health',
  
  // Authentication
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/api/auth/reset-password',
  AUTH_VERIFY_EMAIL: '/api/auth/verify-email',
  
  // Users
  USERS: '/api/users',
  USER_PROFILE: '/api/users/profile',
  USER_FOLLOW: (id: string) => `/api/users/${id}/follow`,
  USER_UNFOLLOW: (id: string) => `/api/users/${id}/unfollow`,
  USER_FOLLOWERS: (id: string) => `/api/users/${id}/followers`,
  USER_FOLLOWING: (id: string) => `/api/users/${id}/following`,
  
  // Attractions
  ATTRACTIONS: '/api/attractions',
  ATTRACTION_DETAIL: (id: string) => `/api/attractions/${id}`,
  ATTRACTION_SEARCH: '/api/attractions/search',
  ATTRACTION_NEARBY: '/api/attractions/nearby',
  ATTRACTION_POPULAR: '/api/attractions/popular',
  ATTRACTION_CATEGORIES: '/api/attractions/categories',
  
  // Search & Location
  SEARCH: '/api/search',
  SEARCH_SUGGESTIONS: '/api/search/suggestions',
  LOCATIONS_AUTOCOMPLETE: '/api/locations/autocomplete',
  LOCATIONS_PROVINCES: '/api/locations/provinces',
  
  // Posts & Community
  POSTS: '/api/posts',
  POST_DETAIL: (id: string) => `/api/posts/${id}`,
  POST_LIKE: (id: string) => `/api/posts/${id}/like`,
  POST_UNLIKE: (id: string) => `/api/posts/${id}/unlike`,
  POST_SAVE: (id: string) => `/api/posts/${id}/save`,
  POST_UNSAVE: (id: string) => `/api/posts/${id}/unsave`,
  POST_COMMENTS: (id: string) => `/api/posts/${id}/comments`,
  POST_ENGAGEMENT: (id: string) => `/api/posts/${id}/engagement`,
  
  // Videos & Explore
  VIDEOS: '/api/videos',
  VIDEO_DETAIL: (id: string) => `/api/videos/${id}`,
  VIDEO_LIKE: (id: string) => `/api/videos/${id}/like`,
  VIDEO_UNLIKE: (id: string) => `/api/videos/${id}/unlike`,
  VIDEO_SAVE: (id: string) => `/api/videos/${id}/save`,
  VIDEO_UNSAVE: (id: string) => `/api/videos/${id}/unsave`,
  VIDEO_SHARE: (id: string) => `/api/videos/${id}/share`,
  VIDEO_COMMENTS: (id: string) => `/api/videos/${id}/comments`,
  EXPLORE_VIDEOS: '/api/explore/videos',
  EXPLORE_TRENDING: '/api/explore/trending',
  
  // Comments
  COMMENTS: '/api/comments',
  COMMENT_DETAIL: (id: string) => `/api/comments/${id}`,
  COMMENT_LIKE: (id: string) => `/api/comments/${id}/like`,
  COMMENT_UNLIKE: (id: string) => `/api/comments/${id}/unlike`,
  COMMENT_REPLIES: (id: string) => `/api/comments/${id}/replies`,
  
  // Media & Upload
  MEDIA_UPLOAD: '/api/media/upload',
  MEDIA_UPLOAD_MULTIPLE: '/api/media/upload/multiple',
  MEDIA_PROCESS: '/api/media/process',
  
  // AI & Prediction
  AI_PREDICT: '/api/predict',
  AI_TALK: '/api/talk',
  AI_RECOMMENDATIONS: '/api/ai/recommendations',
  
  // Accommodations
  ACCOMMODATIONS: '/api/accommodations',
  ACCOMMODATIONS_NEARBY: (attractionId: string) => `/api/accommodations/nearby/${attractionId}`,
  
  // Feeds
  FEED_HOME: '/api/feed/home',
  FEED_EXPLORE: '/api/feed/explore',
  FEED_FOLLOWING: '/api/feed/following',
  
  // Admin & Management
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_POSTS: '/api/admin/posts',
  ADMIN_REPORTS: '/api/admin/reports'
} as const;

/**
 * Attraction categories with Thai translations
 */
export const ATTRACTION_CATEGORIES = {
  TEMPLE: {
    value: 'temple',
    labelEn: 'Temple',
    labelTh: 'วัด'
  },
  BEACH: {
    value: 'beach',
    labelEn: 'Beach',
    labelTh: 'ชายหาด'
  },
  MOUNTAIN: {
    value: 'mountain',
    labelEn: 'Mountain',
    labelTh: 'ภูเขา'
  },
  WATERFALL: {
    value: 'waterfall',
    labelEn: 'Waterfall',
    labelTh: 'น้ำตก'
  },
  ISLAND: {
    value: 'island',
    labelEn: 'Island',
    labelTh: 'เกาะ'
  },
  NATURE: {
    value: 'nature',
    labelEn: 'Nature',
    labelTh: 'ธรรมชาติ'
  },
  CULTURE: {
    value: 'culture',
    labelEn: 'Culture',
    labelTh: 'วัฒนธรรม'
  },
  FOOD: {
    value: 'food',
    labelEn: 'Food',
    labelTh: 'อาหาร'
  },
  SHOPPING: {
    value: 'shopping',
    labelEn: 'Shopping',
    labelTh: 'ช้อปปิ้ง'
  },
  NIGHTLIFE: {
    value: 'nightlife',
    labelEn: 'Nightlife',
    labelTh: 'ไนท์ไลฟ์'
  },
  ADVENTURE: {
    value: 'adventure',
    labelEn: 'Adventure',
    labelTh: 'ผจญภัย'
  },
  WELLNESS: {
    value: 'wellness',
    labelEn: 'Wellness',
    labelTh: 'สุขภาพ'
  },
  HISTORICAL: {
    value: 'historical',
    labelEn: 'Historical',
    labelTh: 'ประวัติศาสตร์'
  },
  MUSEUM: {
    value: 'museum',
    labelEn: 'Museum',
    labelTh: 'พิพิธภัณฑ์'
  },
  PARK: {
    value: 'park',
    labelEn: 'Park',
    labelTh: 'สวนสาธารณะ'
  }
} as const;

/**
 * User roles with permissions
 */
export const USER_ROLES = {
  ADMIN: {
    value: 'admin',
    labelEn: 'Administrator',
    labelTh: 'ผู้ดูแลระบบ',
    level: 4
  },
  EDITOR: {
    value: 'editor',
    labelEn: 'Editor',
    labelTh: 'บรรณาธิการ',
    level: 3
  },
  MODERATOR: {
    value: 'moderator',
    labelEn: 'Moderator',
    labelTh: 'ผู้ดูแล',
    level: 2
  },
  USER: {
    value: 'user',
    labelEn: 'User',
    labelTh: 'ผู้ใช้',
    level: 1
  },
  GUEST: {
    value: 'guest',
    labelEn: 'Guest',
    labelTh: 'แขก',
    level: 0
  }
} as const;

/**
 * File upload limits
 */
export const FILE_UPLOAD_LIMITS = {
  // Image limits
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_MAX_WIDTH: 4096,
  IMAGE_MAX_HEIGHT: 4096,
  IMAGE_ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  
  // Video limits
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  VIDEO_MAX_DURATION: 300, // 5 minutes in seconds
  VIDEO_MAX_WIDTH: 1920,
  VIDEO_MAX_HEIGHT: 1080,
  VIDEO_ALLOWED_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
  
  // General limits
  MAX_FILES_PER_UPLOAD: 10,
  MAX_FILES_PER_POST: 20
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
} as const;

/**
 * Search and filtering constants
 */
export const SEARCH_CONSTANTS = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 200,
  MAX_SUGGESTIONS: 10,
  DEBOUNCE_DELAY: 300, // milliseconds
  MAX_RECENT_SEARCHES: 10
} as const;

/**
 * Rating and review constants
 */
export const RATING_CONSTANTS = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  DEFAULT_RATING: 3
} as const;

/**
 * Language constants
 */
export const LANGUAGES = {
  ENGLISH: {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  },
  THAI: {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย'
  }
} as const;

/**
 * Content visibility options
 */
export const VISIBILITY_OPTIONS = {
  PUBLIC: {
    value: 'public',
    labelEn: 'Public',
    labelTh: 'สาธารณะ'
  },
  PRIVATE: {
    value: 'private',
    labelEn: 'Private',
    labelTh: 'ส่วนตัว'
  },
  FRIENDS: {
    value: 'friends',
    labelEn: 'Friends Only',
    labelTh: 'เฉพาะเพื่อน'
  },
  UNLISTED: {
    value: 'unlisted',
    labelEn: 'Unlisted',
    labelTh: 'ไม่ระบุในรายการ'
  }
} as const;

/**
 * Content status options
 */
export const CONTENT_STATUS = {
  DRAFT: {
    value: 'draft',
    labelEn: 'Draft',
    labelTh: 'ร่าง'
  },
  PUBLISHED: {
    value: 'published',
    labelEn: 'Published',
    labelTh: 'เผยแพร่แล้ว'
  },
  ARCHIVED: {
    value: 'archived',
    labelEn: 'Archived',
    labelTh: 'เก็บถาวร'
  },
  DELETED: {
    value: 'deleted',
    labelEn: 'Deleted',
    labelTh: 'ลบแล้ว'
  }
} as const;

/**
 * Error codes for API responses
 */
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  VALUE_TOO_LONG: 'VALUE_TOO_LONG',
  VALUE_TOO_SHORT: 'VALUE_TOO_SHORT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATIONS = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 2 * 60 * 60, // 2 hours
  VERY_LONG: 24 * 60 * 60 // 24 hours
} as const;

/**
 * Rate limiting constants
 */
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: {
    window: 15 * 60, // 15 minutes
    max: 5
  },
  API_REQUESTS: {
    window: 60, // 1 minute
    max: 100
  },
  FILE_UPLOADS: {
    window: 60, // 1 minute
    max: 10
  },
  COMMENTS: {
    window: 60, // 1 minute
    max: 10
  },
  POSTS: {
    window: 60 * 60, // 1 hour
    max: 20
  }
} as const;