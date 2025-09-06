import apiClient from '@/lib/axios';
import { AttractionDetail } from '@/shared/types/attraction';
import { SearchResponse, SearchResult } from '@/shared/types/search';
import { withErrorHandling, sanitizeEndpoint, createOptionalRequestConfig } from '@/lib/apiErrorHandler';

// Get attraction details by ID using the new /search endpoint
export const getAttractionDetail = async (id: string): Promise<AttractionDetail> => {
  return withErrorHandling(async () => {
    // Validate and sanitize the ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('Invalid attraction ID provided');
    }

    const params = new URLSearchParams();
    params.append('id', id);
    params.append('limit', '1');

    const endpoint = `/search?${params.toString()}`;
    console.log("✅ Calling new search endpoint for detail:", endpoint);

    const { data } = await apiClient.get<SearchResponse>(endpoint);

    if (data.results && data.results.length > 0) {
      // The search result needs to be mapped to the AttractionDetail type.
      // This is a temporary mapping and might need to be adjusted based on actual data structure.
      const result: SearchResult = data.results[0];
      return {
        ...result,
        nameLocal: result.nameLocal || result.name,
        images: [result.image], // Assuming the main image is the only one we get from search
        description: result.description || '',
        reviews: {
          count: result.reviewCount,
          average: result.rating,
        },
        location: result.location || { lat: 0, lng: 0 },
        amenities: result.amenities || [],
        tags: result.tags || [],
      };
    }

    throw new Error('Attraction not found');
  }, {
    endpoint: `/search?id=${id}`,
    method: 'GET',
  });
};

// Get list of all attractions using the new /search endpoint
export const getAttractions = async (options?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<{
  attractions: SearchResult[];
  total: number;
  page: number;
  limit: number;
}> => {
  return withErrorHandling(async () => {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.category) params.append('categories', options.category); // Assuming the API uses 'categories'
    if (options?.search) params.append('q', options.search); // Assuming the API uses 'q' for query

    const endpoint = `/search?${params.toString()}`;
    console.log("✅ Calling new search endpoint for list:", endpoint);

    const { data } = await apiClient.get<SearchResponse>(endpoint);
    return {
      attractions: data.results,
      total: data.totalCount,
      page: options?.page || 1,
      limit: options?.limit || 10,
    };
  }, {
    endpoint: `/search`,
    method: 'GET',
  });
};

// Enhanced attraction service with better 404 handling
export const getAttractionByIdFallback = async (id: string): Promise<AttractionDetail | null> => {
  try {
    return await getAttractionDetail(id);
  } catch (error: any) {
    // If 404, return null instead of throwing
    if (error.response?.status === 404) {
      console.warn(`Attraction with ID ${id} not found, returning null`);
      return null;
    }
    throw error;
  }
};
