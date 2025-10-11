import { useState, useEffect, useCallback } from 'react';
import { SearchResult } from '@/shared/types/search';
import { searchPlaces } from '@/services/supabase.service';

interface UsePlacesOptions {
  initialCategory?: string | null;
  initialSearchQuery?: string;
  limit?: number;
}

interface UsePlacesReturn {
  places: SearchResult[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  total: number;
  hasMore: boolean;
  category: string | null;
  searchQuery: string;
  setCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  loadMore: () => void;
}

export const usePlaces = ({
  initialCategory = null,
  initialSearchQuery = '',
  limit = 20,
}: UsePlacesOptions = {}): UsePlacesReturn => {
  const [places, setPlaces] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [category, setCategory] = useState<string | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  const fetchPlaces = useCallback(async (isNewQuery = false) => {
    setIsLoading(true);
    setError(null);

    const currentPage = isNewQuery ? 1 : page;
    const categories = category ? [category] : [];

    try {
      const { results, totalCount } = await searchPlaces(
        searchQuery,
        categories,
        [], // provinces - can be added later
        limit,
        currentPage
      );

      setPlaces(prevPlaces => isNewQuery ? results : [...prevPlaces, ...results]);
      setTotal(totalCount);
      setPage(currentPage);
      setHasMore(currentPage * limit < totalCount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, category, page, limit]);

  // Effect to fetch places when search query or category changes
  useEffect(() => {
    // Reset places and page, then fetch
    setPlaces([]);
    setPage(1);
    setHasMore(true);
    fetchPlaces(true);
  }, [searchQuery, category]); // We only want to re-run this when these change, not the whole fetchPlaces function

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  // Effect to fetch more places when page number increases
  useEffect(() => {
    if (page > 1) {
      fetchPlaces(false);
    }
  }, [page]); // This effect now only depends on `page`

  // Handler to change category
  const handleSetCategory = (newCategory: string | null) => {
    setCategory(newCategory);
  };

  // Handler to change search query
  const handleSetSearchQuery = (newQuery: string) => {
    setSearchQuery(newQuery);
  };

  return {
    places,
    isLoading,
    error,
    page,
    total,
    hasMore,
    category,
    searchQuery,
    setCategory: handleSetCategory,
    setSearchQuery: handleSetSearchQuery,
    loadMore,
  };
};