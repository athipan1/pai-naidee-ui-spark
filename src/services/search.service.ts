import apiClient from '@/lib/axios';
import { SearchQuery, SearchResponse, SearchSuggestion } from '@/shared/types/search';

/**
 * Perform search
 * @param searchQuery SearchQuery
 * @returns SearchResponse
 */
export const performSearch = async (
  searchQuery: SearchQuery
): Promise<SearchResponse> => {
  // Note: Using Legacy POST /search endpoint. New API has GET /search.
  const endpoint = '/search';
  console.log("✅ API endpoint OK (Legacy):", endpoint);
  const { data } = await apiClient.post<SearchResponse>(endpoint, searchQuery);
  return data;
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
  const endpoint = `/locations/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`;
  console.log("✅ API endpoint OK (replaces /search/suggestions):", endpoint);
  const { data } = await apiClient.get<SearchSuggestion[]>(endpoint);
  return data;
};

/**
 * Fetch available filters
 * For dynamic UI filter options
 */
export const fetchSearchFilters = async (): Promise<{
  provinces: { id: string; name: string; nameLocal?: string }[];
  categories: { id: string; name: string; nameLocal?: string }[];
  amenities: { id: string; name: string; nameLocal?: string }[];
}> => {
  const endpoint = '/search/filters';
  console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
  // This endpoint does not exist in the new API.
  // Returning a mock error response.
  return Promise.reject({ message: `Endpoint ${endpoint} not found.` });
};
