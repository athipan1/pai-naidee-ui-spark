import { supabase, ensureAuthenticated, isSupabaseConfigured } from '@/services/supabase.service';
import { AttractionDetail } from '@/shared/types/attraction';
import { SearchResult } from '@/shared/types/search';

// Helper to extract a meaningful error message from an API error
const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// [REFACTORED] Get attraction details by ID from Supabase Edge Function
const getAttractionDetail = async (id: string): Promise<AttractionDetail> => {
  console.log('✅ Calling Edge Function to fetch attraction detail for id:', id);
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    await ensureAuthenticated(); // Ensure user is authenticated
    const { data, error } = await supabase.functions.invoke('getAttractionDetail', {
      body: { id },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Attraction not found.');
    }

    return data;
  } catch (error) {
    console.error(`❌ Error fetching attraction detail from Edge Function for id ${id}:`, error);
    throw new Error(`Failed to fetch attraction details. ${getApiErrorMessage(error)}`);
  }
};

// [REFACTORED] Get list of all attractions from Supabase Edge Function
const getAttractions = async (options?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<{
  attractions: SearchResult[];
  total: number;
  page: number;
  limit: number;
}> => {
  console.log('✅ Calling Edge Function to fetch attractions list with options:', options);
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please check your environment variables.');
    }
    await ensureAuthenticated(); // Ensure user is authenticated
    const { data, error } = await supabase.functions.invoke('getAttractions', {
      body: { ...options },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Ensure we have a valid response structure
    if (!data || !Array.isArray(data.attractions)) {
        throw new Error('Invalid response from server');
    }

    return data;
  } catch (error) {
    console.error(`❌ Error fetching attractions from Edge Function:`, error);
    throw new Error(`Failed to fetch attractions. ${getApiErrorMessage(error)}`);
  }
};

// [DEPRECATED] This function is no longer needed as getAttractions can handle all cases.
// It is kept for compatibility with any components that might still be using it.
const getLegacyAttractions = async (): Promise<SearchResult[]> => {
  console.warn('⚠️ DEPRECATED: getLegacyAttractions is called. Please use getAttractions instead.');
  // Call with defaults that match the old behavior.
  const { attractions } = await getAttractions({ page: 1, limit: 100 });
  return attractions;
};

export const attractionService = {
  getAttractionDetail,
  getAttractions,
  getLegacyAttractions,
};
