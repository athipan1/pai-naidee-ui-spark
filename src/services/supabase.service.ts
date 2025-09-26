import { createClient } from '@supabase/supabase-js';
import { SearchResult } from '@/shared/types/search';
import { AttractionDetail } from '@/shared/types/attraction';

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

// Supabase configuration with proper environment variable handling
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://your-project.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'your-anon-key');

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
      image: place.image_url || 'https://via.placeholder.com/400x250?text=No+Image',
      images: [place.image_url || 'https://via.placeholder.com/400x250?text=No+Image'],
      description: place.description || 'No description available.',
      tags: place.tags || [],
      amenities: place.amenities || [],
      location: {
        lat: place.lat || 0,
        lng: place.lng || 0,
      },
      rating: place.rating || 0,
      reviewCount: place.review_count || 0,
      reviews: {
        count: place.review_count || 0,
        average: place.rating || 0,
      },
      confidence: 1.0, // Default confidence for direct ID lookup
      matchedTerms: [], // No search terms for a direct lookup
      lastUpdated: place.updated_at,
    };

  } catch (error) {
    console.error('Failed to fetch place:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
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
  try {
    // Initialize the query and request total count
    let query = supabase.from('places').select('*', { count: 'exact' });

    const searchConditions: string[] = [];

    // Add search term conditions
    if (searchTerm) {
      searchConditions.push(`name.ilike.%${searchTerm}%`);
      searchConditions.push(`name_local.ilike.%${searchTerm}%`);
      searchConditions.push(`description.ilike.%${searchTerm}%`);
    }

    // Add category conditions
    if (categories.length > 0) {
      const categoryConditions = categories.map(c => `category.eq.${c}`).join(',');
      query = query.or(categoryConditions);
    }

    // Add province conditions
    if (provinces.length > 0) {
      const provinceConditions = provinces.map(p => `province.eq.${p}`).join(',');
      query = query.or(provinceConditions);
    }

    // Apply search term conditions if any
    if (searchConditions.length > 0) {
      query = query.or(searchConditions.join(','));
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

    // Transform data to SearchResult format
    const results = data.map((place: PlaceRecord): SearchResult => ({
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
      confidence: 0.8,
      matchedTerms: searchTerm ? [searchTerm] : [],
      amenities: place.amenities || [],
      location: place.lat && place.lng ? { lat: place.lat, lng: place.lng } : undefined,
    }));

    return { results, totalCount: count || 0 };

  } catch (error) {
    console.error('Failed to search places:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
};

// Export the supabase client for direct usage if needed
export { supabase };