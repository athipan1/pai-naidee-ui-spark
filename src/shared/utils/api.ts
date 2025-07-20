// API utility functions for the Explore page

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Create headers with auth token
const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// API endpoints for Explore page
export const exploreAPI = {
  // Get videos for explore feed
  getVideos: async (page: number = 1, limit: number = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/explore/videos?page=${page}&limit=${limit}`,
      {
        headers: createAuthHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    
    return response.json();
  },

  // Like/unlike a video
  toggleLike: async (videoId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/videos/${videoId}/like`,
      {
        method: 'POST',
        headers: createAuthHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }
    
    return response.json();
  },

  // Follow/unfollow a user
  toggleFollow: async (userId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/follow`,
      {
        method: 'POST',
        headers: createAuthHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to toggle follow');
    }
    
    return response.json();
  },

  // Get comments for a video
  getComments: async (videoId: string, page: number = 1) => {
    const response = await fetch(
      `${API_BASE_URL}/videos/${videoId}/comments?page=${page}`,
      {
        headers: createAuthHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    
    return response.json();
  },

  // Post a comment
  postComment: async (videoId: string, text: string) => {
    const response = await fetch(
      `${API_BASE_URL}/videos/${videoId}/comments`,
      {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ text })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to post comment');
    }
    
    return response.json();
  },

  // Share a video (get share URL)
  shareVideo: async (videoId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/videos/${videoId}/share`,
      {
        method: 'POST',
        headers: createAuthHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to share video');
    }
    
    return response.json();
  }
};

// Error handling utility
export const handleAPIError = (error: any): string => {
  if (error.response?.status === 401) {
    // Redirect to login if unauthorized
    window.location.href = '/login';
    return 'กรุณาเข้าสู่ระบบใหม่';
  }
  
  return error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
};