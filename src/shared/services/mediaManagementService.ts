// Media Management Service for handling place media operations
import { getSupabaseClient } from '@/services/supabase.service';
import type { MediaItem, MediaUploadData } from '../types/media';
import API_BASE from '@/config/api';

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
  /**
   * Fetch all places from the backend API.
   * The backend now handles the Google Sheets/Supabase fallback logic.
   */
  async getPlaces(): Promise<PlaceWithMedia[]> {
    const response = await fetch(`${API_BASE}/places`);
    if (!response.ok) throw new Error('Failed to fetch places');
    return await response.json();
  }

  /**
   * Fetch a single place by its ID.
   */
  async getPlaceById(placeId: string): Promise<PlaceWithMedia> {
    const response = await fetch(`${API_BASE}/places/${placeId}`);
    if (!response.ok) throw new Error('Failed to fetch place');
    return await response.json();
  }

  /**
   * Create a new place with media via backend API.
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
      coordinates: placeData.coordinates
    }));

    const mediaMetadata = media.map(m => ({
      title: m.title,
      description: m.description,
      type: m.type
    }));
    formData.append('metadata', JSON.stringify(mediaMetadata));

    media.forEach((m) => {
      if (m.file) {
        formData.append('files', m.file);
      }
    });

    const response = await fetch(`${API_BASE}/places`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create place');
    }

    return await response.json();
  }

  /**
   * Update an existing place's details via backend API.
   */
  async updatePlace(
    placeId: string,
    updateData: Partial<Omit<PlaceWithMedia, 'id' | 'media' | 'created_at' | 'coordinates'> & { coordinates: { lat: number, lng: number } }>
  ): Promise<PlaceUpdateResult> {
    const response = await fetch(`${API_BASE}/places/${placeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) throw new Error('Failed to update place');
    return await response.json();
  }

  /**
   * Replaces media by adding new files to a place via backend API.
   */
  async replaceMediaForPlace(
    placeId: string,
    newMedia: MediaUploadData[]
  ): Promise<MediaReplacementResult> {
    const formData = new FormData();
    newMedia.forEach((m) => {
      if (m.file) {
        formData.append('files', m.file);
      }
    });

    const response = await fetch(`${API_BASE}/places/${placeId}/media/replace`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to replace media');
    return await response.json();
  }

  /**
   * Search places by name or province via backend API.
   */
  async searchPlaces(name?: string, province?: string): Promise<{ places: PlaceWithMedia[] }> {
    const url = new URL(`${API_BASE}/places/search`);
    if (name) url.searchParams.append('name', name);
    if (province) url.searchParams.append('province', province);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  }

  /**
   * Delete a media item by its ID via backend API.
   */
  async deleteMedia(mediaId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/media/${mediaId}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete media');
    return await response.json();
  }
}

export const mediaManagementService = new MediaManagementService();
