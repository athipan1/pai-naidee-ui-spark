import { AttractionDetail } from '@/shared/types/attraction';
import { SearchResult } from '@/shared/types/search';
import { getPlaceById, searchPlaces } from './supabase.service';

const API_BASE_URL = '/api';

// Helper to extract a meaningful error message from an API error
const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// This function now fetches from the local backend API instead of Supabase directly
export const getAttractions = async (): Promise<SearchResult[]> => {
  console.log("✅ Calling backend API to fetch attractions");
  try {
    const response = await fetch(`${API_BASE_URL}/attractions`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();

    // The backend now returns data directly compatible with SearchResult[],
    // but we might need to map it if the structure differs.
    // For now, we assume the structure is compatible.
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      nameLocal: item.name_local || item.name,
      province: item.province,
      category: item.category,
      tags: item.tags || [],
      rating: item.rating || 0,
      reviewCount: item.review_count || 0,
      image: item.image_url || 'https://via.placeholder.com/400x250?text=No+Image',
      description: item.description,
      confidence: 1.0,
      matchedTerms: [],
      amenities: item.amenities || [],
      location: item.lat && item.lng ? { lat: item.lat, lng: item.lng } : undefined,
    }));
  } catch (error) {
    console.error('❌ Error fetching attractions from backend API:', error);
    throw new Error(`Failed to fetch attractions from backend. ${getApiErrorMessage(error)}`);
  }
};


// [REFACTORED] Get attraction details by ID from Supabase
// KEPT FOR NOW to avoid breaking other parts of the app
export const getAttractionDetail = async (id: string): Promise<AttractionDetail> => {
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
// KEPT FOR NOW to avoid breaking other parts of the app
export const getAttractionsWithOptions = async (options?: {
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