import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';

// Enhanced API state interface
export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isError: boolean;
  isSuccess: boolean;
  retryCount: number;
}

// Enhanced API error interface
export interface ApiError extends AxiosError {
  userMessage?: string;
  isNetworkError?: boolean;
  isServerError?: boolean;
  isClientError?: boolean;
  retryCount?: number;
  timestamp?: string;
}

// Hook options
export interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
}

// Custom hook for handling API calls with enhanced state management
export const useApiCall = <T,>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiCallOptions = {}
) => {
  const {
    onSuccess,
    onError,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    showToast = true
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: false,
    retryCount: 0
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false
    }));

    const attemptCall = async (attempt: number): Promise<void> => {
      try {
        const result = await apiFunction(...args);
        setState(prev => ({
          ...prev,
          data: result,
          isLoading: false,
          isSuccess: true,
          retryCount: attempt
        }));
        onSuccess?.(result);
      } catch (error) {
        const apiError = error as ApiError;
        const shouldRetry = enableRetry && attempt < maxRetries && (
          apiError.isNetworkError || 
          apiError.isServerError ||
          apiError.code === 'ECONNABORTED'
        );

        if (shouldRetry) {
          console.warn(`API call failed, retrying... (${attempt + 1}/${maxRetries})`);
          setTimeout(() => attemptCall(attempt + 1), retryDelay * Math.pow(2, attempt));
        } else {
          const errorMessage = apiError.userMessage || apiError.message || 'An unexpected error occurred';
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
            isError: true,
            retryCount: attempt
          }));
          onError?.(apiError);
        }
      }
    };

    await attemptCall(0);
  }, [apiFunction, onSuccess, onError, enableRetry, maxRetries, retryDelay]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: false,
      retryCount: 0
    });
  }, []);

  const retry = useCallback(() => {
    // This will be set by the last arguments passed to execute
    // For a proper retry, you might want to store the last arguments
    console.warn('Retry called but no stored arguments available');
  }, []);

  return {
    ...state,
    execute,
    reset,
    retry
  };
};

// Hook for network status monitoring
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        console.log('Network connection restored');
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      console.warn('Network connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

// Hook for API health monitoring
export const useApiHealth = (checkInterval: number = 30000) => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  const checkHealth = useCallback(async () => {
    try {
      const { apiUtils } = await import('@/lib/axios');
      const result = await apiUtils.checkHealth();
      setIsHealthy(true);
      setLastCheck(new Date());
      setErrorCount(0);
      return result;
    } catch (error) {
      console.warn('API health check failed:', error);
      setIsHealthy(false);
      setLastCheck(new Date());
      setErrorCount(prev => prev + 1);
      throw error;
    }
  }, []);

  useEffect(() => {
    // Initial health check
    checkHealth().catch(console.warn);

    // Set up periodic health checks
    const interval = setInterval(() => {
      checkHealth().catch(console.warn);
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkHealth, checkInterval]);

  return {
    isHealthy,
    lastCheck,
    errorCount,
    checkHealth
  };
};

// Hook for optimistic updates
export const useOptimisticUpdate = <T,>(
  initialData: T[],
  updateFn: (data: T[], optimisticUpdate: Partial<T> & { id: string }) => T[]
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, Partial<T>>>(new Map());

  const addOptimisticUpdate = useCallback((id: string, update: Partial<T>) => {
    setOptimisticUpdates(prev => new Map(prev).set(id, update));
    setData(prev => updateFn(prev, { ...update, id }));
  }, [updateFn]);

  const confirmUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const revertUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    // Revert the data change - you might need to store original state
    setData(initialData);
  }, [initialData]);

  return {
    data,
    optimisticUpdates,
    addOptimisticUpdate,
    confirmUpdate,
    revertUpdate,
    setData
  };
};

// Hook for pagination with API calls
export const usePaginatedApi = <T,>(
  apiFunction: (page: number, limit: number, ...args: any[]) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  pageSize: number = 10
) => {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const { execute, isLoading, error, isError } = useApiCall(apiFunction);

  const loadPage = useCallback(async (pageNumber: number, ...args: any[]) => {
    const result = await execute(pageNumber, pageSize, ...args);
    if (result) {
      if (pageNumber === 1) {
        setAllData(result.data);
      } else {
        setAllData(prev => [...prev, ...result.data]);
      }
      setHasMore(result.hasMore);
      setTotal(result.total);
      setPage(pageNumber);
    }
  }, [execute, pageSize]);

  const loadMore = useCallback((...args: any[]) => {
    if (hasMore && !isLoading) {
      loadPage(page + 1, ...args);
    }
  }, [hasMore, isLoading, loadPage, page]);

  const refresh = useCallback((...args: any[]) => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    loadPage(1, ...args);
  }, [loadPage]);

  return {
    data: allData,
    page,
    hasMore,
    total,
    isLoading,
    error,
    isError,
    loadMore,
    refresh,
    loadPage
  };
};

export default useApiCall;