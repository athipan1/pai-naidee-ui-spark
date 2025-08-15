/**
 * Environment configuration utility with safe fallbacks
 * Prevents runtime errors from missing environment variables
 */

interface AppConfig {
  API_BASE_URL: string;
  APP_TITLE: string;
  APP_VERSION: string;
  ENVIRONMENT: string;
  ENABLE_DEBUG: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_PWA: boolean;
  ENABLE_SW: boolean;
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ''): string {
  try {
    // For Vite, environment variables are available on import.meta.env
    const value = import.meta.env[key];
    return value !== undefined ? String(value) : fallback;
  } catch (error) {
    console.warn(`Failed to read environment variable ${key}, using fallback:`, fallback);
    return fallback;
  }
}

/**
 * Get boolean environment variable with fallback
 */
function getBooleanEnvVar(key: string, fallback: boolean = false): boolean {
  try {
    const value = getEnvVar(key, String(fallback));
    return value === 'true' || value === '1';
  } catch (error) {
    console.warn(`Failed to read boolean environment variable ${key}, using fallback:`, fallback);
    return fallback;
  }
}

/**
 * Determine if we're in production environment
 */
function isProduction(): boolean {
  try {
    return import.meta.env.PROD === true || getEnvVar('NODE_ENV') === 'production';
  } catch (error) {
    // If import.meta.env is not available, check other indicators
    return typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  }
}

/**
 * Determine if we're in development environment
 */
function isDevelopment(): boolean {
  try {
    return import.meta.env.DEV === true || getEnvVar('NODE_ENV') === 'development';
  } catch (error) {
    return !isProduction();
  }
}

/**
 * Application configuration with safe defaults
 */
export const appConfig: AppConfig = {
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', isProduction() ? '/api' : 'http://localhost:5000/api'),
  APP_TITLE: getEnvVar('VITE_APP_TITLE', 'PaiNaiDee - Discover Thailand\'s Hidden Gems'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  ENVIRONMENT: getEnvVar('VITE_ENVIRONMENT', isProduction() ? 'production' : 'development'),
  ENABLE_DEBUG: getBooleanEnvVar('VITE_ENABLE_DEBUG', isDevelopment()),
  ENABLE_ANALYTICS: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', isProduction()),
  ENABLE_PWA: getBooleanEnvVar('VITE_ENABLE_PWA', isProduction()),
  ENABLE_SW: getBooleanEnvVar('VITE_ENABLE_SW', isProduction()),
};

/**
 * Log configuration in development
 */
if (appConfig.ENABLE_DEBUG) {
  console.log('[App Config] Environment configuration loaded:', {
    ...appConfig,
    BUILD_MODE: isDevelopment() ? 'development' : 'production',
    IS_PROD: isProduction(),
    IS_DEV: isDevelopment(),
  });
}

/**
 * Helper functions for environment detection
 */
export const env = {
  isProduction,
  isDevelopment,
  getEnvVar,
  getBooleanEnvVar,
};

export default appConfig;