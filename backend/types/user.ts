/**
 * User and authentication related types
 * Shared between frontend and backend
 */

/**
 * User role enumeration
 */
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest'
}

/**
 * User permissions
 */
export enum Permission {
  // Content permissions
  CONTENT_CREATE = 'content:create',
  CONTENT_READ = 'content:read',
  CONTENT_UPDATE = 'content:update',
  CONTENT_DELETE = 'content:delete',
  CONTENT_PUBLISH = 'content:publish',
  
  // Media permissions
  MEDIA_UPLOAD = 'media:upload',
  MEDIA_READ = 'media:read',
  MEDIA_UPDATE = 'media:update',
  MEDIA_DELETE = 'media:delete',
  MEDIA_MODERATE = 'media:moderate',
  
  // User management permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',
  
  // System permissions
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_MONITOR = 'system:monitor',
  SYSTEM_BACKUP = 'system:backup'
}

/**
 * Core user interface
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** Username */
  username: string;
  /** Email address */
  email: string;
  /** Display name */
  displayName?: string;
  /** Profile avatar URL */
  avatar?: string;
  /** User role */
  role: UserRole;
  /** User permissions */
  permissions: Permission[];
  /** Account creation timestamp */
  createdAt: string;
  /** Last login timestamp */
  lastLoginAt?: string;
  /** Last activity timestamp */
  lastActiveAt?: string;
  /** Whether the account is active */
  isActive: boolean;
  /** Whether the email is verified */
  isEmailVerified: boolean;
  /** Whether the account is verified (blue checkmark) */
  isVerified?: boolean;
  /** User bio/description */
  bio?: string;
  /** User location */
  location?: string;
  /** User website */
  website?: string;
  /** User language preference */
  language?: 'en' | 'th';
  /** User preferences */
  preferences?: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** Theme preference */
  theme?: 'light' | 'dark' | 'auto';
  /** Notification preferences */
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  /** Privacy preferences */
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends';
    showEmail?: boolean;
    showLocation?: boolean;
  };
  /** Content preferences */
  content?: {
    defaultLanguage?: 'en' | 'th';
    autoTranslate?: boolean;
    showMatureContent?: boolean;
  };
}

/**
 * User profile update data
 */
export interface UserProfileUpdate {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  language?: 'en' | 'th';
  preferences?: Partial<UserPreferences>;
}

/**
 * Authentication credentials
 */
export interface LoginCredentials {
  /** Email or username */
  identifier: string;
  /** Password */
  password: string;
  /** Remember login session */
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  language?: 'en' | 'th';
  termsAccepted: boolean;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  /** Access token */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Token expiration timestamp */
  expiresAt: string;
  /** Token type */
  tokenType: 'Bearer';
}

/**
 * Authentication result
 */
export interface AuthResult {
  /** Authenticated user */
  user: User;
  /** Authentication tokens */
  tokens: AuthTokens;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  token: string;
}

/**
 * User follow relationship
 */
export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

/**
 * User stats
 */
export interface UserStats {
  /** Number of posts */
  postsCount: number;
  /** Number of followers */
  followersCount: number;
  /** Number of following */
  followingCount: number;
  /** Number of likes received */
  likesCount: number;
  /** Number of places visited */
  placesVisitedCount?: number;
}

/**
 * Public user profile (limited information)
 */
export interface PublicUserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  isVerified?: boolean;
  createdAt: string;
  stats: UserStats;
}