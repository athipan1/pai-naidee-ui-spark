import { createClient } from '@supabase/supabase-js';
import { SearchResult } from '@/shared/types/search';
import { AttractionDetail } from '@/shared/types/attraction';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definition for a place record from Supabase
interface PlaceRecord {
  id: string;
  name: string;
  name_local?: string;
  province: string;
  category: string;
  rating: number;
  review_count: number;
  image_url: string;
  description: string;
  tags?: string[];
  lat?: number;
  lng?: number;
  amenities?: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Get places by category using Supabase query with .eq
 * @param category - The category to filter by
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Promise<SearchResult[]>
 */
export const getPlacesByCategory = async (
  category: string,
  limit: number = 10
): Promise<SearchResult[]> => {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('category', category)
      .limit(limit);

    if (error) {
      console.error('Failed to fetch places by category:', error);
      throw new Error(`Failed to fetch places by category: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Transform Supabase data to SearchResult format
    return data.map((place: PlaceRecord): SearchResult => ({
      id: place.id,
      name: place.name,
      nameLocal: place.name_local || place.name,
      province: place.province,
      category: place.category,
      tags: place.tags || [],
      rating: place.rating || 0,
      reviewCount: place.review_count || 0,
      image: place.image_url || 'https://via.placeholder.com/400x250?text=No+Image',
      description: place.description || 'No description available.',
      confidence: 1.0, // Default confidence for direct category match
      matchedTerms: [category],
      amenities: place.amenities || [],
      location: place.lat && place.lng ? {
        lat: place.lat,
        lng: place.lng
      } : undefined,
    }));

  } catch (error) {
    console.error('Failed to fetch places by category:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
};

/**
 * Get a specific place by ID using Supabase query with .eq
 * @param id - The place ID to fetch
 * @returns Promise<AttractionDetail>
 */
export const getPlaceById = async (id: string): Promise<AttractionDetail> => {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single(); // Use .single() to get one record

    if (error) {
      console.error('Failed to fetch place:', error);
      throw new Error(`Failed to fetch place: ${error.message}`);
    }

    if (!data) {
      throw new Error('Place not found');
    }

    const place: PlaceRecord = data;

    // Transform Supabase data to AttractionDetail format
    return {
      id: place.id,
      name: place.name,
      nameLocal: place.name_local || place.name,
      province: place.province,
      category: place.category,
      rating: place.rating || 0,
      reviewCount: place.review_count || 0,
      images: [place.image_url || 'https://via.placeholder.com/400x250?text=No+Image'],
      description: place.description || 'No description available.',
      tags: place.tags || [],
      coordinates: {
        lat: place.lat || 0,
        lng: place.lng || 0,
      },
      lastUpdated: place.updated_at,
    };

  } catch (error) {
    console.error('Failed to fetch place:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
};

/**
 * Search places using multiple conditions with .or
 * @param searchTerm - The search term to look for
 * @param categories - Optional categories to include in search
 * @param provinces - Optional provinces to include in search
 * @param limit - Maximum number of results to return (default: 20)
 * @returns Promise<SearchResult[]>
 */
export const searchPlaces = async (
  searchTerm: string,
  categories: string[] = [],
  provinces: string[] = [],
  limit: number = 20
): Promise<SearchResult[]> => {
  try {
    let query = supabase.from('places').select('*');

    // Build search conditions using .or for multiple search criteria
    const searchConditions: string[] = [];
    
    if (searchTerm) {
      // Search in name, name_local, and description
      searchConditions.push(`name.ilike.%${searchTerm}%`);
      searchConditions.push(`name_local.ilike.%${searchTerm}%`);
      searchConditions.push(`description.ilike.%${searchTerm}%`);
    }

    // Add category conditions if provided
    if (categories.length > 0) {
      categories.forEach(category => {
        searchConditions.push(`category.eq.${category}`);
      });
    }

    // Add province conditions if provided
    if (provinces.length > 0) {
      provinces.forEach(province => {
        searchConditions.push(`province.eq.${province}`);
      });
    }

    // Apply OR conditions if we have any
    if (searchConditions.length > 0) {
      query = query.or(searchConditions.join(','));
    }

    // Apply limit
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Failed to search places:', error);
      throw new Error(`Failed to search places: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Transform Supabase data to SearchResult format
    return data.map((place: PlaceRecord): SearchResult => ({
      id: place.id,
      name: place.name,
      nameLocal: place.name_local || place.name,
      province: place.province,
      category: place.category,
      tags: place.tags || [],
      rating: place.rating || 0,
      reviewCount: place.review_count || 0,
      image: place.image_url || 'https://via.placeholder.com/400x250?text=No+Image',
      description: place.description || 'No description available.',
      confidence: 0.8, // Default confidence for search results
      matchedTerms: searchTerm ? [searchTerm] : [],
      amenities: place.amenities || [],
      location: place.lat && place.lng ? {
        lat: place.lat,
        lng: place.lng
      } : undefined,
    }));

  } catch (error) {
    console.error('Failed to search places:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
};

// Export the supabase client for direct usage if needed
export { supabase };