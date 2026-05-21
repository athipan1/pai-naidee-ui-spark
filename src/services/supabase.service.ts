import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SearchResult } from '@/shared/types/search';
import { AttractionDetail } from '@/shared/types/attraction';
import API_BASE from '@/config/api';

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
  media?: { url: string; [key: string]: any }[];
}

/**
 * Get places by category using Supabase query with .eq
 * @param category - The category to filter by
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Promise<SearchResult[]>
 */
export const getPlacesByCategory = async (
  category: string,
  _limit: number = 10
): Promise<SearchResult[]> => {
  try {
    // Call backend API which handles Google Sheets/Supabase fallback
    const response = await fetch(`${API_BASE}/places`);
    if (!response.ok) throw new Error('Failed to fetch places');
    const data = await response.json();

    // Filter by category client-side (or could add backend support)
    const filtered = data.filter((p: any) => p.category === category);

    return filtered.map((place: any): SearchResult => ({
      id: place.id || 'unknown',
      name: place.name || 'Unnamed Place',
      nameLocal: place.name_local || place.name || 'Unnamed Place',
      province: place.province || 'Unknown Province',
      category: place.category || 'Unknown',
      tags: Array.isArray(place.tags) ? place.tags : [],
      rating: typeof place.rating === 'number' ? place.rating : 0,
      reviewCount: typeof place.review_count === 'number' ? place.review_count : 0,
      image: place.media && place.media.length > 0 ? place.media[0].url : place.image_url || 'https://via.placeholder.com/400x250?text=No+Image',
      description: place.description || 'No description available.',
      confidence: 1.0,
      matchedTerms: [category],
      amenities: Array.isArray(place.amenities) ? place.amenities : [],
      location: (typeof place.lat === 'number' && typeof place.lng === 'number') ? {
        lat: place.lat,
        lng: place.lng
      } : undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch places by category:', error);
    throw error;
  }
};

/**
 * Get a specific place by ID using Supabase query with .eq
 * @param id - The place ID to fetch
 * @returns Promise<AttractionDetail>
 */
export const getPlaceById = async (id: string): Promise<AttractionDetail> => {
  try {
    const response = await fetch(`${API_BASE}/places/${id}`);
    if (!response.ok) throw new Error('Place not found');
    const place = await response.json();

    const mainImage = place.media && place.media.length > 0 ? place.media[0].url : place.image_url || 'https://via.placeholder.com/400x250?text=No+Image';
    const allImages = place.media && place.media.length > 0 ? place.media.map((m: any) => m.url) : [mainImage];

    return {
      id: place.id || 'unknown',
      name: place.name || 'Unnamed Place',
      nameLocal: place.name_local || place.name || 'Unnamed Place',
      province: place.province || 'Unknown Province',
      category: place.category || 'Unknown',
      images: allImages,
      description: place.description || 'No description available.',
      tags: Array.isArray(place.tags) ? place.tags : [],
      rating: typeof place.rating === 'number' ? place.rating : 0,
      reviewCount: typeof place.review_count === 'number' ? place.review_count : 0,
      coordinates: {
        lat: typeof place.lat === 'number' ? place.lat : 0,
        lng: typeof place.lng === 'number' ? place.lng : 0,
      },
      lastUpdated: place.updated_at || place.created_at,
    };
  } catch (error) {
    console.error('Failed to fetch place:', error);
    throw error;
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
  _limit: number = 20,
  _page: number = 1
): Promise<{ results: SearchResult[]; totalCount: number }> => {
  try {
    const response = await fetch(`${API_BASE}/places`);
    if (!response.ok) throw new Error('Failed to fetch places');
    let data = await response.json();

    // Client-side filtering for simplicity, matching backend fallback
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      data = data.filter((p: any) =>
        p.name.toLowerCase().includes(s) ||
        (p.name_local && p.name_local.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s))
      );
    }

    if (categories.length > 0) {
      data = data.filter((p: any) => categories.includes(p.category));
    }

    if (provinces.length > 0) {
      data = data.filter((p: any) => provinces.includes(p.province));
    }

    const results = data.map((place: any): SearchResult => {
      const mainImage = place.media && place.media.length > 0 ? place.media[0].url : place.image_url || 'https://via.placeholder.com/400x250?text=No+Image';
      return {
        id: place.id || 'unknown',
        name: place.name || 'Unnamed Place',
        nameLocal: place.name_local || place.name || 'Unnamed Place',
        province: place.province || 'Unknown Province',
        category: place.category || 'Unknown',
        tags: Array.isArray(place.tags) ? place.tags : [],
        rating: typeof place.rating === 'number' ? place.rating : 0,
        reviewCount: typeof place.review_count === 'number' ? place.review_count : 0,
        image: mainImage,
        description: place.description || 'No description available.',
        confidence: 0.8,
        matchedTerms: searchTerm ? [searchTerm] : [],
        amenities: Array.isArray(place.amenities) ? place.amenities : [],
        location: (typeof place.lat === 'number' && typeof place.lng === 'number') ? {
          lat: place.lat,
          lng: place.lng
        } : undefined,
      };
    });

    return { results, totalCount: data.length };
  } catch (error) {
    console.error('Failed to search places:', error);
    throw error;
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
