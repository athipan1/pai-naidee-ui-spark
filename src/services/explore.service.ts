import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

// Get videos for explore feed
export const getVideos = async (page: number = 1, limit: number = 10) => {
  try {
    const { data } = await apiClient.get(`${API_ENDPOINTS.EXPLORE_VIDEOS}?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    throw new Error((error as any)?.userMessage || 'Failed to fetch videos');
  }
};

// Like/unlike a video
export const toggleLike = async (videoId: string) => {
  try {
    const { data } = await apiClient.post(API_ENDPOINTS.VIDEO_LIKE(videoId));
    return data;
  } catch (error) {
    throw new Error((error as any)?.userMessage || 'Failed to toggle video like');
  }
};

// Follow/unfollow a user
export const toggleFollow = async (userId: string) => {
  try {
    const { data } = await apiClient.post(API_ENDPOINTS.USER_FOLLOW(userId));
    return data;
  } catch (error) {
    console.warn(`Follow user endpoint may not be implemented: ${API_ENDPOINTS.USER_FOLLOW(userId)}`);
    // Return mock success for now to prevent UI breaking
    return { success: true, message: 'Follow feature coming soon' };
  }
};

// Get comments for a video
export const getComments = async (videoId: string, page: number = 1) => {
  try {
    const { data } = await apiClient.get(`${API_ENDPOINTS.VIDEO_COMMENTS(videoId)}?page=${page}`);
    return data;
  } catch (error) {
    throw new Error((error as any)?.userMessage || 'Failed to fetch video comments');
  }
};

// Post a comment
export const postComment = async (videoId: string, text: string) => {
  try {
    // The backend expects the format { "input": "..." }
    const { data } = await apiClient.post(API_ENDPOINTS.VIDEO_COMMENTS(videoId), { input: text });
    return data;
  } catch (error) {
    throw new Error((error as any)?.userMessage || 'Failed to post comment');
  }
};

// Share a video (get share URL)
export const shareVideo = async (videoId: string) => {
  try {
    const { data } = await apiClient.post(API_ENDPOINTS.VIDEO_SHARE(videoId));
    return data;
  } catch (error) {
    throw new Error((error as any)?.userMessage || 'Failed to share video');
  }
};
