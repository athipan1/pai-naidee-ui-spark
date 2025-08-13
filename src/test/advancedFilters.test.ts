// Tests for advanced filters functionality

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  applyAdvancedFilters,
  parseFilterQuery,
  filtersToQueryString,
  validateFilters
} from '../search/filters/advancedFilters';
import type { AdvancedSearchFilters } from '../search/filters/advancedFilters';

// Mock data for testing
const mockPosts = [
  {
    id: '1',
    caption: 'Beautiful temple in Bangkok',
    tags: ['temple', 'culture', 'bangkok'],
    createdAt: '2024-01-15T10:00:00Z',
    mediaUrls: ['image1.jpg', 'image2.jpg'],
    locationId: 'loc1',
    location: { name: 'Wat Pho', province: 'Bangkok' }
  },
  {
    id: '2',
    caption: 'Amazing beach sunset',
    tags: ['beach', 'sunset', 'nature'],
    createdAt: '2024-01-10T15:30:00Z',
    mediaUrls: [],
    locationId: 'loc2',
    location: { name: 'Patong Beach', province: 'Phuket' }
  },
  {
    id: '3',
    caption: 'Mountain hiking adventure',
    tags: ['mountain', 'hiking', 'adventure'],
    createdAt: '2024-02-01T08:00:00Z',
    mediaUrls: ['video1.mp4'],
    locationId: 'loc3',
    location: { name: 'Doi Suthep', province: 'Chiang Mai' }
  }
];

const mockLocations = [
  {
    id: 'loc1',
    name: 'Wat Pho',
    nameLocal: 'วัดโพธิ์',
    category: 'temple',
    province: 'Bangkok',
    rating: 4.8,
    tags: ['temple', 'culture', 'historic']
  },
  {
    id: 'loc2',
    name: 'Patong Beach',
    nameLocal: 'หาดป่าตอง',
    category: 'beach',
    province: 'Phuket',
    rating: 4.2,
    tags: ['beach', 'swimming', 'nightlife']
  },
  {
    id: 'loc3',
    name: 'Doi Suthep',
    nameLocal: 'ดอยสุเทพ',
    category: 'mountain',
    province: 'Chiang Mai',
    rating: 4.9,
    tags: ['mountain', 'temple', 'viewpoint']
  }
];

