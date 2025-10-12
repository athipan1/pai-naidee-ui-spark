import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAttractionDetail,
  getAttractions,
  getLegacyAttractions,
} from '@/services/attraction.service';
import { getPlaceById, searchPlaces } from '@/services/supabase.service';

// Mock the supabase service functions
vi.mock('@/services/supabase.service', () => ({
  getPlaceById: vi.fn(),
  searchPlaces: vi.fn(),
}));

describe('Attraction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAttractionDetail', () => {
    it('should call getPlaceById with the correct ID', async () => {
      const mockAttraction = { id: '1', name: 'Test Attraction' };
      getPlaceById.mockResolvedValue(mockAttraction);

      const result = await getAttractionDetail('1');

      expect(getPlaceById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockAttraction);
    });

    it('should throw an error if getPlaceById fails', async () => {
      const errorMessage = 'Supabase error';
      getPlaceById.mockRejectedValue(new Error(errorMessage));

      await expect(getAttractionDetail('1')).rejects.toThrow(
        `Failed to fetch attraction details. ${errorMessage}`
      );
    });
  });

  describe('getAttractions', () => {
    it('should call searchPlaces with default options', async () => {
      const mockResponse = { results: [], totalCount: 0 };
      searchPlaces.mockResolvedValue(mockResponse);

      const result = await getAttractions();

      expect(searchPlaces).toHaveBeenCalledWith('', [], [], 10, 1);
      expect(result).toEqual({
        attractions: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it('should call searchPlaces with provided options', async () => {
      const mockAttractions = [{ id: '1', name: 'Searched Attraction' }];
      const mockResponse = { results: mockAttractions, totalCount: 1 };
      searchPlaces.mockResolvedValue(mockResponse);

      const options = {
        page: 2,
        limit: 5,
        category: 'Temples',
        search: 'Wat',
      };
      const result = await getAttractions(options);

      expect(searchPlaces).toHaveBeenCalledWith('Wat', ['Temples'], [], 5, 2);
      expect(result).toEqual({
        attractions: mockAttractions,
        total: 1,
        page: 2,
        limit: 5,
      });
    });

    it('should throw an error if searchPlaces fails', async () => {
      const errorMessage = 'Search failed';
      searchPlaces.mockRejectedValue(new Error(errorMessage));

      await expect(getAttractions()).rejects.toThrow(
        `Failed to fetch attractions. ${errorMessage}`
      );
    });
  });

  describe('getLegacyAttractions', () => {
    it('should call searchPlaces with an empty search term', async () => {
      const mockAttractions = [{ id: '1', name: 'Legacy Attraction' }];
      const mockResponse = { results: mockAttractions, totalCount: 1 };
      searchPlaces.mockResolvedValue(mockResponse);

      const result = await getLegacyAttractions();

      expect(searchPlaces).toHaveBeenCalledWith('');
      expect(result).toEqual(mockAttractions);
    });

    it('should throw an error if searchPlaces fails', async () => {
      const errorMessage = 'Legacy fetch failed';
      searchPlaces.mockRejectedValue(new Error(errorMessage));

      await expect(getLegacyAttractions()).rejects.toThrow(
        `Failed to fetch attractions from Supabase. ${errorMessage}`
      );
    });
  });
});