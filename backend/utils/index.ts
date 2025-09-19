/**
 * Re-export all backend utilities for easy importing
 * 
 * Usage examples:
 * import { validateEmail, formatCurrency, API_ENDPOINTS } from '../../backend/utils';
 * import * as BackendUtils from '../../backend/utils';
 */

// Validation utilities
export {
  validateEmail,
  validateThaiPhoneNumber,
  validateUsername,
  validateStrongPassword,
  validateUrl,
  validateCoordinates,
  validateThaiText,
  validateImageType,
  validateVideoType,
  validateFileSize,
  validateRating,
  validatePagination,
  sanitizeText,
  sanitizeUsername,
  validateAndSanitizeHashtag,
  containsInappropriateContent
} from './validation';

// Formatting utilities
export {
  formatNumber,
  formatCompactNumber,
  formatCurrency,
  formatDistance,
  formatDuration,
  formatVideoDuration,
  formatFileSize,
  formatRating,
  formatRelativeTime,
  formatDate,
  formatPhoneNumber,
  truncateText,
  formatHashtags
} from './formatters';

// Constants
export {
  API_ENDPOINTS,
  ATTRACTION_CATEGORIES,
  USER_ROLES,
  FILE_UPLOAD_LIMITS,
  PAGINATION_DEFAULTS,
  SEARCH_CONSTANTS,
  RATING_CONSTANTS,
  LANGUAGES,
  VISIBILITY_OPTIONS,
  CONTENT_STATUS,
  ERROR_CODES,
  CACHE_DURATIONS,
  RATE_LIMITS
} from './constants';