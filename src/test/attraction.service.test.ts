import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { attractionService } from '@/services/attraction.service';
import { Attraction, AttractionDetail } from '@/shared/types/attraction';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Attraction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAttractions', () => {
    it('should fetch attractions successfully', async () => {
      const mockAttractions: Attraction[] = [{ id: '1', name: 'Test Attraction', province: 'Test Province', image_url: '', description: '', created_at: '' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ attractions: mockAttractions }),
      });

      const attractions = await attractionService.getAttractions();
      expect(attractions).toEqual(mockAttractions);
      expect(mockFetch).toHaveBeenCalledWith(`${supabaseUrl}/functions/v1/getAttractions`, expect.any(Object));
    });

    it('should throw an error if fetch fails', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(attractionService.getAttractions()).rejects.toThrow('Failed to fetch attractions. HTTP error! status: 500');
    });
  });

  describe('addAttraction', () => {
    it('should add an attraction successfully', async () => {
      const newAttraction: Omit<Attraction, 'id' | 'created_at'> = { name: 'New Attraction', province: 'New Province', image_url: '', description: '' };
      const mockAttraction: Attraction = { id: '2', ...newAttraction, created_at: new Date().toISOString() };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ attraction: mockAttraction }),
      });

      const result = await attractionService.addAttraction(newAttraction);
      expect(result).toEqual(mockAttraction);
      expect(mockFetch).toHaveBeenCalledWith(`${supabaseUrl}/functions/v1/addAttraction`, expect.objectContaining({ method: 'POST' }));
    });
  });

  describe('updateAttraction', () => {
    it('should update an attraction successfully', async () => {
        const attractionId = '1';
        const updates: Partial<Omit<Attraction, 'id' | 'created_at'>> = { name: 'Updated Attraction' };
        const mockUpdatedAttraction: Attraction = { id: attractionId, name: 'Updated Attraction', province: 'Test Province', image_url: '', description: '', created_at: new Date().toISOString() };

        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ attraction: mockUpdatedAttraction }),
        });

        const result = await attractionService.updateAttraction(attractionId, updates);

        expect(result).toEqual(mockUpdatedAttraction);
        expect(mockFetch).toHaveBeenCalledWith(`${supabaseUrl}/functions/v1/updateAttraction`, expect.objectContaining({ method: 'PUT' }));
    });
  });

  describe('deleteAttraction', () => {
    it('should delete an attraction successfully', async () => {
        const attractionId = '1';
        mockFetch.mockResolvedValue({
            ok: true,
        });

        await attractionService.deleteAttraction(attractionId);

        expect(mockFetch).toHaveBeenCalledWith(`${supabaseUrl}/functions/v1/deleteAttraction`, expect.objectContaining({ method: 'DELETE' }));
    });
  });

  describe('getAttractionDetail', () => {
    it('should return attraction details for a given id', async () => {
      const mockAttractions: Attraction[] = [
        { id: '1', name: 'Test Attraction 1', province: 'Province 1', image_url: '', description: '', created_at: '' },
        { id: '2', name: 'Test Attraction 2', province: 'Province 2', image_url: '', description: '', created_at: '' },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ attractions: mockAttractions }),
      });

      const result = await attractionService.getAttractionDetail('1');
      expect(result).toEqual(mockAttractions[0]);
    });

    it('should throw an error if attraction with id is not found', async () => {
        const mockAttractions: Attraction[] = [];
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ attractions: mockAttractions }),
        });

        await expect(attractionService.getAttractionDetail('1')).rejects.toThrow('Attraction with id 1 not found');
      });
  });
});