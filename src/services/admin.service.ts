// Service for admin-related database operations
import { getSupabaseClient } from './supabase.service';
import { AttractionDetail } from '@/shared/types/attraction';
import { readFileSync } from 'fs';
import { basename } from 'path';

/**
 * Uploads an image to the 'place-images' bucket in Supabase Storage.
 * @param imageFile - The image file to upload.
 * @returns The public URL of the uploaded image.
 */
export const uploadAttractionImage = async (imageFile: File): Promise<string> => {
  const supabase = getSupabaseClient();
  const fileName = `${Date.now()}_${imageFile.name}`;

  console.log(`Uploading image: ${fileName}`);

  const { data, error } = await supabase.storage
    .from('place-images')
    .upload(fileName, imageFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  console.log('Image uploaded successfully. Getting public URL...');

  const { data: { publicUrl } } = supabase.storage
    .from('place-images')
    .getPublicUrl(data.path);

  if (!publicUrl) {
    throw new Error('Could not get public URL for the uploaded image.');
  }

  console.log(`Public URL received: ${publicUrl}`);
  return publicUrl;
};

/**
 * Adds a new attraction to the 'places' table in Supabase.
 * @param attractionData - The data for the new attraction.
 * @returns The newly created attraction data.
 */
export const addAttraction = async (
  attractionData: Omit<AttractionDetail, 'id' | 'reviews' | 'confidence' | 'matchedTerms' | 'lastUpdated'>
): Promise<AttractionDetail> => {
  const supabase = getSupabaseClient();

  console.log(`Adding attraction: ${attractionData.name}`);

  const { data, error } = await supabase
    .from('places')
    .insert([
      {
        name: attractionData.name,
        name_local: attractionData.nameLocal,
        province: attractionData.province,
        category: attractionData.category,
        image_url: attractionData.image,
        description: attractionData.description,
        tags: attractionData.tags,
        amenities: attractionData.amenities,
        lat: attractionData.location.lat,
        lng: attractionData.location.lng,
        rating: attractionData.rating,
        review_count: attractionData.reviewCount,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding attraction:', error);
    throw new Error(`Failed to add attraction: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to add attraction: No data returned from Supabase.');
  }

  console.log(`Attraction added successfully with ID: ${data.id}`);

  // Transform Supabase data to AttractionDetail format
  return {
      id: data.id,
      name: data.name,
      nameLocal: data.name_local,
      province: data.province,
      category: data.category,
      image: data.image_url,
      images: [data.image_url],
      description: data.description,
      tags: data.tags || [],
      amenities: data.amenities || [],
      location: {
        lat: data.lat,
        lng: data.lng,
      },
      rating: data.rating,
      reviewCount: data.review_count,
      reviews: { count: 0, average: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, recent: [] },
      coordinates: {
        lat: data.lat,
        lng: data.lng,
      },
      confidence: 1.0,
      matchedTerms: [],
      lastUpdated: data.updated_at,
  };
};
