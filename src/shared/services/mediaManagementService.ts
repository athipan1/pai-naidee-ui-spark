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

  /**
   * Check if a place exists.
   * This is still a placeholder and needs full implementation.
   */
  async checkPlaceExists(placeName: string, province?: string): Promise<{
    exists: boolean;
    placeId?: string;
    place?: PlaceMediaData;
  }> {
     console.warn("checkPlaceExists is not fully implemented yet.");
    // Mocking a "not found" response as the endpoint is a placeholder
    return Promise.resolve({ exists: false });
  }

  /**
   * Get place media details.
   * This is still a placeholder and needs full implementation.
   */
  async getPlaceMedia(placeId: string): Promise<PlaceMediaData | null> {
    console.warn("getPlaceMedia is not fully implemented yet.");
    // Mocking a null response as the endpoint is a placeholder
    return Promise.resolve(null);
  }

  private getAuthToken(): string {
    // In a real app, this would get a JWT token from auth state (e.g., Zustand, Redux)
    return localStorage.getItem('authToken') || 'mock-token-for-dev';
  }
}

export const mediaManagementService = new MediaManagementService();
