import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attractionService } from '@/services/attraction.service';
import { supabase } from '@/services/supabase.service';

// Mock the entire supabase service
vi.mock('@/services/supabase.service', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
  ensureAuthenticated: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true), // Mock this function to return true
}));

// Import the mocked functions after the mock is defined
import { ensureAuthenticated, isSupabaseConfigured } from '@/services/supabase.service';

// Cast the mocked functions to be used in tests
const mockedInvoke = supabase.functions.invoke as vi.Mock;
const mockedEnsureAuthenticated = ensureAuthenticated as vi.Mock;

describe('Attraction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAttractionDetail', () => {
    it('should call the getAttractionDetail Edge Function with the correct ID', async () => {
      const mockAttraction = { id: '1', name: 'Test Attraction' };
      mockedInvoke.mockResolvedValue({ data: mockAttraction, error: null });

      const result = await attractionService.getAttractionDetail('1');

      expect(mockedEnsureAuthenticated).toHaveBeenCalled();
      expect(mockedInvoke).toHaveBeenCalledWith('getAttractionDetail', {
        body: { id: '1' },
      });
      expect(result).toEqual(mockAttraction);
    });

    it('should throw an error if the Edge Function returns an error', async () => {
      const errorMessage = 'Edge Function error';
      mockedInvoke.mockResolvedValue({ data: null, error: new Error(errorMessage) });

      await expect(attractionService.getAttractionDetail('1')).rejects.toThrow(
        `Failed to fetch attraction details. ${errorMessage}`
      );
    });

    it('should throw an error if the Edge Function returns no data', async () => {
        mockedInvoke.mockResolvedValue({ data: null, error: null });

        await expect(attractionService.getAttractionDetail('1')).rejects.toThrow(
          `Failed to fetch attraction details. Attraction not found.`
        );
      });
  });

  describe('getAttractions', () => {
    it('should call the getAttractions Edge Function with no options', async () => {
      const mockResponse = { attractions: [], total: 0, page: 1, limit: 10 };
      mockedInvoke.mockResolvedValue({ data: mockResponse, error: null });

      const result = await attractionService.getAttractions();

      expect(mockedEnsureAuthenticated).toHaveBeenCalled();
      expect(mockedInvoke).toHaveBeenCalledWith('getAttractions', {
        body: {},
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call the getAttractions Edge Function with provided options', async () => {
      const mockAttractions = [{ id: '1', name: 'Searched Attraction' }];
      const mockResponse = { attractions: mockAttractions, total: 1, page: 2, limit: 5 };
      mockedInvoke.mockResolvedValue({ data: mockResponse, error: null });

      const options = {
        page: 2,
        limit: 5,
        category: 'Temples',
        search: 'Wat',
      };
      const result = await attractionService.getAttractions(options);

      expect(mockedInvoke).toHaveBeenCalledWith('getAttractions', {
        body: options,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the Edge Function returns an error', async () => {
      const errorMessage = 'Search failed';
      mockedInvoke.mockResolvedValue({ data: null, error: new Error(errorMessage) });

      await expect(attractionService.getAttractions()).rejects.toThrow(
        `Failed to fetch attractions. ${errorMessage}`
      );
    });
  });

  describe('getLegacyAttractions', () => {
    it('should call getAttractions with page and limit', async () => {
      const mockAttractions = [{ id: '1', name: 'Legacy Attraction' }];
      const mockResponse = { attractions: mockAttractions, total: 1, page: 1, limit: 100 };
      mockedInvoke.mockResolvedValue({ data: mockResponse, error: null });

      const result = await attractionService.getLegacyAttractions();

      expect(mockedInvoke).toHaveBeenCalledWith('getAttractions', {
        body: { page: 1, limit: 100 },
      });
      expect(result).toEqual(mockAttractions);
    });

    it('should throw an error if the Edge Function fails', async () => {
        const errorMessage = 'Legacy fetch failed';
        mockedInvoke.mockResolvedValue({ data: null, error: new Error(errorMessage) });

        await expect(attractionService.getLegacyAttractions()).rejects.toThrow(
          `Failed to fetch attractions. ${errorMessage}`
        );
      });
  });
});