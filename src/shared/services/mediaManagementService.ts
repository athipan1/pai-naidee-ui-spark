// Media Management Service for handling place media operations
import API_BASE from '../../config/api';
import type { MediaItem, MediaUploadData } from '../types/media';
import { SecurityLevel } from '../types/media';

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

// Updated to match the actual API response
export interface MediaReplacementResult {
  success: boolean;
  placeId: string;
  message: string;
  replacedMediaIds?: string[];
  newMediaIds?: string[];
}

export interface PlaceCreationResult {
  success: boolean;
  placeId: string;
  message: string;
  mediaCount?: number;
}

class MediaManagementService {
  private apiBaseUrl = API_BASE;

  /**
   * Replace media for an existing place.
   * This is still a placeholder and needs full implementation.
   */
  async replaceMediaForPlace(
    placeId: string,
    newMedia: MediaUploadData[]
  ): Promise<MediaReplacementResult> {
    console.warn("replaceMediaForPlace is not fully implemented yet.");
    // Mocking a successful response as the endpoint is a placeholder
    return Promise.resolve({
      success: true,
      placeId,
      message: "Media replacement feature is under development.",
      replacedMediaIds: [],
      newMediaIds: newMedia.map((_, i) => `temp_id_${i}`),
    });
  }

  /**
   * Add new place with media.
   * This now calls the real backend API.
   */
  async createPlaceWithMedia(
    placeData: Omit<PlaceMediaData, 'media' | 'placeId'>,
    media: MediaUploadData[]
  ): Promise<PlaceCreationResult> {
    const formData = new FormData();

    // 1. Append place data as a JSON string
    formData.append('placeData', JSON.stringify({
      placeName: placeData.placeName,
      placeNameLocal: placeData.placeNameLocal,
      province: placeData.province,
      category: placeData.category,
      description: placeData.description,
      coordinates: placeData.coordinates,
      tags: placeData.tags,
    }));

    // 2. Append media metadata as a JSON string array
    const mediaMetadata = media.map(m => ({
        title: m.title,
        description: m.description,
        type: m.type,
    }));
    formData.append('metadata', JSON.stringify(mediaMetadata));

    // 3. Append each file
    media.forEach((mediaItem, index) => {
      if (mediaItem.file) {
        // Use a consistent key for the backend to find the files
        formData.append(`files`, mediaItem.file, mediaItem.file.name);
      }
    });

    const response = await fetch(`${this.apiBaseUrl}/places`, {
      method: 'POST',
      body: formData,
      headers: {
        // 'Content-Type': 'multipart/form-data' is set automatically by the browser with boundary
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
        // Throw an error with the message from the API, or a default one
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return {
        success: result.success,
        placeId: result.placeId,
        message: result.message,
        mediaCount: result.mediaCount,
    };
  }

  async searchPlaces(placeName: string, province?: string): Promise<PlaceMediaData[]> {
    const queryParams = new URLSearchParams({ placeName });
    if (province) {
      queryParams.append('province', province);
    }

    const response = await fetch(`${this.apiBaseUrl}/places/search?${queryParams}`);

    if (response.status === 404) {
      return []; // Return empty array if no places are found
    }

    if (!response.ok) {
      throw new Error(`Failed to search for places: ${response.statusText}`);
    }

    return response.json();
  }

  async getPlaceMedia(placeId: string): Promise<PlaceMediaData | null> {
    const response = await fetch(`${this.apiBaseUrl}/places/${placeId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch place media: ${response.statusText}`);
    }
    return response.json();
  }

  async updatePlace(placeId: string, placeData: Partial<PlaceMediaData>, newMedia: MediaUploadData[], mediaToDelete: string[]): Promise<any> {
    const formData = new FormData();

    formData.append('placeData', JSON.stringify(placeData));
    formData.append('mediaToDelete', JSON.stringify(mediaToDelete));

    newMedia.forEach(mediaItem => {
      if (mediaItem.file) {
        formData.append('files', mediaItem.file, mediaItem.file.name);
      }
    });

    const response = await fetch(`${this.apiBaseUrl}/places/${placeId}`, {
      method: 'PUT',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to update place`);
    }

    return response.json();
  }

  private getAuthToken(): string {
    // In a real app, this would get a JWT token from auth state (e.g., Zustand, Redux)
    return localStorage.getItem('authToken') || 'mock-token-for-dev';
  }
}

export const mediaManagementService = new MediaManagementService();
