import { AttractionDetail } from '@/shared/types/attraction';
import { SearchResult } from '@/shared/types/search';
import {
  getRailwayAttractionDetail,
  getRailwayAttractions,
} from './railway-api.service';
import { getFallbackAttractionDetail } from '@/shared/data/fallbackAttractions';

// Helper to extract a meaningful error message from an API error
const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// [REFACTORED] Get attraction details by ID from Railway API
const getAttractionDetail = async (id: string): Promise<AttractionDetail> => {
  console.log("✅ Calling Railway API to fetch attraction detail for id:", id);
  try {
    const attraction = await getRailwayAttractionDetail(id);
    return attraction;
  } catch (error) {
    console.error(`❌ Error fetching attraction detail from Railway API for id ${id}:`, error);

    const fallback = getFallbackAttractionDetail(id);
    if (fallback) {
      console.warn(`⚠️ Using local attraction fallback for id ${id}`);
      return fallback;
    }

    throw new Error(`Failed to fetch attraction details. ${getApiErrorMessage(error)}`);
  }
};

// [REFACTORED] Get list of all attractions from Railway API
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
  console.log("✅ Calling Railway API to fetch attractions list with options:", options);
  try {
    return await getRailwayAttractions({
      page,
      limit,
      category: options?.category,
      search: options?.search,
    });
  } catch (error) {
    console.error(`❌ Error fetching attractions from Railway API:`, error);
    throw new Error(`Failed to fetch attractions. ${getApiErrorMessage(error)}`);
  }
};

// [REFACTORED] Get list of attractions from Railway API
// This function now uses the searchPlaces function to fetch data from Railway API
const getLegacyAttractions = async (): Promise<SearchResult[]> => {
  console.log("✅ Calling Railway API to fetch attractions");

  try {
    const { attractions } = await getRailwayAttractions({ page: 1, limit: 50 });
    return attractions;
  } catch (error) {
    console.error('❌ Error fetching attractions from Railway API:', error);
    throw new Error(`Failed to fetch attractions from Railway API. ${getApiErrorMessage(error)}`);
  }
};

export const attractionService = {
  getAttractionDetail,
  getAttractions,
  getLegacyAttractions,
};