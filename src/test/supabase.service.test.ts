import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Define mock functions at the top level
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockLimit = vi.fn();
const mockOr = vi.fn();
const mockRange = vi.fn();

// Mock the entire '@supabase/supabase-js' library
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: (...args) => mockFrom(...args),
  })),
}));

// Import the actual service functions after setting up the mocks
import {
  getPlacesByCategory,
  getPlaceById,
  searchPlaces,
  isSupabaseConfigured,
} from '@/services/supabase.service';

describe('Supabase Service', () => {
  beforeEach(() => {
    // Reset all mock function calls before each test
    vi.clearAllMocks();

    const queryBuilderMock = {
      select: mockSelect,
      eq: mockEq,
      or: mockOr,
      range: mockRange,
      limit: mockLimit,
      single: mockSingle,
    };

    // Make all chainable methods return the same builder mock
    mockFrom.mockReturnValue(queryBuilderMock);
    mockSelect.mockReturnValue(queryBuilderMock);
    mockOr.mockReturnValue(queryBuilderMock);
    mockEq.mockReturnValue(queryBuilderMock);

    // Mock the final resolution methods
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 });
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockSingle.mockResolvedValue({ data: null, error: null });

    // Stub environment variables
    vi.stubEnv('VITE_SUPABASE_URL', 'https://mock-url.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('isSupabaseConfigured', () => {
    it('should return true when URL and key are valid', () => {
      expect(isSupabaseConfigured()).toBe(true);
    });

    it('should return false if URL is a placeholder', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://your-project.supabase.co');
      expect(isSupabaseConfigured()).toBe(false);
    });
  });

  describe('getPlacesByCategory', () => {
    it('should fetch places for a given category', async () => {
      const mockPlaces = [{ id: '1', name: 'Test Place' }];
      mockLimit.mockResolvedValueOnce({ data: mockPlaces, error: null });

      await getPlacesByCategory('Test Category');

      expect(mockFrom).toHaveBeenCalledWith('places');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('category', 'Test Category');
      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('should throw an error if the query fails', async () => {
      const errorMessage = 'DB Error';
      mockLimit.mockResolvedValueOnce({ data: null, error: { message: errorMessage } });
      await expect(getPlacesByCategory('Error')).rejects.toThrow(errorMessage);
    });
  });

  describe('getPlaceById', () => {
    it('should fetch a place by its ID', async () => {
      const mockPlace = { id: '1', name: 'Test Place' };
      mockSingle.mockResolvedValueOnce({ data: mockPlace, error: null });

      await getPlaceById('1');

      expect(mockFrom).toHaveBeenCalledWith('places');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(mockSingle).toHaveBeenCalled();
    });

    it('should throw an error if the place is not found', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: null });
      await expect(getPlaceById('not-found')).rejects.toThrow('Place not found');
    });
  });

  describe('searchPlaces', () => {
    it('should search with a term and filters', async () => {
      const mockResults = [{ id: '1', name: 'Filtered Place' }];
      mockRange.mockResolvedValueOnce({ data: mockResults, count: 1, error: null });

      const result = await searchPlaces('Filtered', ['Category1'], ['Province1'], 10, 1);

      expect(mockFrom).toHaveBeenCalledWith('places');
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(mockOr).toHaveBeenCalledWith('category.eq.Category1');
      expect(mockOr).toHaveBeenCalledWith('province.eq.Province1');
      expect(mockOr).toHaveBeenCalledWith(
        'name.ilike.%Filtered%,name_local.ilike.%Filtered%,description.ilike.%Filtered%'
      );
      expect(mockRange).toHaveBeenCalledWith(0, 9);
      expect(result.results).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });

    it('should return empty results if no places match', async () => {
      mockRange.mockResolvedValueOnce({ data: [], count: 0, error: null });
      const result = await searchPlaces('no-match');
      expect(result.results).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });
});