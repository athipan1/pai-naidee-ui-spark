// API utility functions for attraction data management with proper caching
import { mockAttractionDetails, simulateDelay } from "../data/mockData";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Create headers with auth token
const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API call wrapper
const apiCall = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...createAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}: Request failed`);
  }

  return response.json();
};

// Attraction data interface
export interface AttractionDetail {
  id: string;
  name: string;
  nameLocal: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  tags: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  externalLinks?: {
    officialWebsite?: string;
    wikipediaUrl?: string;
  };
  lastUpdated?: string;
}

// API endpoints for attraction data
export const attractionAPI = {
  // Get attraction details by ID
  getAttractionDetail: async (id: string): Promise<AttractionDetail> => {
    // Use mock data if the VITE_USE_MOCK_DATA flag is set
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      await simulateDelay(300);
      const mockData = mockAttractionDetails[id as keyof typeof mockAttractionDetails];
      if (!mockData) {
        // Still throw an error if mock data is not found
        throw new Error(`Attraction with ID ${id} not found in mock data`);
      }
      return {
        id: mockData.id,
        name: mockData.name,
        nameLocal: mockData.nameLocal,
        province: mockData.province,
        category: mockData.category,
        rating: mockData.rating,
        reviewCount: mockData.reviewCount,
        images: mockData.images,
        description: mockData.description,
        tags: mockData.tags,
        coordinates: mockData.location,
        externalLinks: mockData.externalLinks,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Otherwise, fetch from the real API; apiCall will throw on non-ok responses
    return apiCall<AttractionDetail>(`${API_BASE_URL}/attractions/${id}`);
  },

  // Get list of all attractions with basic info
  getAttractions: async (options?: {
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
    // Use mock data if the VITE_USE_MOCK_DATA flag is set
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      await simulateDelay(500);
      const attractions = Object.values(mockAttractionDetails).map(attraction => ({
        id: attraction.id,
        name: attraction.name,
        nameLocal: attraction.nameLocal,
        category: attraction.category,
        rating: attraction.rating,
        images: attraction.images,
      }));
      return {
        attractions,
        total: attractions.length,
        page: options?.page || 1,
        limit: options?.limit || 10,
      };
    }

    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('search', options.search);

    return apiCall<{
      attractions: Array<Pick<AttractionDetail, 'id' | 'name' | 'nameLocal' | 'category' | 'rating' | 'images'>>;
      total: number;
      page: number;
      limit: number;
    }>(`${API_BASE_URL}/attractions?${params.toString()}`);
  },

  // Force refresh attraction data (invalidate cache)
  refreshAttractionData: async (id?: string): Promise<{ success: boolean; message: string }> => {
    // Handle mock scenario
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      await simulateDelay(200);
      return {
        success: true,
        message: id 
          ? `Mock attraction ${id} data refreshed`
          : 'All mock attraction data refreshed'
      };
    }

    const endpoint = id
      ? `${API_BASE_URL}/attractions/${id}/refresh`
      : `${API_BASE_URL}/attractions/refresh`;

    return apiCall<{ success: boolean; message: string }>(
      endpoint,
      { method: 'POST' }
    );
  }
};

// Error handling utility
export const handleAttractionAPIError = (error: Error): string => {
  if (error.message.includes('not found')) {
    return 'ไม่พบสถานที่ท่องเที่ยวที่คุณต้องการ';
  }
  if (error.message.includes('401') || error.message.includes('token')) {
    return 'กรุณาเข้าสู่ระบบใหม่';
  }
  return error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง';
};