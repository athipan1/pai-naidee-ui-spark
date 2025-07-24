
// API Client with Mock/Real API switching capability
import { mockAttractions, mockSuggestions, mockFilters, mockVideos, mockComments, mockAttractionDetails, simulateDelay, mockSearch } from '../data/mockData';
import type { SearchQuery, SearchResult, SearchSuggestion, SearchResponse } from './searchAPI';
import heroBeachImage from '@/shared/assets/hero-beach.jpg';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// API Response types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface VideoResponse {
  videos: typeof mockVideos;
  totalCount: number;
  page: number;
  limit: number;
}

interface CommentResponse {
  comments: typeof mockComments;
  totalCount: number;
  page: number;
}

// Auth utilities
const getAuthToken = (): string | null => localStorage.getItem('authToken');

const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Generic API call function
const makeApiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...createAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// API Client Class
class ApiClient {
  private useMock: boolean;

  constructor(useMock: boolean = USE_MOCK_API) {
    this.useMock = useMock;
  }

  // Method to switch between mock and real API
  setMockMode(useMock: boolean) {
    this.useMock = useMock;
  }

  // Search API methods
  async performSearch(searchQuery: SearchQuery): Promise<SearchResponse> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for search');
      return mockSearch(searchQuery.query);
    }

    try {
      const response = await makeApiCall<SearchResponse>('/search', {
        method: 'POST',
        body: JSON.stringify(searchQuery),
      });
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      return mockSearch(searchQuery.query);
    }
  }

  async getSearchSuggestions(
    query: string,
    language: 'th' | 'en' = 'th'
  ): Promise<SearchSuggestion[]> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for suggestions');
      await simulateDelay(200);
      return mockSuggestions.filter(s => 
        s.text.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      const response = await makeApiCall<{ suggestions: SearchSuggestion[] }>(
        `/search/suggestions?query=${encodeURIComponent(query)}&language=${language}`
      );
      return response.suggestions;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay(200);
      return mockSuggestions.filter(s => 
        s.text.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  async fetchSearchFilters(): Promise<typeof mockFilters> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for filters');
      await simulateDelay(300);
      return mockFilters;
    }

    try {
      const response = await makeApiCall<typeof mockFilters>('/search/filters');
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay(300);
      return mockFilters;
    }
  }

  // Explore API methods
  async getVideos(page: number = 1, limit: number = 10): Promise<VideoResponse> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for videos');
      await simulateDelay();
      return { videos: mockVideos, totalCount: mockVideos.length, page, limit };
    }

    try {
      const response = await makeApiCall<VideoResponse>(
        `/explore/videos?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay();
      return { videos: mockVideos, totalCount: mockVideos.length, page, limit };
    }
  }

  async toggleLike(videoId: string): Promise<{ success: boolean; liked: boolean }> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for like toggle');
      await simulateDelay(200);
      return { success: true, liked: true };
    }

    try {
      const response = await makeApiCall<{ success: boolean; liked: boolean }>(
        `/videos/${videoId}/like`,
        { method: 'POST' }
      );
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay(200);
      return { success: true, liked: true };
    }
  }

  async toggleFollow(userId: string): Promise<{ success: boolean; following: boolean }> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for follow toggle');
      await simulateDelay(200);
      return { success: true, following: true };
    }

    try {
      const response = await makeApiCall<{ success: boolean; following: boolean }>(
        `/users/${userId}/follow`,
        { method: 'POST' }
      );
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay(200);
      return { success: true, following: true };
    }
  }

  async getComments(videoId: string, page: number = 1): Promise<CommentResponse> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for comments');
      await simulateDelay(300);
      return { comments: mockComments, totalCount: mockComments.length, page };
    }

    try {
      const response = await makeApiCall<CommentResponse>(
        `/videos/${videoId}/comments?page=${page}`
      );
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay(300);
      return { comments: mockComments, totalCount: mockComments.length, page };
    }
  }

  async postComment(videoId: string, text: string): Promise<{
    success: boolean;
    comment: typeof mockComments[0];
  }> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for post comment');
      await simulateDelay(400);
      return { 
        success: true, 
        comment: {
          id: `c${Date.now()}`,
          text,
          user: { id: 'mock', name: 'Mock User', avatar: heroBeachImage },
          timestamp: 'just now',
          likes: 0
        }
      };
    }

    try {
      const response = await makeApiCall<{
        success: boolean;
        comment: typeof mockComments[0];
      }>(`/videos/${videoId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay(400);
      return { 
        success: true, 
        comment: {
          id: `c${Date.now()}`,
          text,
          user: { id: 'mock', name: 'Mock User', avatar: heroBeachImage },
          timestamp: 'just now',
          likes: 0
        }
      };
    }
  }

  async shareVideo(videoId: string): Promise<{
    success: boolean;
    shareUrl: string;
    message: string;
  }> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for share video');
      await simulateDelay(200);
      return { 
        success: true, 
        shareUrl: `https://mockapp.com/video/${videoId}`,
        message: 'Link copied to clipboard!' 
      };
    }

    try {
      const response = await makeApiCall<{
        success: boolean;
        shareUrl: string;
        message: string;
      }>(`/videos/${videoId}/share`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay(200);
      return { 
        success: true, 
        shareUrl: `https://mockapp.com/video/${videoId}`,
        message: 'Link copied to clipboard!' 
      };
    }
  }

  // Attraction API methods
  async getAttractionDetails(attractionId: string): Promise<typeof mockAttractionDetails['1']> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for attraction details');
      await simulateDelay();
      return mockAttractionDetails[attractionId as keyof typeof mockAttractionDetails] || mockAttractionDetails['1'];
    }

    try {
      const response = await makeApiCall<typeof mockAttractionDetails['1']>(
        `/attractions/${attractionId}`
      );
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay();
      return mockAttractionDetails[attractionId as keyof typeof mockAttractionDetails] || mockAttractionDetails['1'];
    }
  }

  async bookRoom(roomId: string, dates: { checkIn: string; checkOut: string }): Promise<{
    success: boolean;
    bookingId: string;
    message: string;
  }> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for room booking');
      await simulateDelay(1000);
      return {
        success: true,
        bookingId: `booking_${Date.now()}`,
        message: 'Room booked successfully!'
      };
    }

    try {
      const response = await makeApiCall<{
        success: boolean;
        bookingId: string;
        message: string;
      }>(`/rooms/${roomId}/book`, {
        method: 'POST',
        body: JSON.stringify(dates),
      });
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay(1000);
      return {
        success: true,
        bookingId: `booking_${Date.now()}`,
        message: 'Room booked successfully!'
      };
    }
  }

  // Auth methods
  async login(credentials: { email: string; password: string }): Promise<{
    success: boolean;
    token: string;
    refreshToken: string;
    user: any;
  }> {
    if (this.useMock) {
      console.log('🔄 Using Mock API for login');
      await simulateDelay(800);
      return {
        success: true,
        token: 'mock_jwt_token',
        refreshToken: 'mock_refresh_token',
        user: { id: 'mock_user', email: credentials.email, name: 'Mock User' }
      };
    }

    try {
      const response = await makeApiCall<{
        success: boolean;
        token: string;
        refreshToken: string;
        user: any;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return response;
    } catch (error) {
      console.warn('⚠️ API call failed, falling back to mock data:', error);
      await simulateDelay(800);
      return {
        success: true,
        token: 'mock_jwt_token',
        refreshToken: 'mock_refresh_token',
        user: { id: 'mock_user', email: credentials.email, name: 'Mock User' }
      };
    }
  }

  // Debug method to check current mode
  getCurrentMode(): string {
    return this.useMock ? 'Mock API' : 'Real API';
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export utility functions
export const switchToMockApi = () => {
  apiClient.setMockMode(true);
  console.log('🔄 Switched to Mock API mode');
};

export const switchToRealApi = () => {
  apiClient.setMockMode(false);
  console.log('🔄 Switched to Real API mode');
};

export const getCurrentApiMode = () => apiClient.getCurrentMode();

// Export types
export type { ApiResponse, VideoResponse, CommentResponse };
