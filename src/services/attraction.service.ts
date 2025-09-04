import apiClient from '@/lib/axios';
import { AttractionDetail, Accommodation } from '@/shared/types/attraction';

// Get attraction details by ID
export const getAttractionDetail = async (id: string): Promise<AttractionDetail> => {
  const endpoint = `/attractions/${id}`;
  console.log("✅ API endpoint OK:", endpoint);
  const { data } = await apiClient.get<AttractionDetail>(endpoint);
  return data;
};

// Get list of all attractions with basic info
export const getAttractions = async (options?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<{
  attractions: Array<Pick<AttractionDetail, 'id' | 'name' | 'nameLocal' | 'category' | 'rating' | 'images'>>;
  total: number;
  page: number;
  limit: number;
}> => {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.category) params.append('category', options.category);
  if (options?.search) params.append('search', options.search);

  const endpoint = `/attractions?${params.toString()}`;
  console.log("✅ API endpoint OK:", endpoint);

  try {
    const { data } = await apiClient.get(endpoint);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching attractions from ${endpoint}:`, error);
    // Re-throw the error to be handled by react-query and the global interceptor
    throw error;
  }
};

// Force refresh attraction data (invalidate cache)
export const refreshAttractionData = async (id?: string): Promise<{ success: boolean; message: string }> => {
  const endpoint = id ? `/attractions/${id}/refresh` : `/attractions/refresh`;
  console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
  // This endpoint does not exist in the new API.
  // Returning a mock error response.
  return Promise.reject({ success: false, message: `Endpoint ${endpoint} not found.` });
};

// Fetch nearby accommodations for an attraction
export const fetchNearbyAccommodations = async (attractionId: string): Promise<Accommodation[]> => {
  const endpoint = `/accommodations/nearby/${attractionId}`;
  console.log("✅ API endpoint OK:", endpoint);
  const { data } = await apiClient.get<Accommodation[]>(endpoint);
  return data;
};
