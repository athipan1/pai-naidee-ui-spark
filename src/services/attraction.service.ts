import apiClient from '@/lib/axios';
import { AttractionDetail, Accommodation } from '@/shared/types/attraction';

// Get attraction details by ID
export const getAttractionDetail = async (id: string): Promise<AttractionDetail> => {
  const { data } = await apiClient.get<AttractionDetail>(`/attractions/${id}`);
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

  const { data } = await apiClient.get(`/attractions?${params.toString()}`);
  return data;
};

// Force refresh attraction data (invalidate cache)
export const refreshAttractionData = async (id?: string): Promise<{ success: boolean; message: string }> => {
  const endpoint = id ? `/attractions/${id}/refresh` : `/attractions/refresh`;
  const { data } = await apiClient.post(endpoint);
  return data;
};

// Fetch nearby accommodations for an attraction
export const fetchNearbyAccommodations = async (attractionId: string): Promise<Accommodation[]> => {
  const { data } = await apiClient.get<Accommodation[]>(`/accommodations/nearby/${attractionId}`);
  return data;
};
