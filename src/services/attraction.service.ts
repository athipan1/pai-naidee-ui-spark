import { AttractionDetail } from '@/shared/types/attraction';
import { SearchResult } from '@/shared/types/search';
import { getPlaceById, searchPlaces } from './supabase.service';

// Helper to extract a meaningful error message from an API error
const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// [REFACTORED] Get attraction details by ID from Supabase
const getAttractionDetail = async (id: string): Promise<AttractionDetail> => {
  console.log("✅ Calling Supabase to fetch attraction detail for id:", id);
  try {
    const attraction = await getPlaceById(id);
    return attraction;
  } catch (error) {
    console.error(`❌ Error fetching attraction detail from Supabase for id ${id}:`, error);
    throw new Error(`Failed to fetch attraction details. ${getApiErrorMessage(error)}`);
  }
};

// [REFACTORED] Get list of all attractions from Supabase
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
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const category = options?.category ? [options.category] : [];
  const search = options?.search || '';

  console.log("✅ Calling Supabase to fetch attractions list with options:", options);
  try {
    const { results, totalCount } = await searchPlaces(search, category, [], limit, page);
    return {
      attractions: results,
      total: totalCount,
      page,
      limit,
    };
  } catch (error) {
    console.error(`❌ Error fetching attractions from Supabase:`, error);
    throw new Error(`Failed to fetch attractions. ${getApiErrorMessage(error)}`);
  }
};

// [REFACTORED] Get list of attractions from Supabase
// This function now uses the searchPlaces function to fetch data from Supabase
const getLegacyAttractions = async (): Promise<SearchResult[]> => {
  console.log("✅ Calling Supabase to fetch attractions");

  try {
    // Calling searchPlaces with an empty search term to get all attractions
    const { results } = await searchPlaces('');
    return results;
  } catch (error) {
    console.error('❌ Error fetching attractions from Supabase:', error);
    throw new Error(`Failed to fetch attractions from Supabase. ${getApiErrorMessage(error)}`);
  }
};

export const attractionService = {
  getAttractionDetail,
  getAttractions,
  getLegacyAttractions,
};