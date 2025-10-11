import { createClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { SearchResult } from '@/shared/types/search';
import { AttractionDetail } from '@/shared/types/attraction';
import { Place } from '@/types/place';

// Helper function to get environment variables in both browser and Node.js contexts
function getEnvVar(key: string, fallback: string = ''): string {
  // Browser context (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback;
  }
  
  // Node.js context (via global mock setup in scripts)
  if (typeof globalThis !== 'undefined' && (globalThis as any).import?.meta?.env) {
    return (globalThis as any).import.meta.env[key] || fallback;
  }
  
  // Direct Node.js environment access
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  
  return fallback;
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  return !!(
    url && 
    url !== 'https://your-project.supabase.co' && 
    url !== 'https://your-project-id.supabase.co' &&
    key && 
    key !== 'your-anon-key' && 
    key !== 'your-supabase-anon-key-here'
  );
}

// Supabase configuration with proper environment variable handling
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || 'https://your-project.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'your-anon-key';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Define a generic type for our database schema.
// This will be used by the Supabase client for type safety.
// We are only defining the 'places' table for now.
export type Database = {
  public: {
    Tables: {
      places: {
        Row: Place; // The type of a row in the 'places' table.
        Insert: Omit<Place, 'id' | 'created_at' | 'updated_at'>; // The type for inserting a new row.
        Update: Partial<Place>; // The type for updating a row.
      };
      images: {
        Row: {
          id: number;
          place_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          place_id: string;
          image_url: string;
        };
        Update: {
          image_url?: string;
        };
      };
    };
    Functions: {
      // We will define the nearby_places function later
    };
    Views: {
      // We can define views here if needed
    };
  };
};

/**
 * Transforms a Place object into a SearchResult object.
 * @param place - The Place object from Supabase.
 * @returns A SearchResult object.
 */
const transformToSearchResult = (place: Place): SearchResult => {
  const imageUrl = place.images?.[0]?.image_url || place.image_url || 'https://via.placeholder.com/400x250?text=No+Image';

  return {
    id: place.id,
    name: place.name,
    nameLocal: place.name_local || place.name,
    province: place.province,
    category: place.app_category || place.category,
    tags: Array.isArray(place.tags) ? place.tags : [],
    rating: place.rating || 0,
    reviewCount: place.review_count || 0,
    image: imageUrl,
    description: place.description || 'No description available.',
    confidence: 1.0,
    matchedTerms: [],
    amenities: Array.isArray(place.amenities) ? place.amenities : [],
    location: (place.lat != null && place.lng != null) ? { lat: place.lat, lng: place.lng } : undefined,
  };
};

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
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase is not properly configured. Skipping database query.');
    throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
  }

  try {
    const { data, error } = await supabase
      .from('places')
      .select('*, images(image_url)')
      .eq('app_category', category)
      .limit(limit);

    if (error) {
      console.error('Failed to fetch places by category:', error);
      throw new Error(`Failed to fetch places by category: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.info(`No places found for category: ${category}`);
      return [];
    }

    return data.map(transformToSearchResult);

  } catch (error) {
    console.error('Failed to fetch places by category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Database query failed: ${errorMessage}`);
  }
};

/**
 * Transforms a Place object into an AttractionDetail object.
 * @param place - The Place object from Supabase.
 * @returns An AttractionDetail object.
 */
const transformToAttractionDetail = (place: Place): AttractionDetail => {
  const imageUrls = place.images?.map(img => img.image_url).filter(Boolean) as string[];
  if (place.image_url && !imageUrls.includes(place.image_url)) {
    imageUrls.unshift(place.image_url);
  }

  return {
    id: place.id,
    name: place.name,
    nameLocal: place.name_local || place.name,
    province: place.province,
    category: place.app_category || place.category,
    image: imageUrls[0] || 'https://via.placeholder.com/400x250?text=No+Image',
    images: imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/400x250?text=No+Image'],
    description: place.description || 'No description available.',
    tags: Array.isArray(place.tags) ? place.tags : [],
    amenities: Array.isArray(place.amenities) ? place.amenities : [],
    location: {
      lat: place.lat ?? 0,
      lng: place.lng ?? 0,
    },
    rating: place.rating || 0,
    reviewCount: place.review_count || 0,
    reviews: {
      count: place.review_count || 0,
      average: place.rating || 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, // Placeholder
      recent: [], // Placeholder
    },
    coordinates: place.coordinates || { lat: place.lat ?? 0, lng: place.lng ?? 0 },
    confidence: 1.0,
    matchedTerms: [],
    lastUpdated: place.updated_at,
  };
};

