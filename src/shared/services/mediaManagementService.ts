// Media Management Service for handling place media operations
import { getSupabaseClient } from '@/services/supabase.service';
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
  private getSupabase() {
    return getSupabaseClient();
  }

  // --- Core API Methods ---

  /**
   * Fetch all places from the backend.
   */
  async getPlaces(): Promise<PlaceWithMedia[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('places')
      .select('*, media(*)');
    
    if (error) throw new Error(error.message);
    return (data || []) as PlaceWithMedia[];
  }

  /**
   * Fetch a single place by its ID.
   */
  async getPlaceById(placeId: string): Promise<PlaceWithMedia> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('places')
      .select('*, media(*)')
      .eq('id', placeId)
      .single();
    
    if (error) throw new Error(error.message);
    return data as PlaceWithMedia;
  }

  /**
   * Create a new place with media.
   */
  async createPlaceWithMedia(
    placeData: Omit<PlaceWithMedia, 'id' | 'media' | 'created_at' | 'coordinates'> & { coordinates: { lat: number, lng: number } },
    media: MediaUploadData[]
  ): Promise<PlaceCreationResult> {
    try {
      const supabase = this.getSupabase();
      
      // Insert place into database
      const { data: place, error: placeError } = await supabase
        .from('places')
        .insert({
          name: placeData.name,
          name_local: placeData.name_local,
          province: placeData.province,
          category: placeData.category || 'Attraction',
          description: placeData.description,
          lat: placeData.coordinates.lat,
          lng: placeData.coordinates.lng,
        })
        .select()
        .single();

      if (placeError) throw new Error(placeError.message);

      // Upload media files to storage
      const uploadedMedia: MediaItem[] = [];
      for (const mediaItem of media) {
        if (mediaItem.file) {
          const fileExt = mediaItem.file.name.split('.').pop();
          const fileName = `${place.id}/${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('place-media')
            .upload(fileName, mediaItem.file);

          if (uploadError) {
            console.error('Media upload error:', uploadError);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('place-media')
            .getPublicUrl(fileName);

          // Insert media record
          const { data: mediaRecord, error: mediaError } = await supabase
            .from('media')
            .insert({
              place_id: place.id,
              url: publicUrl,
              type: mediaItem.type,
              title: mediaItem.title,
              description: mediaItem.description,
            })
            .select()
            .single();

          if (!mediaError && mediaRecord) {
            uploadedMedia.push(mediaRecord as MediaItem);
          }
        }
      }

      return {
        success: true,
        placeId: place.id,
        message: 'Place created successfully',
        mediaCount: uploadedMedia.length,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create place');
    }
  }

  /**
   * Update an existing place's details.
   */
  async updatePlace(
    placeId: string,
    updateData: Partial<Omit<PlaceWithMedia, 'id' | 'media' | 'created_at' | 'coordinates'> & { coordinates: { lat: number, lng: number } }>
  ): Promise<PlaceUpdateResult> {
    const supabase = this.getSupabase();
    
    const dbUpdate: any = {
      name: updateData.name,
      name_local: updateData.name_local,
      province: updateData.province,
      category: updateData.category,
      description: updateData.description,
    };

    if (updateData.coordinates) {
      dbUpdate.lat = updateData.coordinates.lat;
      dbUpdate.lng = updateData.coordinates.lng;
    }

    const { data, error } = await supabase
      .from('places')
      .update(dbUpdate)
      .eq('id', placeId)
      .select('*, media(*)')
      .single();

    if (error) throw new Error(error.message);

    return {
      success: true,
      message: 'Place updated successfully',
      data: data as PlaceWithMedia,
    };
  }

  /**
   * "Replaces" media by adding new files to a place.
   */
  async replaceMediaForPlace(
    placeId: string,
    newMedia: MediaUploadData[]
  ): Promise<MediaReplacementResult> {
    const supabase = this.getSupabase();
    const uploadedMedia: MediaItem[] = [];

    for (const mediaItem of newMedia) {
      if (mediaItem.file) {
        const fileExt = mediaItem.file.name.split('.').pop();
        const fileName = `${placeId}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('place-media')
          .upload(fileName, mediaItem.file);

        if (uploadError) {
          console.error('Media upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('place-media')
          .getPublicUrl(fileName);

        const { data: mediaRecord, error: mediaError } = await supabase
          .from('media')
          .insert({
            place_id: placeId,
            url: publicUrl,
            type: mediaItem.type,
            title: mediaItem.title,
            description: mediaItem.description,
          })
          .select()
          .single();

        if (!mediaError && mediaRecord) {
          uploadedMedia.push(mediaRecord as MediaItem);
        }
      }
    }

    return {
      success: true,
      message: 'Media replaced successfully',
      placeId,
      newMedia: uploadedMedia,
    };
  }

  /**
   * Search places by name or province.
   */
  async searchPlaces(name?: string, province?: string): Promise<{ places: PlaceWithMedia[] }> {
    const supabase = this.getSupabase();
    let query = supabase
      .from('places')
      .select('*, media(*)');

    if (name) {
      query = query.ilike('name', `%${name}%`);
    }
    if (province) {
      query = query.ilike('province', `%${province}%`);
    }

    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return { places: (data || []) as PlaceWithMedia[] };
  }

  /**
   * Delete a media item by its ID.
   */
  async deleteMedia(mediaId: string): Promise<{ success: boolean; message: string }> {
    const supabase = this.getSupabase();
    
    // First get the media record to find the file path
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('url')
      .eq('id', mediaId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    // Delete from storage if URL exists
    if (media?.url) {
      const filePath = media.url.split('/place-media/')[1];
      if (filePath) {
        await supabase.storage
          .from('place-media')
          .remove([filePath]);
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId);

    if (deleteError) throw new Error(deleteError.message);

    return {
      success: true,
      message: 'Media deleted successfully',
    };
  }
}

export const mediaManagementService = new MediaManagementService();
