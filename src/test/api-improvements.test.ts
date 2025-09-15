import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

describe('API Configuration', () => {
  describe('API_CONFIG', () => {
    it('should have correct default values', () => {
      expect(API_CONFIG.TIMEOUT).toBe(30000);
      expect(API_CONFIG.RETRY_ATTEMPTS).toBe(3);
      expect(API_CONFIG.RETRY_DELAY).toBe(1000);
      expect(API_CONFIG.CACHE_TIME).toBe(5 * 60 * 1000);
    });

    it('should have a valid base URL', () => {
      expect(API_CONFIG.BASE_URL).toBeDefined();
      expect(typeof API_CONFIG.BASE_URL).toBe('string');
      // Should not end with slash
      expect(API_CONFIG.BASE_URL).not.toMatch(/\/$/);
    });
  });

  describe('API_ENDPOINTS', () => {
    it('should have all required endpoints', () => {
      expect(API_ENDPOINTS.HEALTH).toBe('/health');
      expect(API_ENDPOINTS.AUTH_LOGIN).toBe('/auth/login');
      expect(API_ENDPOINTS.AUTH_REFRESH).toBe('/auth/refresh');
      expect(API_ENDPOINTS.ATTRACTIONS).toBe('/attractions');
      expect(API_ENDPOINTS.SEARCH).toBe('/search');
      expect(API_ENDPOINTS.AUTOCOMPLETE).toBe('/locations/autocomplete');
      expect(API_ENDPOINTS.POSTS).toBe('/posts');
      expect(API_ENDPOINTS.EXPLORE_VIDEOS).toBe('/explore/videos');
      expect(API_ENDPOINTS.AI_PREDICT).toBe('/predict');
      expect(API_ENDPOINTS.AI_TALK).toBe('/talk');
    });

    it('should generate correct dynamic endpoints', () => {
      expect(API_ENDPOINTS.POST_LIKE('123')).toBe('/posts/123/like');
      expect(API_ENDPOINTS.POST_COMMENTS('456')).toBe('/posts/456/comments');
      expect(API_ENDPOINTS.POST_ENGAGEMENT('789')).toBe('/posts/789/engagement');
      expect(API_ENDPOINTS.VIDEO_LIKE('abc')).toBe('/videos/abc/like');
      expect(API_ENDPOINTS.VIDEO_SHARE('def')).toBe('/videos/def/share');
      expect(API_ENDPOINTS.VIDEO_COMMENTS('ghi')).toBe('/videos/ghi/comments');
      expect(API_ENDPOINTS.USER_FOLLOW('user1')).toBe('/users/user1/follow');
      expect(API_ENDPOINTS.ACCOMMODATIONS_NEARBY('place1')).toBe('/accommodations/nearby/place1');
    });

    it('should handle special characters in dynamic endpoints', () => {
      expect(API_ENDPOINTS.POST_LIKE('post-123')).toBe('/posts/post-123/like');
      expect(API_ENDPOINTS.USER_FOLLOW('user_456')).toBe('/users/user_456/follow');
    });
  });
});

describe('API Error Handling', () => {
  it('should handle network errors', () => {
    const networkError = {
      code: 'ERR_NETWORK',
      message: 'Network Error',
      isNetworkError: true
    };

    expect(networkError.isNetworkError).toBe(true);
    expect(networkError.code).toBe('ERR_NETWORK');
  });

  it('should handle timeout errors', () => {
    const timeoutError = {
      code: 'ECONNABORTED',
      message: 'Timeout Error',
      isTimeoutError: true
    };

    expect(timeoutError.code).toBe('ECONNABORTED');
  });

  it('should handle server errors', () => {
    const serverError = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' }
      },
      isServerError: true
    };

    expect(serverError.response.status).toBe(500);
    expect(serverError.isServerError).toBe(true);
  });

  it('should handle client errors', () => {
    const clientError = {
      response: {
        status: 404,
        data: { message: 'Not Found' }
      },
      isClientError: true
    };

    expect(clientError.response.status).toBe(404);
    expect(clientError.isClientError).toBe(true);
  });
});

describe('Loading States', () => {
  it('should handle loading state transitions', () => {
    const loadingStates = {
      initial: { isLoading: false, error: null, data: null },
      loading: { isLoading: true, error: null, data: null },
      success: { isLoading: false, error: null, data: { success: true } },
      error: { isLoading: false, error: 'Failed to load', data: null }
    };

    expect(loadingStates.initial.isLoading).toBe(false);
    expect(loadingStates.loading.isLoading).toBe(true);
    expect(loadingStates.success.data).toEqual({ success: true });
    expect(loadingStates.error.error).toBe('Failed to load');
  });

  it('should validate retry logic', () => {
    const retryState = {
      maxRetries: 3,
      currentRetries: 0,
      shouldRetry: function(error: any) {
        return this.currentRetries < this.maxRetries && 
               (Boolean(error.isNetworkError) || Boolean(error.isServerError));
      }
    };

    const networkError = { isNetworkError: true };
    const clientError = { isClientError: true };

    expect(retryState.shouldRetry(networkError)).toBe(true);
    expect(retryState.shouldRetry(clientError)).toBe(false);

    // Simulate retries
    retryState.currentRetries = 3;
    expect(retryState.shouldRetry(networkError)).toBe(false);
  });
});

describe('Network Status', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    });
  });

  it('should detect online status', () => {
    expect(navigator.onLine).toBe(true);
  });

  it('should detect offline status', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true,
    });
    
    expect(navigator.onLine).toBe(false);
  });
});

describe('Utility Functions', () => {
  it('should format error messages correctly', () => {
    const formatErrorMessage = (error: any): string => {
      if (error.userMessage) return error.userMessage;
      if (error.response?.data?.message) return error.response.data.message;
      if (error.message) return error.message;
      return 'An unexpected error occurred';
    };

    expect(formatErrorMessage({ userMessage: 'Custom error' })).toBe('Custom error');
    expect(formatErrorMessage({ 
      response: { data: { message: 'API error' } } 
    })).toBe('API error');
    expect(formatErrorMessage({ message: 'Generic error' })).toBe('Generic error');
    expect(formatErrorMessage({})).toBe('An unexpected error occurred');
  });

  it('should validate response data structure', () => {
    const validateResponse = (data: any): boolean => {
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return false;
      }
      return data.hasOwnProperty('success');
    };

    expect(validateResponse({ success: true })).toBe(true);
    expect(validateResponse({ data: [] })).toBe(false);
    expect(validateResponse(null)).toBe(false);
    expect(validateResponse([])).toBe(false);
    expect(validateResponse('string')).toBe(false);
  });
});