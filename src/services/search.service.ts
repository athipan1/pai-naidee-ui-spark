import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import { SearchQuery, SearchResponse, SearchSuggestion } from '@/shared/types/search';

/**
 * Perform search using the legacy POST endpoint
 * @param searchQuery SearchQuery
 * @returns SearchResponse
 */
export const performSearch = async (
  searchQuery: SearchQuery
): Promise<SearchResponse> => {
  try {
    const { data } = await apiClient.post<SearchResponse>(API_ENDPOINTS.SEARCH, searchQuery);
    return data;
  } catch (error) {
    throw new Error((error as any)?.userMessage || 'Search failed');
  }
};

/**
 * Perform search using the new GET endpoint
 * @param query Search query string
 * @param options Search options
 * @returns SearchResponse
 */
export const performGetSearch = async (
  query: string,
  options?: {
    categories?: string[];
    provinces?: string[];
    limit?: number;
    page?: number;
  }
): Promise<SearchResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (options?.categories?.length) {
      params.append('categories', options.categories.join(','));
    }
    if (options?.provinces?.length) {
      params.append('provinces', options.provinces.join(','));
    }
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.page) {
      params.append('page', options.page.toString());
    }

    const endpoint = `${API_ENDPOINTS.SEARCH}?${params.toString()}`;
    const { data } = await apiClient.get<SearchResponse>(endpoint);
    return data;
  } catch (error) {
    throw new Error((error as any)?.userMessage || 'Search failed');
  }
};

/**
 * Get suggestions for autocomplete
 * @param query text to suggest on
 * @param limit number of suggestions
 * @returns SearchSuggestion[]
 */
export const getSearchSuggestions = async (
  query: string,
  limit: number = 10
): Promise<SearchSuggestion[]> => {
  try {
    const endpoint = `${API_ENDPOINTS.AUTOCOMPLETE}?q=${encodeURIComponent(query)}&limit=${limit}`;
    const { data } = await apiClient.get<SearchSuggestion[]>(endpoint);
    return data;
  } catch (error) {
    console.warn('Autocomplete endpoint not available, returning empty suggestions');
    return [];
  }
};

/**
 * Fetch available filters (mock implementation for now)
 * For dynamic UI filter options
 */
export const fetchSearchFilters = async (): Promise<{
  provinces: { id: string; name: string; nameLocal?: string }[];
  categories: { id: string; name: string; nameLocal?: string }[];
  amenities: { id: string; name: string; nameLocal?: string }[];
}> => {
  // Mock data since endpoint doesn't exist yet
  console.warn('Search filters endpoint not implemented, returning mock data');
  
  return {
    provinces: [
      { id: 'bangkok', name: 'Bangkok', nameLocal: 'กรุงเทพฯ' },
      { id: 'chiangmai', name: 'Chiang Mai', nameLocal: 'เชียงใหม่' },
      { id: 'phuket', name: 'Phuket', nameLocal: 'ภูเก็ต' },
      { id: 'krabi', name: 'Krabi', nameLocal: 'กระบี่' },
    ],
    categories: [
      { id: 'temple', name: 'Temple', nameLocal: 'วัด' },
      { id: 'beach', name: 'Beach', nameLocal: 'ชายหาด' },
      { id: 'mountain', name: 'Mountain', nameLocal: 'ภูเขา' },
      { id: 'market', name: 'Market', nameLocal: 'ตลาด' },
    ],
    amenities: [
      { id: 'parking', name: 'Parking', nameLocal: 'ที่จอดรถ' },
      { id: 'restaurant', name: 'Restaurant', nameLocal: 'ร้านอาหาร' },
      { id: 'restroom', name: 'Restroom', nameLocal: 'ห้องน้ำ' },
    ]
  };
};
