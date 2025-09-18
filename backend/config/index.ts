/**
 * Re-export all backend config for easy importing
 * 
 * Usage examples:
 * import { apiEndpoints, createAPIEndpointBuilder } from '../../backend/config';
 * import type { SystemConfig, DatabaseConfig } from '../../backend/config';
 */

// API endpoints
export {
  APIEndpointBuilder,
  createAPIEndpointBuilder,
  apiEndpoints,
  API_ENDPOINTS
} from './api-endpoints';

// Database and system configuration types
export type {
  DatabaseConfig,
  RedisConfig,
  SearchConfig,
  StorageConfig,
  EmailConfig,
  AuthConfig,
  AppConfig,
  SystemConfig
} from './database';

export { DEFAULT_CONFIG } from './database';