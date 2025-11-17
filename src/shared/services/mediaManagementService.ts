// Media Management Service for handling place media operations
import API_BASE from '../../config/api';
import type { MediaItem, MediaUploadData } from '../types/media';

// Represents a place with its associated media, matching the backend API response
export interface PlaceWithMedia {
  id: string;
  name: string;
  name_local?: string;
  province: string;
  category: string;
  description?: string;
  coordinates: string; // Stored as 'POINT(lng lat)'
  media: MediaItem[];
  created_at: string;
}

// Simplified result for media replacement
export interface MediaReplacementResult {
  success: boolean;
  message: string;
  placeId: string;
  newMedia?: MediaItem[];
}

// Result for place creation
export interface PlaceCreationResult {
  success: boolean;
  placeId: string;
  message: string;
  mediaCount?: number;
}

// Result for updating a place
export interface PlaceUpdateResult {
  success: boolean;
  message: string;
  data: PlaceWithMedia;
}

class MediaManagementService {
  private apiBaseUrl = API_BASE;

  // --- Core API Methods ---

  /**
   * Fetch all places from the backend.
   */
  async getPlaces(): Promise<PlaceWithMedia[]> {
    const response = await this.fetchWithErrorHandling('/places');
    return response.json();
  }

  /**
   * Fetch a single place by its ID.
   */
  async getPlaceById(placeId: string): Promise<PlaceWithMedia> {
    const response = await this.fetchWithErrorHandling(`/places/${placeId}`);
    return response.json();
  }

  /**
   * Create a new place with media.
   */
  async createPlaceWithMedia(
    placeData: Omit<PlaceWithMedia, 'id' | 'media' | 'created_at' | 'coordinates'> & { coordinates: { lat: number, lng: number } },
    media: MediaUploadData[]
  ): Promise<PlaceCreationResult> {
    const formData = new FormData();
    formData.append('placeData', JSON.stringify({
      placeName: placeData.name,
      placeNameLocal: placeData.name_local,
      province: placeData.province,
      category: placeData.category,
      description: placeData.description,
      coordinates: placeData.coordinates,
    }));

    const mediaMetadata = media.map(m => ({
      title: m.title,
      description: m.description,
      type: m.type,
    }));
    formData.append('metadata', JSON.stringify(mediaMetadata));

    media.forEach(mediaItem => {
      if (mediaItem.file) {
        formData.append('files', mediaItem.file, mediaItem.file.name);
      }
    });

    const response = await this.fetchWithErrorHandling('/places', {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  /**
   * Update an existing place's details.
   */
  async updatePlace(
    placeId: string,
    updateData: Partial<Omit<PlaceWithMedia, 'id' | 'media' | 'created_at' | 'coordinates'> & { coordinates: { lat: number, lng: number } }>
  ): Promise<PlaceUpdateResult> {
    const response = await this.fetchWithErrorHandling(`/places/${placeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    return response.json();
  }

  /**
   * "Replaces" media by adding new files to a place.
   */
  async replaceMediaForPlace(
    placeId: string,
    newMedia: MediaUploadData[]
  ): Promise<MediaReplacementResult> {
    const formData = new FormData();
    newMedia.forEach(mediaItem => {
      if (mediaItem.file) {
        formData.append('files', mediaItem.file, mediaItem.file.name);
      }
    });

    const response = await this.fetchWithErrorHandling(`/places/${placeId}/media/replace`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  /**
   * Search for places by name and/or province.
   */
  async searchPlaces(name?: string, province?: string): Promise<{ places: PlaceWithMedia[] }> {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (province) params.append('province', province);

    const response = await this.fetchWithErrorHandling(`/places/search?${params.toString()}`);
    return response.json();
  }

  /**
   * Delete a media item by its ID.
   */
  async deleteMedia(mediaId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.fetchWithErrorHandling(`/media/${mediaId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // --- Helper Methods ---

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || 'mock-token-for-dev';
  }

  /**
   * A wrapper for fetch that includes authorization and basic error handling.
   */
  private async fetchWithErrorHandling(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = {
      'Authorization': `Bearer ${this.getAuthToken()}`,
      ...options.headers,
    };

    // Do not set Content-Type for FormData, browser does it with boundary
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorResult = await response.json();
      throw new Error(errorResult.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }
}

export const mediaManagementService = new MediaManagementService();
