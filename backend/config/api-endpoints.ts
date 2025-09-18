/**
 * API endpoint configuration
 * Centralized endpoint definitions with type safety
 */

import { API_ENDPOINTS } from '../utils/constants';

/**
 * API endpoint builder with type safety
 */
export class APIEndpointBuilder {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Get full URL for an endpoint
   * @param endpoint - Endpoint path
   * @returns Full URL
   */
  public getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  /**
   * Get all endpoint URLs
   * @returns Object with all endpoint URLs
   */
  public getAllUrls() {
    const urls: Record<string, string | ((id: string) => string)> = {};
    
    for (const [key, value] of Object.entries(API_ENDPOINTS)) {
      if (typeof value === 'function') {
        urls[key] = (id: string) => this.getUrl(value(id));
      } else {
        urls[key] = this.getUrl(value);
      }
    }
    
    return urls;
  }

  // Health & System
  public get health() { return this.getUrl(API_ENDPOINTS.HEALTH); }

  // Authentication
  public get authLogin() { return this.getUrl(API_ENDPOINTS.AUTH_LOGIN); }
  public get authRegister() { return this.getUrl(API_ENDPOINTS.AUTH_REGISTER); }
  public get authRefresh() { return this.getUrl(API_ENDPOINTS.AUTH_REFRESH); }
  public get authLogout() { return this.getUrl(API_ENDPOINTS.AUTH_LOGOUT); }
  public get authForgotPassword() { return this.getUrl(API_ENDPOINTS.AUTH_FORGOT_PASSWORD); }
  public get authResetPassword() { return this.getUrl(API_ENDPOINTS.AUTH_RESET_PASSWORD); }
  public get authVerifyEmail() { return this.getUrl(API_ENDPOINTS.AUTH_VERIFY_EMAIL); }

  // Users
  public get users() { return this.getUrl(API_ENDPOINTS.USERS); }
  public get userProfile() { return this.getUrl(API_ENDPOINTS.USER_PROFILE); }
  public userFollow(id: string) { return this.getUrl(API_ENDPOINTS.USER_FOLLOW(id)); }
  public userUnfollow(id: string) { return this.getUrl(API_ENDPOINTS.USER_UNFOLLOW(id)); }
  public userFollowers(id: string) { return this.getUrl(API_ENDPOINTS.USER_FOLLOWERS(id)); }
  public userFollowing(id: string) { return this.getUrl(API_ENDPOINTS.USER_FOLLOWING(id)); }

  // Attractions
  public get attractions() { return this.getUrl(API_ENDPOINTS.ATTRACTIONS); }
  public attractionDetail(id: string) { return this.getUrl(API_ENDPOINTS.ATTRACTION_DETAIL(id)); }
  public get attractionSearch() { return this.getUrl(API_ENDPOINTS.ATTRACTION_SEARCH); }
  public get attractionNearby() { return this.getUrl(API_ENDPOINTS.ATTRACTION_NEARBY); }
  public get attractionPopular() { return this.getUrl(API_ENDPOINTS.ATTRACTION_POPULAR); }
  public get attractionCategories() { return this.getUrl(API_ENDPOINTS.ATTRACTION_CATEGORIES); }

  // Search & Location
  public get search() { return this.getUrl(API_ENDPOINTS.SEARCH); }
  public get searchSuggestions() { return this.getUrl(API_ENDPOINTS.SEARCH_SUGGESTIONS); }
  public get locationsAutocomplete() { return this.getUrl(API_ENDPOINTS.LOCATIONS_AUTOCOMPLETE); }
  public get locationsProvinces() { return this.getUrl(API_ENDPOINTS.LOCATIONS_PROVINCES); }

  // Posts & Community
  public get posts() { return this.getUrl(API_ENDPOINTS.POSTS); }
  public postDetail(id: string) { return this.getUrl(API_ENDPOINTS.POST_DETAIL(id)); }
  public postLike(id: string) { return this.getUrl(API_ENDPOINTS.POST_LIKE(id)); }
  public postUnlike(id: string) { return this.getUrl(API_ENDPOINTS.POST_UNLIKE(id)); }
  public postSave(id: string) { return this.getUrl(API_ENDPOINTS.POST_SAVE(id)); }
  public postUnsave(id: string) { return this.getUrl(API_ENDPOINTS.POST_UNSAVE(id)); }
  public postComments(id: string) { return this.getUrl(API_ENDPOINTS.POST_COMMENTS(id)); }
  public postEngagement(id: string) { return this.getUrl(API_ENDPOINTS.POST_ENGAGEMENT(id)); }

