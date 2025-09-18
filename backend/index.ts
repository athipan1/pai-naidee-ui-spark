/**
 * Backend shared module - Main entry point
 * 
 * This module provides shared types, utilities, and configurations
 * that can be used by both frontend and backend applications.
 * 
 * @example Frontend usage:
 * ```typescript
 * import type { APIResponse, User, Attraction } from '../../backend';
 * import { validateEmail, formatCurrency, apiEndpoints } from '../../backend';
 * 
 * // Use shared types
 * const handleResponse = (response: APIResponse<User>) => {
 *   if (response.success && response.data) {
 *     console.log('User:', response.data);
 *   }
 * };
 * 
 * // Use validation utilities
 * const isValid = validateEmail('user@example.com');
 * 
 * // Use API endpoints
 * const loginUrl = apiEndpoints.authLogin;
 * ```
 * 
 * @example Backend usage:
 * ```typescript
 * import type { User, CreatePostData, SystemConfig } from './backend';
 * import { validateEmail, API_ENDPOINTS, ERROR_CODES } from './backend';
 * 
 * // Use shared types in API handlers
 * app.post('/api/posts', (req: Request<{}, APIResponse<Post>, CreatePostData>) => {
 *   // Implementation
 * });
 * ```
 */

// Re-export all types
export * from './types';

// Re-export all utilities  
export * from './utils';

// Re-export all config
export * from './config';

// Default exports for common use cases
export { type APIResponse, type PaginationParams } from './types/api';
export { type User, type UserRole } from './types/user';
export { type Attraction, type AttractionCategory } from './types/attraction';
export { type Post, type Comment, type Video } from './types/community';

export { 
  validateEmail, 
  validateThaiPhoneNumber, 
  validateUsername,
  sanitizeText 
} from './utils/validation';

export { 
  formatCurrency, 
  formatDistance, 
  formatRelativeTime,
  formatFileSize 
} from './utils/formatters';

export { 
  API_ENDPOINTS, 
  ATTRACTION_CATEGORIES, 
  ERROR_CODES,
  PAGINATION_DEFAULTS 
} from './utils/constants';

export { apiEndpoints, createAPIEndpointBuilder } from './config/api-endpoints';