/**
 * Get a specific place by ID using Supabase query with .eq
 * @param id - The place ID to fetch
 * @returns Promise<AttractionDetail>
 */
export const getPlaceById = async (id: string): Promise<AttractionDetail> => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase is not properly configured. Skipping database query.');
    throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
  }

  try {
    const { data, error } = await supabase
      .from('places')
      .select('*, images(image_url)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to fetch place:', error);
      throw new Error(`Failed to fetch place: ${error.message}`);
    }

    if (!data) {
      throw new Error('Place not found');
    }

    return transformToAttractionDetail(data);

  } catch (error) {
    console.error('Failed to fetch place:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Database query failed: ${errorMessage}`);
  }
};

/**
 * Search places with pagination and filtering.
 * @param searchTerm - The term to search for in name, description, etc.
 * @param categories - Optional array of categories to filter by.
 * @param provinces - Optional array of provinces to filter by.
 * @param limit - The number of results per page.
 * @param page - The page number to retrieve.
 * @returns A promise that resolves to an object with search results and total count.
 */
export const searchPlaces = async (
  searchTerm: string,
  categories: string[] = [],
  provinces: string[] = [],
  limit: number = 20,
  page: number = 1
): Promise<{ results: SearchResult[]; totalCount: number }> => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase is not properly configured. Skipping database query.');
    throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
  }

  try {
    let query = supabase
      .from('places')
      .select('*, images(image_url)', { count: 'exact' });

    if (searchTerm) {
      // Using .or for searching across multiple fields.
      // For better performance, a tsvector column and textSearch would be ideal.
      const searchConditions = `name.ilike.%${searchTerm}%,name_local.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`;
      query = query.or(searchConditions);
    }

    if (categories.length > 0) {
      query = query.in('app_category', categories);
    }

    if (provinces.length > 0) {
      query = query.in('province', provinces);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to search places:', error);
      throw new Error(`Failed to search places: ${error.message}`);
    }

    if (!data) {
      return { results: [], totalCount: 0 };
    }

    const results = data.map(transformToSearchResult);

    return { results, totalCount: count || 0 };

  } catch (error) {
    console.error('Failed to search places:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Database query failed: ${errorMessage}`);
  }
};

/**
 * Get all places with pagination. This is an alias for searching with an empty term.
 * @param page - The page number to retrieve.
 * @param limit - The number of results per page.
 * @returns A promise that resolves to an object with search results and total count.
 */
export const getAllPlaces = async (
  page: number = 1,
  limit: number = 20
): Promise<{ results: SearchResult[]; totalCount: number }> => {
  console.log(`Fetching all places, page: ${page}, limit: ${limit}`);
  return searchPlaces('', [], [], limit, page);
};

/**
 * Get the most popular places based on rating.
 * @param limit - The maximum number of popular places to return.
 * @returns A promise that resolves to an array of search results.
 */
export const getPopularPlaces = async (limit: number = 10): Promise<SearchResult[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase is not properly configured. Skipping database query.');
    throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
  }

  try {
    const { data, error } = await supabase
      .from('places')
      .select('*, images(image_url)')
      .gte('rating', 4.0)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch popular places:', error);
      throw new Error(`Failed to fetch popular places: ${error.message}`);
    }

    return data?.map(transformToSearchResult) || [];
  } catch (error) {
    console.error('Failed to fetch popular places:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Database query failed: ${errorMessage}`);
  }
};

/**
 * Get nearby places using a remote procedure call (RPC) in Supabase.
 * NOTE: This requires a `nearby_places` function to be created in your Supabase SQL editor.
 * See function definition in the comments within the code.
 * @param lat - The latitude of the center point.
 * @param lng - The longitude of the center point.
 * @param radius - The search radius in meters.
 * @param limit - The maximum number of places to return.
 * @returns A promise that resolves to an array of search results.
 */