  // Videos & Explore
  public get videos() { return this.getUrl(API_ENDPOINTS.VIDEOS); }
  public videoDetail(id: string) { return this.getUrl(API_ENDPOINTS.VIDEO_DETAIL(id)); }
  public videoLike(id: string) { return this.getUrl(API_ENDPOINTS.VIDEO_LIKE(id)); }
  public videoUnlike(id: string) { return this.getUrl(API_ENDPOINTS.VIDEO_UNLIKE(id)); }
  public videoSave(id: string) { return this.getUrl(API_ENDPOINTS.VIDEO_SAVE(id)); }
  public videoUnsave(id: string) { return this.getUrl(API_ENDPOINTS.VIDEO_UNSAVE(id)); }
  public videoShare(id: string) { return this.getUrl(API_ENDPOINTS.VIDEO_SHARE(id)); }
  public videoComments(id: string) { return this.getUrl(API_ENDPOINTS.VIDEO_COMMENTS(id)); }
  public get exploreVideos() { return this.getUrl(API_ENDPOINTS.EXPLORE_VIDEOS); }
  public get exploreTrending() { return this.getUrl(API_ENDPOINTS.EXPLORE_TRENDING); }

  // Comments
  public get comments() { return this.getUrl(API_ENDPOINTS.COMMENTS); }
  public commentDetail(id: string) { return this.getUrl(API_ENDPOINTS.COMMENT_DETAIL(id)); }
  public commentLike(id: string) { return this.getUrl(API_ENDPOINTS.COMMENT_LIKE(id)); }
  public commentUnlike(id: string) { return this.getUrl(API_ENDPOINTS.COMMENT_UNLIKE(id)); }
  public commentReplies(id: string) { return this.getUrl(API_ENDPOINTS.COMMENT_REPLIES(id)); }

  // Media & Upload
  public get mediaUpload() { return this.getUrl(API_ENDPOINTS.MEDIA_UPLOAD); }
  public get mediaUploadMultiple() { return this.getUrl(API_ENDPOINTS.MEDIA_UPLOAD_MULTIPLE); }
  public get mediaProcess() { return this.getUrl(API_ENDPOINTS.MEDIA_PROCESS); }

  // AI & Prediction
  public get aiPredict() { return this.getUrl(API_ENDPOINTS.AI_PREDICT); }
  public get aiTalk() { return this.getUrl(API_ENDPOINTS.AI_TALK); }
  public get aiRecommendations() { return this.getUrl(API_ENDPOINTS.AI_RECOMMENDATIONS); }

  // Accommodations
  public get accommodations() { return this.getUrl(API_ENDPOINTS.ACCOMMODATIONS); }
  public accommodationsNearby(attractionId: string) { 
    return this.getUrl(API_ENDPOINTS.ACCOMMODATIONS_NEARBY(attractionId)); 
  }

  // Feeds
  public get feedHome() { return this.getUrl(API_ENDPOINTS.FEED_HOME); }
  public get feedExplore() { return this.getUrl(API_ENDPOINTS.FEED_EXPLORE); }
  public get feedFollowing() { return this.getUrl(API_ENDPOINTS.FEED_FOLLOWING); }

  // Admin & Management
  public get adminDashboard() { return this.getUrl(API_ENDPOINTS.ADMIN_DASHBOARD); }
  public get adminUsers() { return this.getUrl(API_ENDPOINTS.ADMIN_USERS); }
  public get adminPosts() { return this.getUrl(API_ENDPOINTS.ADMIN_POSTS); }
  public get adminReports() { return this.getUrl(API_ENDPOINTS.ADMIN_REPORTS); }
}

/**
 * Default API endpoint builder with environment-based URL
 */
export function createAPIEndpointBuilder(baseUrl?: string): APIEndpointBuilder {
  if (baseUrl) {
    return new APIEndpointBuilder(baseUrl);
  }

  // Try to get base URL from environment variables
  let apiBaseUrl: string | undefined;

  // Frontend environment variables (Vite) - check if we're in browser
  if (typeof window !== 'undefined') {
    try {
      // Use globalThis to safely access import.meta
      const importMeta = (globalThis as any).import?.meta;
      if (importMeta?.env) {
        apiBaseUrl = importMeta.env.VITE_HF_BACKEND_URL || 
                     importMeta.env.VITE_API_BASE_URL || 
                     importMeta.env.NEXT_PUBLIC_API_BASE_URL;
      }
    } catch (e) {
      // Ignore errors in import.meta access
    }
  }

  // Backend environment variables (Node.js) - check if we're in Node.js
  if (!apiBaseUrl && typeof process !== 'undefined' && process.env) {
    apiBaseUrl = process.env.API_BASE_URL || 
                 process.env.BACKEND_URL ||
                 process.env.SERVER_URL;
  }

  // Fallback URL
  if (!apiBaseUrl) {
    apiBaseUrl = 'https://dae2ecbe68a0.ngrok-free.app/api';
    console.warn('No API base URL configured, using fallback:', apiBaseUrl);
  }

  return new APIEndpointBuilder(apiBaseUrl);
}

/**
 * Default API endpoint builder instance
 */
export const apiEndpoints = createAPIEndpointBuilder();

/**
 * Export the raw endpoints for direct use
 */
export { API_ENDPOINTS } from '../utils/constants';