describe('Advanced Filters', () => {
  beforeEach(() => {
    // Mock console to avoid noise during tests
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  describe('applyAdvancedFilters', () => {
    it('should return all results when no filters applied', () => {
      const result = applyAdvancedFilters(mockPosts, {});
      
      expect(result.results).toHaveLength(3);
      expect(result.appliedFilters).toHaveLength(0);
      expect(result.filteredCount).toBe(3);
      expect(result.totalCount).toBe(3);
    });

    it('should filter by category', () => {
      const filters: AdvancedSearchFilters = {
        category: ['temple']
      };
      
      const result = applyAdvancedFilters(mockLocations, filters);
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('loc1');
      expect(result.appliedFilters).toContain('category');
    });

    it('should filter by date range', () => {
      const filters: AdvancedSearchFilters = {
        dateRange: {
          start: new Date('2024-01-12T00:00:00Z'),
          end: new Date('2024-01-20T00:00:00Z')
        }
      };
      
      const result = applyAdvancedFilters(mockPosts, filters);
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('1');
      expect(result.appliedFilters).toContain('dateRange');
    });

    it('should filter by media presence', () => {
      const filtersWithMedia: AdvancedSearchFilters = {
        hasMedia: true
      };
      
      const resultWithMedia = applyAdvancedFilters(mockPosts, filtersWithMedia);
      
      expect(resultWithMedia.results).toHaveLength(2);
      expect(resultWithMedia.results.map(r => r.id)).toEqual(['1', '3']);
      
      const filtersWithoutMedia: AdvancedSearchFilters = {
        hasMedia: false
      };
      
      const resultWithoutMedia = applyAdvancedFilters(mockPosts, filtersWithoutMedia);
      
      expect(resultWithoutMedia.results).toHaveLength(1);
      expect(resultWithoutMedia.results[0].id).toBe('2');
    });

    it('should filter by location ID', () => {
      const filters: AdvancedSearchFilters = {
        locationId: 'loc2'
      };
      
      const result = applyAdvancedFilters(mockPosts, filters);
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('2');
      expect(result.appliedFilters).toContain('location');
    });

    it('should filter by minimum rating', () => {
      const filters: AdvancedSearchFilters = {
        minRating: 4.5
      };
      
      const result = applyAdvancedFilters(mockLocations, filters);
      
      expect(result.results).toHaveLength(2);
      expect(result.results.map(r => r.id)).toEqual(['loc1', 'loc3']);
      expect(result.appliedFilters).toContain('rating');
    });

    it('should filter by tags', () => {
      const filters: AdvancedSearchFilters = {
        tags: ['temple']
      };
      
      const result = applyAdvancedFilters(mockLocations, filters);
      
      expect(result.results).toHaveLength(2);
      expect(result.results.map(r => r.id)).toEqual(['loc1', 'loc3']);
      expect(result.appliedFilters).toContain('tags');
    });

    it('should filter by province', () => {
      const filters: AdvancedSearchFilters = {
        province: 'Bangkok'
      };
      
      const result = applyAdvancedFilters(mockPosts, filters);
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('1');
      expect(result.appliedFilters).toContain('province');
    });

    it('should apply multiple filters simultaneously', () => {
      const filters: AdvancedSearchFilters = {
        hasMedia: true,
        province: 'Bangkok'
      };
      
      const result = applyAdvancedFilters(mockPosts, filters);
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('1');
      expect(result.appliedFilters).toContain('hasMedia');
      expect(result.appliedFilters).toContain('province');
    });

    it('should apply result limit', () => {
      const filters: AdvancedSearchFilters = {
        maxResults: 2
      };
      
      const result = applyAdvancedFilters(mockPosts, filters);
      
      expect(result.results).toHaveLength(2);
      expect(result.appliedFilters).toContain('limit');
    });

    it('should handle empty input gracefully', () => {
      const result = applyAdvancedFilters([], { category: ['temple'] });
      
      expect(result.results).toHaveLength(0);
      expect(result.filteredCount).toBe(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('parseFilterQuery', () => {
    it('should parse category filter', () => {
      const queryString = 'category=temple,beach';
      const filters = parseFilterQuery(queryString);
      
      expect(filters.category).toEqual(['temple', 'beach']);
    });

    it('should parse date range filter', () => {
      const queryString = 'dateStart=2024-01-01T00:00:00Z&dateEnd=2024-01-31T23:59:59Z';
      const filters = parseFilterQuery(queryString);
      
      expect(filters.dateRange).toBeDefined();
      expect(filters.dateRange!.start).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(filters.dateRange!.end).toEqual(new Date('2024-01-31T23:59:59Z'));
    });

    it('should parse media filter', () => {
      const queryString = 'hasMedia=true';
      const filters = parseFilterQuery(queryString);
      
      expect(filters.hasMedia).toBe(true);
    });

    it('should parse radius filter', () => {
      const queryString = 'radius=50';
      const filters = parseFilterQuery(queryString);
      
      expect(filters.radiusKm).toBe(50);
    });

    it('should parse multiple filters', () => {
      const queryString = 'category=temple&hasMedia=false&minRating=4.0&language=th';
      const filters = parseFilterQuery(queryString);
      
      expect(filters.category).toEqual(['temple']);
      expect(filters.hasMedia).toBe(false);
      expect(filters.minRating).toBe(4.0);
      expect(filters.language).toBe('th');
    });

    it('should handle empty query string', () => {
      const filters = parseFilterQuery('');
      
      expect(Object.keys(filters)).toHaveLength(0);
    });
  });

  describe('filtersToQueryString', () => {
    it('should convert filters to query string', () => {
      const filters: AdvancedSearchFilters = {
        category: ['temple', 'beach'],
        hasMedia: true,
        minRating: 4.5,
        language: 'th'
      };
      
      const queryString = filtersToQueryString(filters);
      const params = new URLSearchParams(queryString);
      
      expect(params.get('category')).toBe('temple,beach');
      expect(params.get('hasMedia')).toBe('true');
      expect(params.get('minRating')).toBe('4.5');
      expect(params.get('language')).toBe('th');
    });

    it('should handle date range conversion', () => {
      const filters: AdvancedSearchFilters = {
        dateRange: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };
      
      const queryString = filtersToQueryString(filters);
      const params = new URLSearchParams(queryString);
      
      expect(params.get('dateStart')).toBe('2024-01-01T00:00:00.000Z');
      expect(params.get('dateEnd')).toBe('2024-01-31T23:59:59.000Z');
    });

    it('should handle empty filters', () => {
      const queryString = filtersToQueryString({});
      
      expect(queryString).toBe('');
    });
  });

  describe('validateFilters', () => {
    it('should validate correct filters', () => {
      const filters: AdvancedSearchFilters = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        },
        radiusKm: 50,
        minRating: 4.0
      };
      
      const validation = validateFilters(filters);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid date range', () => {
      const filters: AdvancedSearchFilters = {
        dateRange: {
          start: new Date('2024-01-31'),
          end: new Date('2024-01-01') // End before start
        }
      };
      
      const validation = validateFilters(filters);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Date range start must be before end');
    });

    it('should reject invalid radius', () => {
      const filters: AdvancedSearchFilters = {
        radiusKm: -10 // Negative radius
      };
      
      const validation = validateFilters(filters);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Radius must be between 0 and 1000 km');
    });

    it('should reject invalid rating', () => {
      const filters: AdvancedSearchFilters = {
        minRating: 6.0 // Rating > 5
      };
      
      const validation = validateFilters(filters);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Rating must be between 0 and 5');
    });

    it('should collect multiple validation errors', () => {
      const filters: AdvancedSearchFilters = {
        radiusKm: -10,
        minRating: 6.0
      };
      
      const validation = validateFilters(filters);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(2);
    });
  });

  describe('Integration', () => {
    it('should support round-trip filter serialization', () => {
      const originalFilters: AdvancedSearchFilters = {
        category: ['temple', 'beach'],
        hasMedia: true,
        minRating: 4.0,
        language: 'th',
        tags: ['culture', 'nature']
      };
      
      const queryString = filtersToQueryString(originalFilters);
      const parsedFilters = parseFilterQuery(queryString);
      
      expect(parsedFilters.category).toEqual(originalFilters.category);
      expect(parsedFilters.hasMedia).toBe(originalFilters.hasMedia);
      expect(parsedFilters.minRating).toBe(originalFilters.minRating);
      expect(parsedFilters.language).toBe(originalFilters.language);
      expect(parsedFilters.tags).toEqual(originalFilters.tags);
    });
  });
});