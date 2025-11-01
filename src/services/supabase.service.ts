import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

// Supabase client singleton. Use `getSupabaseClient()` to access it.
let supabase: SupabaseClient | null = null;

/**
 * Lazily initializes and returns the Supabase client instance.
 * This ensures that environment variables are loaded before the client is created.
 */
function getSupabaseClient(): SupabaseClient {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || 'https://your-project.supabase.co';
  const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'your-anon-key';

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

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
  details?: any;
  external_links?: any;
  coordinates?: any;
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
  // Check if Supabase is properly configured before making requests
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase is not properly configured. Skipping database query.');
    throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
  }

  // Ensure the user has a session, even if anonymous
  await ensureAuthenticated();

  try {
    const { data, error } = await getSupabaseClient()
      .from('places')
      .select('*')
      .eq('category', category)
      .limit(limit);

    if (error) {
      console.error('Failed to fetch places by category:', error);
      throw new Error(`Failed to fetch places by category: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.info(`No places found for category: ${category}`);
      return [];
    }

    // Transform Supabase data to SearchResult format with better null handling
    return data.map((place: PlaceRecord): SearchResult => ({
      id: place.id || 'unknown',
      name: place.name || 'Unnamed Place',
      nameLocal: place.name_local || place.name || 'Unnamed Place',
      province: place.province || 'Unknown Province',
      category: place.category || 'Unknown',
      tags: Array.isArray(place.tags) ? place.tags : [],
      rating: typeof place.rating === 'number' ? place.rating : 0,
      reviewCount: typeof place.review_count === 'number' ? place.review_count : 0,
      image: place.image_url || 'https://via.placeholder.com/400x250?text=No+Image',
      description: place.description || 'No description available.',
      confidence: 1.0, // Default confidence for direct category match
      matchedTerms: [category],
      amenities: Array.isArray(place.amenities) ? place.amenities : [],
      location: (typeof place.lat === 'number' && typeof place.lng === 'number') ? {
        lat: place.lat,
        lng: place.lng
      } : undefined,
    }));

  } catch (error) {
    console.error('Failed to fetch places by category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Database query failed: ${errorMessage}`);
  }
};

/**
 * Get a specific place by ID using Supabase query with .eq
 * @param id - The place ID to fetch
 * @returns Promise<AttractionDetail>
 */
export const getPlaceById = async (id: string): Promise<AttractionDetail> => {
  // Check if Supabase is properly configured before making requests
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase is not properly configured. Skipping database query.');
    throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
  }

  try {
    const { data, error } = await getSupabaseClient()
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

    // Transform Supabase data to AttractionDetail format with better null handling
    return {
      id: place.id || 'unknown',
      name: place.name || 'Unnamed Place',
      nameLocal: place.name_local || place.name || 'Unnamed Place',
      province: place.province || 'Unknown Province',
      category: place.category || 'Unknown',
      image: place.image_url || 'https://via.placeholder.com/400x250?text=No+Image',
      images: [place.image_url || 'https://via.placeholder.com/400x250?text=No+Image'],
      description: place.description || 'No description available.',
      tags: Array.isArray(place.tags) ? place.tags : [],
      amenities: Array.isArray(place.amenities) ? place.amenities : [],
      location: {
        lat: typeof place.lat === 'number' ? place.lat : 0,
        lng: typeof place.lng === 'number' ? place.lng : 0,
      },
      rating: typeof place.rating === 'number' ? place.rating : 0,
      reviewCount: typeof place.review_count === 'number' ? place.review_count : 0,
      reviews: {
        count: typeof place.review_count === 'number' ? place.review_count : 0,
        average: typeof place.rating === 'number' ? place.rating : 0,
        breakdown: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
        recent: [],
      },
      coordinates: {
        lat: typeof place.lat === 'number' ? place.lat : 0,
        lng: typeof place.lng === 'number' ? place.lng : 0,
      },
      confidence: 1.0, // Default confidence for direct ID lookup
      matchedTerms: [], // No search terms for a direct lookup
      lastUpdated: place.updated_at,
    };

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
  // Check if Supabase is properly configured before making requests
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase is not properly configured. Skipping database query.');
    throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
  }

  try {
    // Initialize the query and request total count
    let query = getSupabaseClient().from('places').select('*', { count: 'exact' });

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

    // Transform data to SearchResult format with better null handling
    const results = data.map((place: PlaceRecord): SearchResult => ({
      id: place.id || 'unknown',
      name: place.name || 'Unnamed Place',
      nameLocal: place.name_local || place.name || 'Unnamed Place',
      province: place.province || 'Unknown Province',
      category: place.category || 'Unknown',
      tags: Array.isArray(place.tags) ? place.tags : [],
      rating: typeof place.rating === 'number' ? place.rating : 0,
      reviewCount: typeof place.review_count === 'number' ? place.review_count : 0,
      image: place.image_url || 'https://via.placeholder.com/400x250?text=No+Image',
      description: place.description || 'No description available.',
      confidence: 0.8,
      matchedTerms: searchTerm ? [searchTerm] : [],
      amenities: Array.isArray(place.amenities) ? place.amenities : [],
      location: (typeof place.lat === 'number' && typeof place.lng === 'number') ? { 
        lat: place.lat, 
        lng: place.lng 
      } : undefined,
    }));

    return { results, totalCount: count || 0 };

  } catch (error) {
    console.error('Failed to search places:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Database query failed: ${errorMessage}`);
  }
};

// --- Authentication ---

/**
 * Ensures the user is authenticated, performing an anonymous sign-in if necessary.
 * This is crucial for RLS policies that grant access to the 'anon' role.
 */
export const ensureAuthenticated = async () => {
  try {
    const { data, error } = await getSupabaseClient().auth.getSession();

    // If there's an error fetching the session, log it
    if (error) {
      console.error('Error fetching auth session:', error);
    }

    // If there is no active session, perform a sign-in with a generic JWT
    // This is a common pattern for anonymous access with Supabase
    if (!data.session) {
      console.log('No active session, performing anonymous sign-in...');
      const { error: signInError } = await getSupabaseClient().auth.signInAnonymously();

      if (signInError) {
        console.error('Anonymous sign-in failed:', signInError);
        throw new Error(`Anonymous sign-in failed: ${signInError.message}`);
      }
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
    throw new Error(`Authentication check failed: ${errorMessage}`);
  }
};

// Export the factory function for use in other services
export { getSupabaseClient };
