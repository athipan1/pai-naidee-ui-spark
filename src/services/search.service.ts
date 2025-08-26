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
  const { data } = await apiClient.post<SearchResponse>('/api/search', searchQuery);
  return data;
};

/**
 * Get suggestions for autocomplete
 * @param query text to suggest on
 * @param language 'th' | 'en'
 * @returns SearchSuggestion[]
 */
export const getSearchSuggestions = async (
  query: string,
  language: "th" | "en" = "th"
): Promise<SearchSuggestion[]> => {
  const { data } = await apiClient.get<{suggestions: SearchSuggestion[]}>(
    `/api/search/suggestions?query=${encodeURIComponent(query)}&language=${language}`
  );
  return data.suggestions;
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
  const { data } = await apiClient.get('/api/search/filters');
  return data;
};
