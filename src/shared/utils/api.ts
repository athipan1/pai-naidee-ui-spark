// API utility functions for the Explore page (ปรับปรุงการจัดการ error และ token)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get JWT token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Get refresh token from localStorage
const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// Save tokens to localStorage
const saveTokens = (authToken: string, refreshToken?: string) => {
  localStorage.setItem('authToken', authToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

// Remove token (logout)
const clearTokens = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
};

// Decode JWT token to check expiry (simple validation)
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Create headers with auth token
const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Generic API call with auto-refresh token
const apiCall = async (endpoint: string, options: RequestInit = {}, retry = true): Promise<any> => {
  let token = getAuthToken();
  if (token && isTokenExpired(token)) {
    // Try to refresh token
    const newToken = await refreshAuthToken();
    if (newToken) {
      token = newToken;
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new Error('กรุณาเข้าสู่ระบบใหม่ (token หมดอายุ)');
    }
  }
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...createAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    if (response.status === 401 && retry) {
      clearTokens();
      window.location.href = '/login';
      throw new Error('กรุณาเข้าสู่ระบบใหม่ (401)');
    }
    const err = await response.text();
    throw new Error(err || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
  }
  return response.json();
};

// Refresh token API (สมมติ backend มี endpoint /auth/refresh)
const refreshAuthToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.authToken) {
      saveTokens(data.authToken, data.refreshToken);
      return data.authToken;
    }
    return null;
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token && !isTokenExpired(token);
};

// API endpoints for Explore page
export const exploreAPI = {
  // Get videos for explore feed
  getVideos: async (page: number = 1, limit: number = 10) =>
    apiCall(`${API_BASE_URL}/explore/videos?page=${page}&limit=${limit}`),

  // Like/unlike a video
  toggleLike: async (videoId: string) =>
    apiCall(`${API_BASE_URL}/videos/${videoId}/like`, { method: 'POST' }),

  // Follow/unfollow a user
  toggleFollow: async (userId: string) =>
    apiCall(`${API_BASE_URL}/users/${userId}/follow`, { method: 'POST' }),

  // Get comments for a video
  getComments: async (videoId: string, page: number = 1) =>
    apiCall(`${API_BASE_URL}/videos/${videoId}/comments?page=${page}`),

  // Post a comment
  postComment: async (videoId: string, text: string) =>
    apiCall(`${API_BASE_URL}/videos/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Share a video (get share URL)
  shareVideo: async (videoId: string) =>
    apiCall(`${API_BASE_URL}/videos/${videoId}/share`, { method: 'POST' }),
};

// Error handling utility
export const handleAPIError = (error: Error): string => {
  if (error.message.includes("401") || error.message.includes("token หมดอายุ")) {
    window.location.href = '/login';
    return 'กรุณาเข้าสู่ระบบใหม่';
  }
  return error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
};