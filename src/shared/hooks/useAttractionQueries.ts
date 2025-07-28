// React Query hooks for attraction data management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attractionAPI, AttractionDetail, handleAttractionAPIError } from '../utils/attractionAPI';

// Query keys for consistent cache management
export const attractionKeys = {
  all: ['attractions'] as const,
  lists: () => [...attractionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [...attractionKeys.lists(), filters] as const,
  details: () => [...attractionKeys.all, 'detail'] as const,
  detail: (id: string) => [...attractionKeys.details(), id] as const,
};

// Hook to get attraction details with caching and error handling
export const useAttractionDetail = (id: string | undefined, options?: {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}) => {
  return useQuery({
    queryKey: attractionKeys.detail(id || ''),
    queryFn: () => {
      if (!id) throw new Error('Attraction ID is required');
      return attractionAPI.getAttractionDetail(id);
    },
    enabled: !!id && (options?.enabled !== false),
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: options?.cacheTime || 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
    retry: (failureCount, error) => {
      // Don't retry if attraction not found
      if (error.message.includes('not found')) return false;
      return failureCount < 2;
    },
    throwOnError: false, // Handle errors in component
    meta: {
      errorMessage: 'Failed to load attraction details'
    }
  });
};

// Hook to get list of attractions with filtering
export const useAttractions = (filters?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}, options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: attractionKeys.list(filters || {}),
    queryFn: () => attractionAPI.getAttractions(filters),
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime || 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    retry: 2,
    throwOnError: false,
    meta: {
      errorMessage: 'Failed to load attractions list'
    }
  });
};

// Hook to refresh attraction data (invalidate cache and refetch)
export const useRefreshAttraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id?: string) => {
      // Call API refresh endpoint
      const result = await attractionAPI.refreshAttractionData(id);
      
      if (id) {
        // Invalidate specific attraction cache
        await queryClient.invalidateQueries({
          queryKey: attractionKeys.detail(id)
        });
        
        // Also invalidate lists that might contain this attraction
        await queryClient.invalidateQueries({
          queryKey: attractionKeys.lists()
        });
      } else {
        // Invalidate all attraction caches
        await queryClient.invalidateQueries({
          queryKey: attractionKeys.all
        });
      }
      
      return result;
    },
    onSuccess: (data, id) => {
      console.log(`Attraction data refreshed: ${data.message}`);
    },
    onError: (error: Error) => {
      console.error('Failed to refresh attraction data:', error);
    },
    meta: {
      errorMessage: 'Failed to refresh attraction data'
    }
  });
};

// Hook to manually invalidate and refetch attraction data
export const useInvalidateAttraction = () => {
  const queryClient = useQueryClient();
  
  return {
    // Invalidate specific attraction
    invalidateAttraction: async (id: string) => {
      await queryClient.invalidateQueries({
        queryKey: attractionKeys.detail(id),
        exact: true
      });
    },
    
    // Invalidate all attractions
    invalidateAllAttractions: async () => {
      await queryClient.invalidateQueries({
        queryKey: attractionKeys.all
      });
    },
    
    // Force refetch specific attraction
    refetchAttraction: async (id: string) => {
      await queryClient.refetchQueries({
        queryKey: attractionKeys.detail(id),
        exact: true
      });
    },
    
    // Clear cache and refetch
    resetAttractionCache: async (id?: string) => {
      if (id) {
        await queryClient.removeQueries({
          queryKey: attractionKeys.detail(id)
        });
        await queryClient.refetchQueries({
          queryKey: attractionKeys.detail(id)
        });
      } else {
        await queryClient.removeQueries({
          queryKey: attractionKeys.all
        });
        await queryClient.refetchQueries({
          queryKey: attractionKeys.all
        });
      }
    }
  };
};

// Hook for optimistic updates when data changes
export const useUpdateAttractionCache = () => {
  const queryClient = useQueryClient();
  
  return {
    // Update attraction in cache optimistically
    updateAttractionInCache: (id: string, updater: (old: AttractionDetail) => AttractionDetail) => {
      queryClient.setQueryData(
        attractionKeys.detail(id),
        (old: AttractionDetail | undefined) => {
          if (!old) return undefined;
          return updater(old);
        }
      );
    },
    
    // Update attraction image in cache
    updateAttractionImages: (id: string, newImages: string[]) => {
      queryClient.setQueryData(
        attractionKeys.detail(id),
        (old: AttractionDetail | undefined) => {
          if (!old) return undefined;
          return {
            ...old,
            images: newImages,
            lastUpdated: new Date().toISOString()
          };
        }
      );
    },
    
    // Update attraction details in cache
    updateAttractionDetails: (id: string, updates: Partial<AttractionDetail>) => {
      queryClient.setQueryData(
        attractionKeys.detail(id),
        (old: AttractionDetail | undefined) => {
          if (!old) return undefined;
          return {
            ...old,
            ...updates,
            lastUpdated: new Date().toISOString()
          };
        }
      );
    }
  };
};

// Utility function to get error message from query
export const getAttractionErrorMessage = (error: Error | null, fallback: string = 'เกิดข้อผิดพลาด'): string => {
  if (!error) return fallback;
  return handleAttractionAPIError(error);
};