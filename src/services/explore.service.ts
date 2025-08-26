import apiClient from '@/lib/axios';

// Get videos for explore feed
export const getVideos = async (page: number = 1, limit: number = 10) => {
  const { data } = await apiClient.get(`/api/explore/videos?page=${page}&limit=${limit}`);
  return data;
};

// Like/unlike a video
export const toggleLike = async (videoId: string) => {
  const { data } = await apiClient.post(`/api/videos/${videoId}/like`);
  return data;
};

// Follow/unfollow a user
export const toggleFollow = async (userId: string) => {
  const { data } = await apiClient.post(`/api/users/${userId}/follow`);
  return data;
};

// Get comments for a video
export const getComments = async (videoId: string, page: number = 1) => {
  const { data } = await apiClient.get(`/api/videos/${videoId}/comments?page=${page}`);
  return data;
};

// Post a comment
export const postComment = async (videoId: string, text: string) => {
  // The backend expects the format { "input": "..." }
  const { data } = await apiClient.post(`/api/videos/${videoId}/comments`, { input: text });
  return data;
};

// Share a video (get share URL)
export const shareVideo = async (videoId: string) => {
  const { data } = await apiClient.post(`/api/videos/${videoId}/share`);
  return data;
};
