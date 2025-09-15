// src/config/api.ts

// Support both Vite and Next.js environment variable conventions
// Priority: VITE_HF_BACKEND_URL > VITE_API_BASE_URL > NEXT_PUBLIC_API_BASE_URL
let apiBaseUrl = import.meta.env.VITE_HF_BACKEND_URL || 
                 import.meta.env.VITE_API_BASE_URL || 
                 import.meta.env.NEXT_PUBLIC_API_BASE_URL;

// Fallback to default if no environment variable is set
if (!apiBaseUrl) {
  apiBaseUrl = 'https://dae2ecbe68a0.ngrok-free.app/api';
  console.warn('No API base URL configured, using fallback:', apiBaseUrl);
}

// The environment variable should contain the full, correct base URL.
// We just need to remove any trailing slash to avoid double slashes in requests.
if (apiBaseUrl) {
  apiBaseUrl = apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
}

const API_BASE = apiBaseUrl;

// Configuration constants
export const API_CONFIG = {
  BASE_URL: API_BASE,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Core
  HEALTH: '/health',
  
  // Authentication
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  
  // Attractions & Search
  ATTRACTIONS: '/attractions',
  SEARCH: '/search',
  AUTOCOMPLETE: '/locations/autocomplete',
  
  // Community & Posts
  POSTS: '/posts',
  POST_LIKE: (id: string) => `/posts/${id}/like`,
  POST_COMMENTS: (id: string) => `/posts/${id}/comments`,
  POST_ENGAGEMENT: (id: string) => `/posts/${id}/engagement`,
  
  // Explore & Videos
  EXPLORE_VIDEOS: '/explore/videos',
  VIDEO_LIKE: (id: string) => `/videos/${id}/like`,
  VIDEO_SHARE: (id: string) => `/videos/${id}/share`,
  VIDEO_COMMENTS: (id: string) => `/videos/${id}/comments`,
  
  // Users
  USER_FOLLOW: (id: string) => `/users/${id}/follow`,
  
  // AI
  AI_PREDICT: '/predict',
  AI_TALK: '/talk',
  
  // Accommodations
  ACCOMMODATIONS_NEARBY: (id: string) => `/accommodations/nearby/${id}`,
} as const;

export default API_BASE;
