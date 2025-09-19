/**
 * Re-export all backend types for easy importing
 * 
 * Usage examples:
 * import type { APIResponse, PaginationParams } from '../../backend/types';
 * import type { User, UserRole } from '../../backend/types';
 * import type { Attraction, AttractionCategory } from '../../backend/types';
 */

// API types
export type {
  APIResponse,
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  ValidationError,
  ValidationErrorResponse,
  HealthCheckResponse,
  FileUploadResponse
} from './api';

// User types
export type {
  User,
  UserPreferences,
  UserProfileUpdate,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthResult,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerificationRequest,
  UserFollow,
  UserStats,
  PublicUserProfile
} from './user';

export { UserRole, Permission } from './user';

// Attraction types
export type {
  Coordinates,
  Address,
  DayHours,
  OpeningHours,
  AttractionMedia,
  AttractionRating,
  AttractionAmenities,
  Attraction,
  AttractionSummary,
  AttractionFilters,
  Accommodation,
  LocationSuggestion
} from './attraction';

export { AttractionCategory } from './attraction';

// Community types
export type {
  PostMedia,
  PostLocation,
  PostEngagement,
  Post,
  CreatePostData,
  UpdatePostData,
  Comment,
  CreateCommentData,
  Video,
  UserInteraction,
  FeedItem,
  ContentSearchResult
} from './community';