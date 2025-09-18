/**
 * Database configuration types and constants
 * Shared between frontend and backend
 */

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  /** Database host */
  host: string;
  /** Database port */
  port: number;
  /** Database name */
  database: string;
  /** Username for authentication */
  username: string;
  /** Password for authentication */
  password: string;
  /** Database type */
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb';
  /** SSL configuration */
  ssl?: boolean | {
    rejectUnauthorized?: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
  /** Connection timeout in milliseconds */
  connectTimeout?: number;
  /** Query timeout in milliseconds */
  queryTimeout?: number;
  /** Maximum number of connections in pool */
  maxConnections?: number;
  /** Minimum number of connections in pool */
  minConnections?: number;
  /** Connection pool idle timeout */
  idleTimeout?: number;
  /** Enable query logging */
  logging?: boolean;
  /** Database timezone */
  timezone?: string;
}

/**
 * Redis configuration for caching
 */
export interface RedisConfig {
  /** Redis host */
  host: string;
  /** Redis port */
  port: number;
  /** Redis password */
  password?: string;
  /** Redis database number */
  db?: number;
  /** Connection timeout */
  connectTimeout?: number;
  /** Command timeout */
  commandTimeout?: number;
  /** Maximum retry attempts */
  retryAttempts?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Key prefix for all cache keys */
  keyPrefix?: string;
}

/**
 * Search engine configuration (Elasticsearch/OpenSearch)
 */
export interface SearchConfig {
  /** Search engine host */
  host: string;
  /** Search engine port */
  port: number;
  /** Whether to use HTTPS */
  https?: boolean;
  /** API key for authentication */
  apiKey?: string;
  /** Username for basic auth */
  username?: string;
  /** Password for basic auth */
  password?: string;
  /** Default index name */
  defaultIndex: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Maximum number of retries */
  maxRetries?: number;
}

/**
 * File storage configuration
 */
export interface StorageConfig {
  /** Storage type */
  type: 'local' | 's3' | 'gcs' | 'azure';
  /** Base path or bucket name */
  basePath: string;
  /** Access configuration */
  access: {
    /** Access key ID (for cloud storage) */
    accessKeyId?: string;
    /** Secret access key (for cloud storage) */
    secretAccessKey?: string;
    /** Region (for cloud storage) */
    region?: string;
    /** Endpoint URL (for S3-compatible storage) */
    endpoint?: string;
  };
  /** Upload limits */
  limits: {
    /** Maximum file size in bytes */
    maxFileSize: number;
    /** Maximum number of files per upload */
    maxFiles: number;
    /** Allowed file types */
    allowedTypes: string[];
  };
  /** CDN configuration */
  cdn?: {
    /** CDN base URL */
    baseUrl: string;
    /** Cache control header */
    cacheControl?: string;
  };
}

/**
 * Email service configuration
 */
export interface EmailConfig {
  /** Email service provider */
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  /** SMTP configuration (for SMTP provider) */
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  /** API configuration (for API-based providers) */
  api?: {
    apiKey: string;
    endpoint?: string;
    region?: string;
  };
  /** Default sender information */
  from: {
    name: string;
    email: string;
  };
  /** Template configuration */
  templates?: {
    /** Base path for email templates */
    path: string;
    /** Template engine */
    engine: 'handlebars' | 'mustache' | 'ejs';
  };
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  /** JWT configuration */
  jwt: {
    /** Secret key for signing tokens */
    secret: string;
    /** Token expiration time */
    expiresIn: string;
    /** Refresh token expiration time */
    refreshExpiresIn: string;
    /** Token issuer */
    issuer?: string;
    /** Token audience */
    audience?: string;
  };
  /** Password hashing configuration */
  password: {
    /** Number of salt rounds for bcrypt */
    saltRounds: number;
    /** Minimum password length */
    minLength: number;
    /** Require uppercase letters */
    requireUppercase: boolean;
    /** Require lowercase letters */
    requireLowercase: boolean;
    /** Require numbers */
    requireNumbers: boolean;
    /** Require special characters */
    requireSpecialChars: boolean;
  };
  /** OAuth configuration */
  oauth?: {
    google?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    facebook?: {
      appId: string;
      appSecret: string;
      redirectUri: string;
    };
    line?: {
      channelId: string;
      channelSecret: string;
      redirectUri: string;
    };
  };
  /** Rate limiting configuration */
  rateLimiting: {
    /** Maximum login attempts per IP */
    maxLoginAttempts: number;
    /** Login attempt window in seconds */
    loginAttemptWindow: number;
    /** Account lockout duration in seconds */
    lockoutDuration: number;
  };
}

/**
 * Application configuration
 */
export interface AppConfig {
  /** Application name */
  name: string;
  /** Application version */
  version: string;
  /** Environment */
  environment: 'development' | 'staging' | 'production';
  /** Debug mode */
  debug: boolean;
  /** Application URL */
  url: string;
  /** API URL */
  apiUrl: string;
  /** Frontend URL */
  frontendUrl: string;
  /** Default language */
  defaultLanguage: 'en' | 'th';
  /** Supported languages */
  supportedLanguages: string[];
  /** Timezone */
  timezone: string;
  /** CORS configuration */
  cors: {
    /** Allowed origins */
    origins: string[];
    /** Allowed methods */
    methods: string[];
    /** Allowed headers */
    headers: string[];
    /** Allow credentials */
    credentials: boolean;
  };
}

/**
 * Complete system configuration
 */
export interface SystemConfig {
  /** Application configuration */
  app: AppConfig;
  /** Database configuration */
  database: DatabaseConfig;
  /** Redis configuration */
  redis?: RedisConfig;
  /** Search engine configuration */
  search?: SearchConfig;
  /** Storage configuration */
  storage: StorageConfig;
  /** Email configuration */
  email: EmailConfig;
  /** Authentication configuration */
  auth: AuthConfig;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<SystemConfig> = {
  auth: {
    jwt: {
      secret: 'your-secret-key-here', // Should be overridden in production
      expiresIn: '1h',
      refreshExpiresIn: '7d'
    },
    password: {
      saltRounds: 10,
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    rateLimiting: {
      maxLoginAttempts: 5,
      loginAttemptWindow: 900, // 15 minutes
      lockoutDuration: 1800 // 30 minutes
    }
  }
};