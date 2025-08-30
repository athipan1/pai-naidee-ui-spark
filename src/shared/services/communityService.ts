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
    const endpoint = `/posts/${postId}/save`;
    console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
    return Promise.reject({ message: `Endpoint ${endpoint} not found.` });
  },

  sharePost: async (postId: string): Promise<void> => {
    const endpoint = `/posts/${postId}/share`;
    console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
    return Promise.reject({ message: `Endpoint ${endpoint} not found.` });
  },

  // Inspiration rating
  ratePost: async (postId: string, rating: number): Promise<boolean> => {
    const endpoint = `/posts/${postId}/rate`;
    console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
    return Promise.reject({ message: `Endpoint ${endpoint} not found.` });
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
    const endpoint = `/groups`;
    console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
    return Promise.reject({ message: `Endpoint ${endpoint} not found.` });
  },

  joinGroup: async (groupId: string): Promise<boolean> => {
    const endpoint = `/groups/${groupId}/join`;
    console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
    return Promise.reject({ message: `Endpoint ${endpoint} not found.` });
  },

  // User points and rewards
  getUserPoints: async (): Promise<any> => {
    const endpoint = `/user/points`;
    console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
    return Promise.reject({ message: `Endpoint ${endpoint} not found.` });
  },

  getRewards: async (): Promise<any[]> => {
    const endpoint = `/rewards`;
    console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
    return Promise.reject({ message: `Endpoint ${endpoint} not found.` });
  },

  redeemReward: async (rewardId: string): Promise<boolean> => {
    const endpoint = `/rewards/${rewardId}/redeem`;
    console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
    return Promise.reject({ message: `Endpoint ${endpoint} not found.` });
  }
};