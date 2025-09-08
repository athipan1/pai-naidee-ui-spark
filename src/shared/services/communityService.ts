import apiClient from '@/lib/axios';
import { Post, Comment, CreatePostData, FeedFilter } from '../types/community';

export const communityService = {
  // Feed operations
  getFeed: async (filter: FeedFilter = { type: 'all', sortBy: 'latest' }): Promise<Post[]> => {
    const endpoint = `/posts?page_size=20`; // Example params
    console.log("✅ API endpoint OK:", endpoint);
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  createPost: async (postData: CreatePostData): Promise<Post> => {
    const endpoint = `/posts`;
    console.log("✅ API endpoint OK:", endpoint);
    const response = await apiClient.post(endpoint, postData);
    return response.data;
  },

  // Post interactions
  likePost: async (postId: string): Promise<{ success: boolean }> => {
    const endpoint = `/posts/${postId}/like`;
    console.log("✅ API endpoint OK:", endpoint);
    const response = await apiClient.post(endpoint);
    return response.data;
  },

  savePost: async (postId: string): Promise<boolean> => {
    // DEPRECATED: Endpoint /posts/:postId/save does not exist on the backend.
    console.warn("DEPRECATED: savePost called, but endpoint does not exist.");
    return Promise.resolve(false);
  },

  sharePost: async (postId: string): Promise<void> => {
    // DEPRECATED: Endpoint /posts/:postId/share does not exist on the backend.
    console.warn("DEPRECATED: sharePost called, but endpoint does not exist.");
    return Promise.resolve();
  },

  // Inspiration rating
  ratePost: async (postId: string, rating: number): Promise<boolean> => {
    // DEPRECATED: Endpoint /posts/:postId/rate does not exist on the backend.
    console.warn("DEPRECATED: ratePost called, but endpoint does not exist.");
    return Promise.resolve(false);
  },

  // Comments
  getComments: async (postId: string): Promise<Comment[]> => {
    const endpoint = `/posts/${postId}/engagement?limit_comments=10`;
    console.log("✅ API endpoint OK:", endpoint);
    const response = await apiClient.get(endpoint);
    // Assuming the comments are in a 'comments' property of the response
    return response.data.comments;
  },

  addComment: async (postId: string, content: string): Promise<Comment> => {
    const endpoint = `/posts/${postId}/comments`;
    console.log("✅ API endpoint OK:", endpoint);
    const response = await apiClient.post(endpoint, { content });
    return response.data;
  },

  // Groups
  getGroups: async (): Promise<any[]> => {
    // DEPRECATED: Endpoint /groups does not exist on the backend.
    console.warn("DEPRECATED: getGroups called, but endpoint does not exist.");
    return Promise.resolve([]);
  },

  joinGroup: async (groupId: string): Promise<boolean> => {
    // DEPRECATED: Endpoint /groups/:groupId/join does not exist on the backend.
    console.warn("DEPRECATED: joinGroup called, but endpoint does not exist.");
    return Promise.resolve(false);
  },

  // User points and rewards
  getUserPoints: async (): Promise<any> => {
    // DEPRECATED: Endpoint /user/points does not exist on the backend.
    console.warn("DEPRECATED: getUserPoints called, but endpoint does not exist.");
    return Promise.resolve({ points: 0 });
  },

  getRewards: async (): Promise<any[]> => {
    // DEPRECATED: Endpoint /rewards does not exist on the backend.
    console.warn("DEPRECATED: getRewards called, but endpoint does not exist.");
    return Promise.resolve([]);
  },

  redeemReward: async (rewardId: string): Promise<boolean> => {
    // DEPRECATED: Endpoint /rewards/:rewardId/redeem does not exist on the backend.
    console.warn("DEPRECATED: redeemReward called, but endpoint does not exist.");
    return Promise.resolve(false);
  }
};