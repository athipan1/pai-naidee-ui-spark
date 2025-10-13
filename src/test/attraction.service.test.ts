import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attractionService } from '@/services/attraction.service';
import { getPlaceById, searchPlaces } from '@/services/supabase.service';

// Mock the supabase service functions
vi.mock('@/services/supabase.service', () => ({
  getPlaceById: vi.fn(),
  searchPlaces: vi.fn(),
}));

// Cast the mocked functions to be used in tests
const mockedGetPlaceById = getPlaceById as vi.Mock;
const mockedSearchPlaces = searchPlaces as vi.Mock;

describe('Attraction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAttractionDetail', () => {
    it('should call getPlaceById with the correct ID', async () => {
      const mockAttraction = { id: '1', name: 'Test Attraction' };
      mockedGetPlaceById.mockResolvedValue(mockAttraction);

      const result = await attractionService.getAttractionDetail('1');

      expect(mockedGetPlaceById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockAttraction);
    });

    it('should throw an error if getPlaceById fails', async () => {
      const errorMessage = 'Supabase error';
      mockedGetPlaceById.mockRejectedValue(new Error(errorMessage));

      await expect(attractionService.getAttractionDetail('1')).rejects.toThrow(
        `Failed to fetch attraction details. ${errorMessage}`
      );
    });
  });

  describe('getAttractions', () => {
    it('should call searchPlaces with default options', async () => {
      const mockResponse = { results: [], totalCount: 0 };
      mockedSearchPlaces.mockResolvedValue(mockResponse);

      const result = await attractionService.getAttractions();

      expect(mockedSearchPlaces).toHaveBeenCalledWith('', [], [], 10, 1);
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
      mockedSearchPlaces.mockResolvedValue(mockResponse);

      const options = {
        page: 2,
        limit: 5,
        category: 'Temples',
        search: 'Wat',
      };
      const result = await attractionService.getAttractions(options);

      expect(mockedSearchPlaces).toHaveBeenCalledWith('Wat', ['Temples'], [], 5, 2);
      expect(result).toEqual({
        attractions: mockAttractions,
        total: 1,
        page: 2,
        limit: 5,
      });
    });

    it('should throw an error if searchPlaces fails', async () => {
      const errorMessage = 'Search failed';
      mockedSearchPlaces.mockRejectedValue(new Error(errorMessage));

      await expect(attractionService.getAttractions()).rejects.toThrow(
        `Failed to fetch attractions. ${errorMessage}`
      );
    });
  });

  describe('getLegacyAttractions', () => {
    it('should call searchPlaces with an empty search term', async () => {
      const mockAttractions = [{ id: '1', name: 'Legacy Attraction' }];
      const mockResponse = { results: mockAttractions, totalCount: 1 };
      mockedSearchPlaces.mockResolvedValue(mockResponse);

      const result = await attractionService.getLegacyAttractions();

      expect(mockedSearchPlaces).toHaveBeenCalledWith('');
      expect(result).toEqual(mockAttractions);
    });

    it('should throw an error if searchPlaces fails', async () => {
      const errorMessage = 'Legacy fetch failed';
      mockedSearchPlaces.mockRejectedValue(new Error(errorMessage));

      await expect(attractionService.getLegacyAttractions()).rejects.toThrow(
        `Failed to fetch attractions from Supabase. ${errorMessage}`
      );
    });
  });
});