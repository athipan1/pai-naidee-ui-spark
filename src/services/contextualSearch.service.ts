import apiClient from '@/lib/axios';
import {
  PostSearchResult,
  Location,
  AdvancedSearchFilters,
} from '@/shared/types/posts';
import { SearchQuery, SearchResponse } from '@/shared/types/search';
import { AxiosError } from 'axios';

// Helper to extract a meaningful error message from an API error
const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

export async function searchPosts(
  query: string,
  options: {
    limit?: number;
    language?: 'th' | 'en' | 'auto';
    includeRelated?: boolean;
    filters?: AdvancedSearchFilters;
  } = {}
): Promise<{
  results: PostSearchResult[];
  totalCount: number;
  processingTime: number;
  expandedTerms: string[];
}> {
  try {
    const searchQuery: SearchQuery = {
      query,
      language: options.language || 'th',
      filters: {
        provinces: options.filters?.provinces || [],
        categories: options.filters?.categories || [],
        amenities: options.filters?.amenities || [],
      },
    };
    const { data } = await apiClient.post<SearchResponse>('/search', searchQuery);

    const results: PostSearchResult[] = data.results.map((result: any) => ({
      ...result,
      searchMetrics: {
        relevanceScore: result.confidence,
        popularityScore: 0,
        recencyScore: 0,
        semanticScore: 0,
        finalScore: result.confidence,
      },
      matchedTerms: result.matchedTerms,
      highlightedCaption: result.description,
    }));

    return {
      results: results,
      totalCount: data.totalCount,
      processingTime: data.processingTime,
      expandedTerms: [],
    };
  } catch (error) {
    console.error(`❌ Error in searchPosts:`, error);
    throw new Error(`Post search failed. ${getApiErrorMessage(error)}`);
  }
}

export async function searchLocations(query: string, limit: number = 10): Promise<Location[]> {
  try {
    const { data } = await apiClient.get(`/locations/autocomplete?q=${query}&limit=${limit}`);
    return data;
  } catch (error) {
    console.error(`❌ Error in searchLocations:`, error);
    throw new Error(`Location search failed. ${getApiErrorMessage(error)}`);
  }
}

export async function getTrendingSearches(language: 'th' | 'en' = 'th'): Promise<string[]> {
  try {
    const { data } = await apiClient.get(`/search/trending?language=${language}`);
    return data;
  } catch (error) {
    console.error(`❌ Error in getTrendingSearches:`, error);
    throw new Error(`Failed to get trending searches. ${getApiErrorMessage(error)}`);
  }
}
