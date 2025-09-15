import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiCall, useNetworkStatus, useApiHealth } from '@/shared/hooks/useApiCall';

// Mock environment
Object.defineProperty(global, 'navigator', {
  value: {
    onLine: true,
  },
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

describe('useApiCall', () => {
  let mockApiFunction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockApiFunction = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useApiCall(mockApiFunction));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.retryCount).toBe(0);
  });

  it('should handle successful API call', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockApiFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() => useApiCall(mockApiFunction));

    act(() => {
      result.current.execute('test-arg');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(result.current.isError).toBe(false);
    });

    expect(mockApiFunction).toHaveBeenCalledWith('test-arg');
  });

  it('should handle API call failure', async () => {
    const mockError = new Error('API Error');
    mockApiFunction.mockRejectedValue(mockError);

    const { result } = renderHook(() => 
      useApiCall(mockApiFunction, { enableRetry: false })
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe('API Error');
      expect(result.current.data).toBeNull();
      expect(result.current.isSuccess).toBe(false);
    });
  });

  it('should call onSuccess callback', async () => {
    const mockData = { success: true };
    const onSuccess = vi.fn();
    
    mockApiFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() => 
      useApiCall(mockApiFunction, { onSuccess })
    );

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should call onError callback', async () => {
    const mockError = new Error('Test error');
    const onError = vi.fn();
    
    mockApiFunction.mockRejectedValue(mockError);

    const { result } = renderHook(() => 
      useApiCall(mockApiFunction, { onError, enableRetry: false })
    );

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should reset state correctly', async () => {
    const mockData = { id: 1 };
    mockApiFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() => useApiCall(mockApiFunction));

    // Execute and wait for success
    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.retryCount).toBe(0);
  });

  it('should handle retry with network error', async () => {
    const networkError = Object.assign(new Error('Network Error'), {
      isNetworkError: true
    });
    
    mockApiFunction
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue({ success: true });

    const { result } = renderHook(() => 
      useApiCall(mockApiFunction, { maxRetries: 1, retryDelay: 10 })
    );

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    }, { timeout: 1000 });

    expect(mockApiFunction).toHaveBeenCalledTimes(2);
  });
});

describe('useNetworkStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset navigator.onLine
    Object.defineProperty(global.navigator, 'onLine', {
      value: true,
      writable: true,
    });
  });

  it('should initialize with online status', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('should detect offline status', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(false);
  });

  it('should register event listeners', () => {
    renderHook(() => useNetworkStatus());

    expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});

describe('useApiHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with null health status', () => {
    const { result } = renderHook(() => useApiHealth(1000));

    expect(result.current.isHealthy).toBeNull();
    expect(result.current.lastCheck).toBeNull();
    expect(result.current.errorCount).toBe(0);
  });

  it('should provide checkHealth function', () => {
    const { result } = renderHook(() => useApiHealth(1000));

    expect(typeof result.current.checkHealth).toBe('function');
  });

  it('should handle health check intervals', () => {
    renderHook(() => useApiHealth(1000));

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // The health check should have been called
    // Note: We can't easily test the actual health check without mocking the import
  });
});