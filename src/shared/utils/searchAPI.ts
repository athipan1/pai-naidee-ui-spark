// Search API utilities and types (production-ready, real backend integration)

export interface SearchQuery {
  query: string;
  language: 'th' | 'en';
  filters: {
    provinces: string[];
    categories: string[];
    amenities: string[];
  };
}

export interface SearchSuggestion {
  id: string;
  type: 'place' | 'province' | 'category' | 'tag' | 'phrase';
  text: string;
  description?: string;
  province?: string;
  category?: string;
  confidence: number;
  image?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  nameLocal?: string;
  province: string;
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  confidence: number;
  matchedTerms: string[];
  amenities?: string[];
  location?: {
    lat: number;
    lng: number;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  totalCount: number;
  query: string;
  processingTime: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Util: Get auth token if needed
const getAuthToken = (): string | null => localStorage.getItem('authToken');

const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

/**
 * Real API: Perform search by calling backend
 * @param searchQuery SearchQuery
 * @returns SearchResponse
 */
export const performSearch = async (searchQuery: SearchQuery): Promise<SearchResponse> => {
  const startTime = Date.now();
  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(searchQuery),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Defensive: ensure expected types
    const results: SearchResult[] = Array.isArray(data.results) ? data.results : [];
    const suggestions: SearchSuggestion[] = Array.isArray(data.suggestions) ? data.suggestions : [];
    const totalCount: number = typeof data.totalCount === 'number' ? data.totalCount : results.length;
    const query: string = typeof data.query === 'string' ? data.query : searchQuery.query;
    const processingTime: number =
      typeof data.processingTime === 'number'
        ? data.processingTime
        : Date.now() - startTime;

    return { results, suggestions, totalCount, query, processingTime };
  } catch (error) {
    // You may log error to a monitoring service here
    return {
      results: [],
      suggestions: [],
      totalCount: 0,
      query: searchQuery.query,
      processingTime: Date.now() - startTime,
    };
  }
};

/**
 * Get suggestions for autocomplete (if backend supports it)
 * @param query text to suggest on
 * @param language 'th' | 'en'
 * @returns SearchSuggestion[]
 */
export const getSearchSuggestions = async (
  query: string,
  language: 'th' | 'en' = 'th'
): Promise<SearchSuggestion[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search/suggestions?query=${encodeURIComponent(query)}&language=${language}`,
      {
        headers: createAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch suggestions');
    const data = await response.json();
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  } catch {
    return [];
  }
};

/**
 * Optionally: Fetch available filters (provinces, categories, amenities) from API
 * For dynamic UI filter options
 */
export const fetchSearchFilters = async (): Promise<{
  provinces: { id: string; name: string; nameLocal?: string }[];
  categories: { id: string; name: string; nameLocal?: string }[];
  amenities: { id: string; name: string; nameLocal?: string }[];
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/filters`, {
      headers: createAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch filters');
    return await response.json();
  } catch {
    return {
      provinces: [],
      categories: [],
      amenities: [],
    };
  }
};