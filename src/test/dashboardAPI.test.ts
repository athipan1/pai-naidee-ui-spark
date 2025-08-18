import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getServiceStatus,
  startBackendProcess,
  stopBackendProcess,
  restartBackendProcess,
  getSystemLogs,
  getSystemMetrics
} from '../shared/utils/dashboardAPI';

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_API_BASE_URL: 'http://localhost:5000/api',
    VITE_ENABLE_DEBUG: 'false',
    MODE: 'test'
  }
}));

describe('Dashboard API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Authentication Integration', () => {
    it('should include auth token in headers when available', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Lbbt_5-8KRiXrw3LV1N95KCjBMJ2-1qGkZl1MHGjqzg';
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([])
      });

      await getServiceStatus();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/dashboard/services/status',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should not include auth header when token is not available', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([])
      });

      await getServiceStatus();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/dashboard/services/status',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });
  });

  describe('API Endpoint Paths', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });
    });

    it('should call correct endpoint for service status', async () => {
      await getServiceStatus();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/dashboard/services/status',
        expect.any(Object)
      );
    });

    it('should call correct endpoint for starting process', async () => {
      await startBackendProcess('test-process');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/dashboard/processes/test-process/start',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should call correct endpoint for stopping process', async () => {
      await stopBackendProcess('test-process');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/dashboard/processes/test-process/stop',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should call correct endpoint for restarting process', async () => {
      await restartBackendProcess('test-process');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/dashboard/processes/test-process/restart',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should call correct endpoint for logs with query parameters', async () => {
      await getSystemLogs('error', 'api-gateway', 50);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/dashboard/logs?level=error&source=api-gateway&limit=50',
        expect.any(Object)
      );
    });

    it('should call correct endpoint for system metrics', async () => {
      await getSystemMetrics();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/dashboard/metrics',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw authentication error for 401 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(getServiceStatus()).rejects.toThrow('Authentication required');
    });

    it('should throw authorization error for 403 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      await expect(startBackendProcess('test')).rejects.toThrow('Access forbidden');
    });

    it('should throw not found error for 404 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(getSystemLogs()).rejects.toThrow('Logs endpoint not available');
    });

    it('should throw server error for 500 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(getSystemMetrics()).rejects.toThrow('Server error');
    });

    it('should handle network errors gracefully with fallback data', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      // Should use mock fallback data for network errors
      const result = await getServiceStatus();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // Should return the mock services when network fails
      expect(result.some(service => service.id === 'api-gateway')).toBe(true);
    });

    it('should throw specific error for authentication/permission network issues', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Authentication required: 401'));

      await expect(getServiceStatus()).rejects.toThrow('Authentication required');
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });
    });

    it('should use GET method for service status', async () => {
      await getServiceStatus();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({
          method: expect.any(String)
        })
      );
    });

    it('should use POST method for process control endpoints', async () => {
      await startBackendProcess('test');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST'
        })
      );

      await stopBackendProcess('test');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST'
        })
      );

      await restartBackendProcess('test');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should use GET method for logs and metrics', async () => {
      await getSystemLogs();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({
          method: expect.any(String)
        })
      );

      await getSystemMetrics();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({
          method: expect.any(String)
        })
      );
    });
  });

  describe('Response Validation', () => {
    it('should return proper type for service status', async () => {
      const mockServices = [
        {
          id: 'test-service',
          name: 'Test Service',
          status: 'healthy' as const,
          lastCheck: new Date().toISOString(),
          responseTime: 100,
          uptime: '99.9%',
          endpoint: '/test'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices
      });

      const result = await getServiceStatus();
      expect(result).toEqual(mockServices);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('status');
      expect(['healthy', 'warning', 'error']).toContain(result[0].status);
    });

    it('should return proper type for process control responses', async () => {
      const mockResponse = { success: true, message: 'Process started' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await startBackendProcess('test');
      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
    });
  });
});