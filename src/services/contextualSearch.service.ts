import apiClient from '@/lib/axios';
import {
  PostSearchResult,
  Location,
  AdvancedSearchFilters,
} from '@/shared/types/posts';
import { SearchQuery, SearchResponse } from '@/shared/types/search';

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
    const searchQuery: SearchQuery = {
        query,
        language: options.language || 'th',
        filters: {
            provinces: options.filters?.provinces || [],
            categories: options.filters?.categories || [],
            amenities: options.filters?.amenities || [],
        }
    }
    const { data } = await apiClient.post<SearchResponse>('/api/search', searchQuery);

    // This is a temporary solution. The backend should return the correct format.
    // For now, I will adapt the response to the format expected by the component.
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
}

export async function searchLocations(query: string, limit: number = 10): Promise<Location[]> {
    const { data } = await apiClient.get(`/api/search/suggestions?query=${query}&limit=${limit}&type=location`);
    return data.suggestions;
}

export async function getTrendingSearches(language: 'th' | 'en' = 'th'): Promise<string[]> {
  const { data } = await apiClient.get(`/api/search/trending?language=${language}`);
  return data;
}
