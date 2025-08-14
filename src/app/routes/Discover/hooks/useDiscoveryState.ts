import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type DiscoveryMode = 'feed' | 'category' | 'search' | 'map' | 'trending';

export interface DiscoveryState {
  mode: DiscoveryMode;
  query: string;
  category: string;
  selectedAttractionId?: string;
  filters: {
    priceRange: string;
    maxDistance: number;
    categories: string[];
    minRating: number;
    sortBy: string;
  };
}

export const useDiscoveryState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse URL parameters to determine discovery state
  const [state, setState] = useState<DiscoveryState>(() => {
    const mode = (searchParams.get('mode') as DiscoveryMode) || 'feed';
    const query = searchParams.get('q') || '';
    const category = searchParams.get('cat') || searchParams.get('category') || '';
    const selectedAttractionId = searchParams.get('id') || undefined;
    
    return {
      mode,
      query,
      category,
      selectedAttractionId,
      filters: {
        priceRange: searchParams.get('price') || 'all',
        maxDistance: parseInt(searchParams.get('distance') || '50'),
        categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
        minRating: parseFloat(searchParams.get('rating') || '0'),
        sortBy: searchParams.get('sort') || 'relevance'
      }
    };
  });

  // Update URL when state changes
  const updateState = (newState: Partial<DiscoveryState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    
    // Update URL parameters
    const newParams = new URLSearchParams();
    
    if (updatedState.mode !== 'feed') {
      newParams.set('mode', updatedState.mode);
    }
    
    if (updatedState.query) {
      newParams.set('q', updatedState.query);
    }
    
    if (updatedState.category) {
      newParams.set('cat', updatedState.category);
    }
    
    if (updatedState.selectedAttractionId) {
      newParams.set('id', updatedState.selectedAttractionId);
    }
    
    // Only include filter params if they're not default values
    if (updatedState.filters.priceRange !== 'all') {
      newParams.set('price', updatedState.filters.priceRange);
    }
    
    if (updatedState.filters.maxDistance !== 50) {
      newParams.set('distance', updatedState.filters.maxDistance.toString());
    }
    
    if (updatedState.filters.categories.length > 0) {
      newParams.set('categories', updatedState.filters.categories.join(','));
    }
    
    if (updatedState.filters.minRating > 0) {
      newParams.set('rating', updatedState.filters.minRating.toString());
    }
    
    if (updatedState.filters.sortBy !== 'relevance') {
      newParams.set('sort', updatedState.filters.sortBy);
    }
    
    setSearchParams(newParams);
  };

  // Helper functions for common state updates
  const setMode = (mode: DiscoveryMode) => updateState({ mode });
  
  const setQuery = (query: string) => updateState({ query, mode: query ? 'search' : 'feed' });
  
  const setCategory = (category: string) => updateState({ category, mode: category ? 'category' : 'feed' });
  
  const setSelectedAttraction = (id: string | undefined) => updateState({ selectedAttractionId: id });
  
  const updateFilters = (filters: Partial<DiscoveryState['filters']>) => {
    updateState({
      filters: { ...state.filters, ...filters }
    });
  };

  // Reset to feed mode
  const resetToFeed = () => {
    updateState({
      mode: 'feed',
      query: '',
      category: '',
      selectedAttractionId: undefined,
      filters: {
        priceRange: 'all',
        maxDistance: 50,
        categories: [],
        minRating: 0,
        sortBy: 'relevance'
      }
    });
  };

  return {
    state,
    updateState,
    setMode,
    setQuery,
    setCategory,
    setSelectedAttraction,
    updateFilters,
    resetToFeed
  };
};