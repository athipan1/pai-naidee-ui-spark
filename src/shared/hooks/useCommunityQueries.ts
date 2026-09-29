import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '@/shared/services/community.service';
import { Post, Comment, CreatePostData } from '@/shared/types/community';

export const communityKeys = {
  all: ['community'] as const,
  posts: () => [...communityKeys.all, 'posts'] as const,
  post: (id: string) => [...communityKeys.posts(), id] as const,
  comments: (postId: string) => [...communityKeys.post(postId), 'comments'] as const,
};

export const useFeed = () => {
  return useQuery({
    queryKey: communityKeys.posts(),
    queryFn: communityService.getFeed,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postData: CreatePostData) => communityService.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId }: { postId: string }) => communityService.likePost(postId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.post(variables.postId) });
      queryClient.invalidateQueries({ queryKey: communityKeys.posts() });
    },
  });
};

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: communityKeys.comments(postId),
    queryFn: () => communityService.getComments(postId),
    enabled: !!postId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string, content: string }) => communityService.addComment(postId, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.comments(variables.postId) });
    },
  });
};