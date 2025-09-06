// Utility functions for handling API errors, especially 404s
import { AxiosError, AxiosRequestConfig } from 'axios';

export interface APIErrorContext {
  endpoint: string;
  method: string;
  status?: number;
  message?: string;
  timestamp: string;
}

/**
 * Creates an axios config that suppresses 404 toast notifications
 * Useful for optional data fetching where 404s are expected
 */
export const createOptionalRequestConfig = (config: AxiosRequestConfig = {}): AxiosRequestConfig => {
  return {
    ...config,
    headers: {
      ...config.headers,
      'x-suppress-404-toast': 'true',
    },
  };
};

/**
 * Handles API errors with enhanced 404 error reporting
 */
export const handleAPIError = (error: AxiosError, context: Partial<APIErrorContext> = {}) => {
  const errorContext: APIErrorContext = {
    endpoint: context.endpoint || error.config?.url || 'unknown',
    method: context.method || error.config?.method?.toUpperCase() || 'UNKNOWN',
    status: error.response?.status,
    message: error.response?.data?.message || error.message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (error.response?.status === 404) {
    console.warn('API 404 Error:', errorContext);
    
    // Track 404 errors for monitoring
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_404_error', {
        event_category: 'API',
        event_label: errorContext.endpoint,
        custom_map: {
          method: errorContext.method,
          endpoint: errorContext.endpoint,
        },
      });
    }
  } else {
    console.error('API Error:', errorContext);
  }

  return Promise.reject(error);
};

/**
 * Wraps an API call with automatic 404 error handling
 */
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  context: Partial<APIErrorContext> = {}
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    return handleAPIError(error as AxiosError, context);
  }
};

/**
 * Creates a fallback function for when API calls fail
 */
export const withFallback = async <T>(
  apiCall: () => Promise<T>,
  fallback: T | (() => T),
  context: Partial<APIErrorContext> = {}
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    handleAPIError(error as AxiosError, context);
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
};

/**
 * Validates API endpoint URLs to prevent malformed requests
 */
export const validateEndpoint = (endpoint: string): boolean => {
  // Check for common endpoint issues
  if (!endpoint) return false;
  if (endpoint.includes('//')) return false; // Double slashes
  if (endpoint.includes('undefined') || endpoint.includes('null')) return false;
  if (endpoint.length > 2000) return false; // Extremely long URLs
  
  return true;
};

/**
 * Sanitizes and validates endpoint paths
 */
export const sanitizeEndpoint = (endpoint: string, params: Record<string, any> = {}): string => {
  let sanitized = endpoint;
  
  // Replace undefined/null parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      console.warn(`API Warning: Parameter '${key}' is undefined/null for endpoint '${endpoint}'`);
      sanitized = sanitized.replace(new RegExp(`{${key}}`, 'g'), '');
    } else {
      sanitized = sanitized.replace(new RegExp(`{${key}}`, 'g'), encodeURIComponent(String(value)));
    }
  });
  
  // Clean up any remaining template variables or double slashes
  sanitized = sanitized.replace(/{[^}]+}/g, '').replace(/\/+/g, '/');
  
  if (!validateEndpoint(sanitized)) {
    throw new Error(`Invalid endpoint generated: ${sanitized}`);
  }
  
  return sanitized;
};

// Type definitions for enhanced error tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default {
  createOptionalRequestConfig,
  handleAPIError,
  withErrorHandling,
  withFallback,
  validateEndpoint,
  sanitizeEndpoint,
};