// Advanced filters for Phase 2 contextual search

import type { Post, Location } from '@/shared/types/posts';
import { log } from '@/shared/utils/logger';

export interface AdvancedSearchFilters {
  category?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasMedia?: boolean;
  radiusKm?: number;
  locationId?: string;
  minRating?: number;
  maxResults?: number;
  language?: 'th' | 'en';
  tags?: string[];
  province?: string;
}

export interface FilteredSearchResults<T> {
  results: T[];
  appliedFilters: string[];
  filteredCount: number;
  totalCount: number;
}

/**
 * Apply advanced filters to search results
 */
export function applyAdvancedFilters<T extends Post | Location>(
  results: T[],
  filters: AdvancedSearchFilters
): FilteredSearchResults<T> {
  if (!results || results.length === 0) {
    return {
      results: [],
      appliedFilters: [],
      filteredCount: 0,
      totalCount: 0
    };
  }

  const appliedFilters: string[] = [];
  let filteredResults = [...results];
  const originalCount = results.length;

  log.filters.debug('Applying advanced filters', { 
    originalCount, 
    filters: Object.keys(filters).filter(key => filters[key as keyof AdvancedSearchFilters] !== undefined)
  });

  // Category filter
  if (filters.category && filters.category.length > 0) {
    filteredResults = filteredResults.filter(item => {
      if ('category' in item) {
        return filters.category!.includes(item.category);
      }
      return true;
    });
    appliedFilters.push('category');
    log.filters.debug('Applied category filter', { 
      categories: filters.category, 
      remaining: filteredResults.length 
    });
  }

  // Date range filter (for posts)
  if (filters.dateRange) {
    filteredResults = filteredResults.filter(item => {
      if ('createdAt' in item) {
        const itemDate = new Date(item.createdAt);
        return itemDate >= filters.dateRange!.start && itemDate <= filters.dateRange!.end;
      }
      return true;
    });
    appliedFilters.push('dateRange');
    log.filters.debug('Applied date range filter', { 
      range: filters.dateRange, 
      remaining: filteredResults.length 
    });
  }

  // Media filter (for posts)
  if (filters.hasMedia !== undefined) {
    filteredResults = filteredResults.filter(item => {
      if ('mediaUrls' in item) {
        const hasMedia = item.mediaUrls && item.mediaUrls.length > 0;
        return filters.hasMedia ? hasMedia : !hasMedia;
      }
      return true;
    });
    appliedFilters.push('hasMedia');
    log.filters.debug('Applied media filter', { 
      hasMedia: filters.hasMedia, 
      remaining: filteredResults.length 
    });
  }

  // Location radius filter
  if (filters.radiusKm && filters.locationId) {
    // This would require geographical calculations
    // For now, it's a stub implementation
    log.filters.debug('Radius filter requested but not fully implemented', {
      radiusKm: filters.radiusKm,
      locationId: filters.locationId
    });
    appliedFilters.push('radius');
  }

  // Specific location filter
  if (filters.locationId) {
    filteredResults = filteredResults.filter(item => {
      if ('locationId' in item) {
        return item.locationId === filters.locationId;
      }
      if ('id' in item && item.id === filters.locationId) {
        return true;
      }
      return false;
    });
    appliedFilters.push('location');
    log.filters.debug('Applied location filter', { 
      locationId: filters.locationId, 
      remaining: filteredResults.length 
    });
  }

  // Rating filter (for locations)
  if (filters.minRating !== undefined) {
    filteredResults = filteredResults.filter(item => {
      if ('rating' in item) {
        return item.rating >= filters.minRating!;
      }
      return true;
    });
    appliedFilters.push('rating');
    log.filters.debug('Applied rating filter', { 
      minRating: filters.minRating, 
      remaining: filteredResults.length 
    });
  }

  // Language filter
  if (filters.language) {
    filteredResults = filteredResults.filter(item => {
      // For posts, we could analyze the caption language
      // For locations, check if they have local names
      if ('nameLocal' in item) {
        // If looking for Thai and item has local name, include it
        // If looking for English and item doesn't have local name, include it
        const hasLocalName = Boolean(item.nameLocal);
        return filters.language === 'th' ? hasLocalName : !hasLocalName;
      }
      return true;
    });
    appliedFilters.push('language');
    log.filters.debug('Applied language filter', { 
      language: filters.language, 
      remaining: filteredResults.length 
    });
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filteredResults = filteredResults.filter(item => {
      if ('tags' in item && item.tags) {
        // Check if item has any of the specified tags
        return filters.tags!.some(filterTag => 
          item.tags.some(itemTag => 
            itemTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        );
      }
      return false;
    });
    appliedFilters.push('tags');
    log.filters.debug('Applied tags filter', { 
      tags: filters.tags, 
      remaining: filteredResults.length 
    });
  }

  // Province filter
  if (filters.province) {
    filteredResults = filteredResults.filter(item => {
      if ('province' in item) {
        return item.province?.toLowerCase().includes(filters.province!.toLowerCase());
      }
      if ('location' in item && item.location?.province) {
        return item.location.province.toLowerCase().includes(filters.province!.toLowerCase());
      }
      return false;
    });
    appliedFilters.push('province');
    log.filters.debug('Applied province filter', { 
      province: filters.province, 
      remaining: filteredResults.length 
    });
  }

  // Limit results
  if (filters.maxResults && filters.maxResults > 0) {
    filteredResults = filteredResults.slice(0, filters.maxResults);
    appliedFilters.push('limit');
  }

  const result = {
    results: filteredResults,
    appliedFilters,
    filteredCount: filteredResults.length,
    totalCount: originalCount
  };

  log.filters.info('Advanced filters applied', {
    originalCount,
    filteredCount: result.filteredCount,
    appliedFilters: result.appliedFilters
  });

  return result;
}

/**
 * Parse filter query string into AdvancedSearchFilters
 */
export function parseFilterQuery(queryString: string): AdvancedSearchFilters {
  const filters: AdvancedSearchFilters = {};
  
  // Simple parsing - in a real implementation, this would be more sophisticated
  const params = new URLSearchParams(queryString);
  
  // Category filter
  const category = params.get('category');
  if (category) {
    filters.category = category.split(',').map(c => c.trim());
  }
  
  // Date range filter
  const dateStart = params.get('dateStart');
  const dateEnd = params.get('dateEnd');
  if (dateStart && dateEnd) {
    filters.dateRange = {
      start: new Date(dateStart),
      end: new Date(dateEnd)
    };
  }
  
  // Media filter
  const hasMedia = params.get('hasMedia');
  if (hasMedia !== null) {
    filters.hasMedia = hasMedia === 'true';
  }
  
  // Radius filter
  const radius = params.get('radius');
  if (radius) {
    filters.radiusKm = parseFloat(radius);
  }
  
  // Location filter
  const locationId = params.get('locationId');
  if (locationId) {
    filters.locationId = locationId;
  }
  
  // Rating filter
  const minRating = params.get('minRating');
  if (minRating) {
    filters.minRating = parseFloat(minRating);
  }
  
  // Language filter
  const language = params.get('language');
  if (language === 'th' || language === 'en') {
    filters.language = language;
  }
  
  // Tags filter
  const tags = params.get('tags');
  if (tags) {
    filters.tags = tags.split(',').map(t => t.trim());
  }
  
  // Province filter
  const province = params.get('province');
  if (province) {
    filters.province = province;
  }

  log.filters.debug('Parsed filter query', { queryString, filters });
  
  return filters;
}

/**
 * Convert AdvancedSearchFilters to query string
 */
export function filtersToQueryString(filters: AdvancedSearchFilters): string {
  const params = new URLSearchParams();
  
  if (filters.category && filters.category.length > 0) {
    params.set('category', filters.category.join(','));
  }
  
  if (filters.dateRange) {
    params.set('dateStart', filters.dateRange.start.toISOString());
    params.set('dateEnd', filters.dateRange.end.toISOString());
  }
  
  if (filters.hasMedia !== undefined) {
    params.set('hasMedia', filters.hasMedia.toString());
  }
  
  if (filters.radiusKm) {
    params.set('radius', filters.radiusKm.toString());
  }
  
  if (filters.locationId) {
    params.set('locationId', filters.locationId);
  }
  
  if (filters.minRating) {
    params.set('minRating', filters.minRating.toString());
  }
  
  if (filters.language) {
    params.set('language', filters.language);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }
  
  if (filters.province) {
    params.set('province', filters.province);
  }
  
  return params.toString();
}

/**
 * Validate filter values
 */
export function validateFilters(filters: AdvancedSearchFilters): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Date range validation
  if (filters.dateRange) {
    if (filters.dateRange.start > filters.dateRange.end) {
      errors.push('Date range start must be before end');
    }
    
    const now = new Date();
    if (filters.dateRange.end > now) {
      errors.push('Date range end cannot be in the future');
    }
  }
  
  // Radius validation
  if (filters.radiusKm !== undefined) {
    if (filters.radiusKm < 0 || filters.radiusKm > 1000) {
      errors.push('Radius must be between 0 and 1000 km');
    }
  }
  
  // Rating validation
  if (filters.minRating !== undefined) {
    if (filters.minRating < 0 || filters.minRating > 5) {
      errors.push('Rating must be between 0 and 5');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}