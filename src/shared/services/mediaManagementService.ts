// Media Management Service for handling place media operations
import type { MediaItem, MediaUploadData } from '../types/media';

export interface PlaceMediaData {
  placeId: string;
  placeName: string;
  placeNameLocal?: string;
  province: string;
  category: string;
  media: MediaItem[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  description?: string;
  tags?: string[];
}

export interface MediaReplacementResult {
  success: boolean;
  placeId: string;
  replacedMediaIds: string[];
  newMediaIds: string[];
  message: string;
}

export interface PlaceCreationResult {
  success: boolean;
  placeId: string;
  mediaIds: string[];
  message: string;
}

class MediaManagementService {
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  /**
   * Replace media for an existing place
   */
  async replaceMediaForPlace(
    placeId: string,
    newMedia: MediaUploadData[]
  ): Promise<MediaReplacementResult> {
    try {
      const formData = new FormData();
      
      // Add place ID
      formData.append('placeId', placeId);
      
      // Add media files and metadata
      newMedia.forEach((media, index) => {
        if (media.file) {
          formData.append(`media_${index}`, media.file);
        }
        formData.append(`metadata_${index}`, JSON.stringify({
          title: media.title,
          description: media.description,
          type: media.type
        }));
      });

      const response = await fetch(`${this.apiBaseUrl}/places/${placeId}/media/replace`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        placeId,
        replacedMediaIds: result.replacedMediaIds || [],
        newMediaIds: result.newMediaIds || [],
        message: result.message || 'Media replaced successfully'
      };

    } catch (error) {
      console.warn('API call failed, using mock response:', error);
      
      // Mock response for development
      await this.simulateDelay(1000);
      
      const mockMediaIds = newMedia.map((_, index) => `media_${Date.now()}_${index}`);
      
      return {
        success: true,
        placeId,
        replacedMediaIds: [`old_media_${placeId}_1`, `old_media_${placeId}_2`],
        newMediaIds: mockMediaIds,
        message: 'Media replaced successfully (mock response)'
      };
    }
  }

  /**
   * Add new place with media
   */
  async createPlaceWithMedia(
    placeData: Omit<PlaceMediaData, 'media'>,
    media: MediaUploadData[]
  ): Promise<PlaceCreationResult> {
    try {
      const formData = new FormData();
      
      // Add place data
      formData.append('placeData', JSON.stringify({
        placeName: placeData.placeName,
        placeNameLocal: placeData.placeNameLocal,
        province: placeData.province,
        category: placeData.category,
        coordinates: placeData.coordinates,
        description: placeData.description,
        tags: placeData.tags
      }));
      
      // Add media files and metadata
      media.forEach((mediaItem, index) => {
        if (mediaItem.file) {
          formData.append(`media_${index}`, mediaItem.file);
        }
        formData.append(`metadata_${index}`, JSON.stringify({
          title: mediaItem.title,
          description: mediaItem.description,
          type: mediaItem.type
        }));
      });

      const response = await fetch(`${this.apiBaseUrl}/places`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        placeId: result.placeId,
        mediaIds: result.mediaIds || [],
        message: result.message || 'Place created successfully'
      };

    } catch (error) {
      console.warn('API call failed, using mock response:', error);
      
      // Mock response for development
      await this.simulateDelay(1500);
      
      const mockPlaceId = `place_${Date.now()}`;
      const mockMediaIds = media.map((_, index) => `media_${Date.now()}_${index}`);
      
      return {
        success: true,
        placeId: mockPlaceId,
        mediaIds: mockMediaIds,
        message: 'Place created successfully (mock response)'
      };
    }
  }

  /**
   * Check if place exists
   */
  async checkPlaceExists(placeName: string, province?: string): Promise<{
    exists: boolean;
    placeId?: string;
    place?: PlaceMediaData;
  }> {
    try {
      const searchParams = new URLSearchParams({
        name: placeName,
        ...(province && { province })
      });

      const response = await fetch(`${this.apiBaseUrl}/places/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.places && result.places.length > 0) {
        return {
          exists: true,
          placeId: result.places[0].id,
          place: result.places[0]
        };
      }

      return { exists: false };

    } catch (error) {
      console.warn('API call failed, using mock response:', error);
      
      // Mock response for development
      await this.simulateDelay(500);
      
      // Simulate some existing places
      const mockExistingPlaces = [
        'วัดพระแก้ว', 'หมู่เกาะพีพี', 'ดอยอินทนนท์',
        'Temple of the Emerald Buddha', 'Phi Phi Islands', 'Doi Inthanon'
      ];
      
      const exists = mockExistingPlaces.some(place => 
        place.toLowerCase().includes(placeName.toLowerCase())
      );
      
      if (exists) {
        return {
          exists: true,
          placeId: `mock_place_${Date.now()}`,
          place: {
            placeId: `mock_place_${Date.now()}`,
            placeName,
            province: province || 'Mock Province',
            category: 'Mock Category',
            media: []
          }
        };
      }

      return { exists: false };
    }
  }

  /**
   * Get place media details
   */
  async getPlaceMedia(placeId: string): Promise<PlaceMediaData | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/places/${placeId}/media`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.warn('API call failed, using mock response:', error);
      
      // Mock response for development
      await this.simulateDelay(500);
      
      return {
        placeId,
        placeName: 'Mock Place',
        province: 'Mock Province',
        category: 'Mock Category',
        media: [
          {
            id: 'mock_media_1',
            title: 'Mock Image 1',
            description: 'Mock description',
            type: 'image',
            url: '/src/shared/assets/hero-beach.jpg',
            uploadedAt: new Date(),
            updatedAt: new Date(),
            status: 'approved'
          }
        ]
      };
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || 'mock-token';
  }

  private async simulateDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mediaManagementService = new MediaManagementService();