export const getNearbyPlaces = async (
  lat: number,
  lng: number,
  radius: number,
  limit: number = 10
): Promise<SearchResult[]> => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase is not properly configured. Skipping database query.');
    throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
  }

  /*
   * REQUIRED SUPABASE FUNCTION (requires PostGIS extension):
   *
   * CREATE OR REPLACE FUNCTION nearby_places(
   *   latitude float,
   *   longitude float,
   *   radius_meters float
   * )
   * RETURNS SETOF places AS $$
   *   SELECT *
   *   FROM places
   *   WHERE ST_DWithin(
   *     ST_MakePoint(lng, lat)::geography,
   *     ST_MakePoint(longitude, latitude)::geography,
   *     radius_meters
   *   )
   * $$ LANGUAGE sql;
   */
  try {
    const { data: places, error } = await supabase.rpc('nearby_places', {
      latitude: lat,
      longitude: lng,
      radius_meters: radius,
    });

    if (error) {
      console.error('Failed to fetch nearby places:', error);
      throw new Error(`Failed to fetch nearby places: ${error.message}`);
    }

    if (!places) {
      return [];
    }

    const placeIds = places.map(p => p.id);
    if (placeIds.length === 0) {
      return [];
    }

    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('place_id, image_url')
      .in('place_id', placeIds);

    if (imagesError) {
        console.error('Failed to fetch images for nearby places:', imagesError);
    }

    const placesWithImages = places.map(place => {
        const placeImages = images ? images.filter(img => img.place_id === place.id) : [];
        return { ...place, images: placeImages };
    });

    return placesWithImages.map(p => transformToSearchResult(p as Place));

  } catch (error) {
    console.error('Failed to fetch nearby places:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Database query failed: ${errorMessage}`);
  }
};

/**
 * Gets a list of all available categories and the count of places in each.
 * NOTE: This requires a `get_category_counts` RPC function in Supabase.
 * @returns A promise that resolves to an array of objects with category name and count.
 */
export const getCategories = async (): Promise<{ name: string; count: number }[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration is incomplete.');
  }

  /*
   * REQUIRED SUPABASE FUNCTION:
   *
   * CREATE OR REPLACE FUNCTION get_category_counts()
   * RETURNS TABLE(app_category text, place_count bigint) AS $$
   *   SELECT app_category, COUNT(*) as place_count
   *   FROM places
   *   WHERE app_category IS NOT NULL AND app_category != ''
   *   GROUP BY app_category
   *   ORDER BY place_count DESC;
   * $$ LANGUAGE sql;
  */
  try {
    const { data, error } = await supabase.rpc('get_category_counts');

    if (error) {
      console.error('Failed to fetch categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data?.map(item => ({ name: item.app_category, count: item.place_count })) || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Database query failed: ${errorMessage}`);
  }
};

/**
 * Gets a list of all available provinces and the count of places in each.
 * NOTE: This requires a `get_province_counts` RPC function in Supabase.
 * @returns A promise that resolves to an array of objects with province name and count.
 */
export const getProvinces = async (): Promise<{ name: string; count: number }[]> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration is incomplete.');
  }

  /*
   * REQUIRED SUPABASE FUNCTION:
   *
   * CREATE OR REPLACE FUNCTION get_province_counts()
   * RETURNS TABLE(province_name text, place_count bigint) AS $$
   *   SELECT province, COUNT(*) as place_count
   *   FROM places
   *   WHERE province IS NOT NULL AND province != ''
   *   GROUP BY province
   *   ORDER BY place_count DESC;
   * $$ LANGUAGE sql;
  */
  try {
    const { data, error } = await supabase.rpc('get_province_counts');

    if (error) {
      console.error('Failed to fetch provinces:', error);
      throw new Error(`Failed to fetch provinces: ${error.message}`);
    }

    return data?.map(item => ({ name: item.province_name, count: item.place_count })) || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Database query failed: ${errorMessage}`);
  }
};


// Export the supabase client for direct usage if needed
export { supabase };