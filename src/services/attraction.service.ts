import apiClient from '@/lib/axios';
import { AttractionDetail } from '@/shared/types/attraction';
import { SearchResponse, SearchResult } from '@/shared/types/search';
import { AxiosError } from 'axios';

// Helper to extract a meaningful error message from an API error
const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Handle specific network errors
    if (error.code === "ERR_NETWORK") {
      return "Network error. Please check your connection or for a possible CORS issue.";
    }
    if (!error.response) {
      return "Could not connect to the server. Please try again later.";
    }

    // Check for a specific error message from the backend
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }

    // Fallback to the default Axios error message
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// Get attraction details by ID using the new /search endpoint
export const getAttractionDetail = async (id: string): Promise<AttractionDetail> => {
  const params = new URLSearchParams();
  params.append('id', id);
  params.append('limit', '1');

  const endpoint = `/search?${params.toString()}`;
  console.log("✅ Calling new search endpoint for detail:", endpoint);

  try {
    const { data } = await apiClient.get<SearchResponse>(endpoint);

    if (data.results && data.results.length > 0) {
      const result: SearchResult = data.results[0];
      return {
        ...result,
        nameLocal: result.nameLocal || result.name,
        images: [result.image],
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
  } catch (error) {
    console.error(`❌ Error fetching attraction detail from ${endpoint}:`, error);
    throw new Error(`Failed to fetch attraction details. ${getApiErrorMessage(error)}`);
  }
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
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.category) params.append('categories', options.category);
  if (options?.search) params.append('q', options.search);

  const endpoint = `/search?${params.toString()}`;
  console.log("✅ Calling new search endpoint for list:", endpoint);

  try {
    const { data } = await apiClient.get<SearchResponse>(endpoint);
    return {
      attractions: data.results,
      total: data.totalCount,
      page: options?.page || 1,
      limit: options?.limit || 10,
    };
  } catch (error) {
    console.error(`❌ Error fetching attractions from ${endpoint}:`, error);
    throw new Error(`Failed to fetch attractions. ${getApiErrorMessage(error)}`);
  }
};

// [NEW] Get list of attractions from the legacy HuggingFace endpoint
// This function also transforms the data to match the AttractionCardProps
export const getLegacyAttractions = async (): Promise<SearchResult[]> => {
  const endpoint = `/attractions`;
  console.log("✅ Calling legacy HuggingFace endpoint for list:", endpoint);

  try {
    const { data } = await apiClient.get(endpoint);

    if (data.success && data.data.attractions) {
      // Transform the API data to match the SearchResult/AttractionCardProps type
      return data.data.attractions.map((item: any): SearchResult => ({
        id: item.id.toString(),
        name: item.name,
        nameLocal: item.name,
        province: item.province,
        category: item.category,
        image: item.image_url || 'https://via.placeholder.com/400x250?text=No+Image',
        rating: item.average_rating || 0,
        reviewCount: item.total_reviews || 0,
        description: item.description || 'No description available.',
        tags: item.tags || [], // Assuming tags might exist, otherwise empty array
        location: item.location || { lat: 0, lng: 0 },
        amenities: [], // Legacy endpoint doesn't provide amenities
      }));
    }

    return [];
  } catch (error) {
    console.error(`❌ Error fetching legacy attractions from ${endpoint}:`, error);
    throw new Error(`Failed to fetch legacy attractions. ${getApiErrorMessage(error)}`);
  }
};
