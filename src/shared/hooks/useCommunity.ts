import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../services/communityService';
import { Post, Comment, Group, FeedFilter, CreatePostData, UserPoints, Reward } from '../types/community';

export const useCommunity = () => {
  const [feedFilter, setFeedFilter] = useState<FeedFilter>({
    type: 'all',
    sortBy: 'latest'
  });
  
  const queryClient = useQueryClient();

  // Feed queries
  const {
    data: posts = [],
    isLoading: isLoadingFeed,
    error: feedError,
    refetch: refetchFeed
  } = useQuery({
    queryKey: ['feed', feedFilter],
    queryFn: () => communityService.getFeed(feedFilter)
  });

  const {
    data: groups = [],
    isLoading: isLoadingGroups
  } = useQuery({
    queryKey: ['groups'],
    queryFn: () => communityService.getGroups()
  });

  const {
    data: userPoints,
    isLoading: isLoadingPoints
  } = useQuery({
    queryKey: ['userPoints'],
    queryFn: () => communityService.getUserPoints()
  });

  const {
    data: rewards = [],
    isLoading: isLoadingRewards
  } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => communityService.getRewards()
  });

  // Post mutations
  const createPostMutation = useMutation({
    mutationFn: (postData: CreatePostData) => communityService.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
    }
  });

  const likePostMutation = useMutation({
    mutationFn: (postId: string) => communityService.likePost(postId),
    onMutate: async (postId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const previousPosts = queryClient.getQueryData<Post[]>(['feed', feedFilter]);
      
      if (previousPosts) {
        const updatedPosts = previousPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked,
                likes: post.likes + (post.isLiked ? -1 : 1)
              }
            : post
        );
        queryClient.setQueryData(['feed', feedFilter], updatedPosts);
      }
      
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['feed', feedFilter], context.previousPosts);
      }
    }
  });

  const savePostMutation = useMutation({
    mutationFn: (postId: string) => communityService.savePost(postId),
    onMutate: async (postId) => {
      // Optimistic update
      const previousPosts = queryClient.getQueryData<Post[]>(['feed', feedFilter]);
      
      if (previousPosts) {
        const updatedPosts = previousPosts.map(post => 
          post.id === postId 
            ? { ...post, isSaved: !post.isSaved }
            : post
        );
        queryClient.setQueryData(['feed', feedFilter], updatedPosts);
      }
      
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['feed', feedFilter], context.previousPosts);
      }
    }
  });

  const sharePostMutation = useMutation({
    mutationFn: (postId: string) => communityService.sharePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  // Inspiration rating mutation
  const ratePostMutation = useMutation({
    mutationFn: ({ postId, rating }: { postId: string; rating: number }) => 
      communityService.ratePost(postId, rating),
    onMutate: async ({ postId, rating }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const previousPosts = queryClient.getQueryData<Post[]>(['feed', feedFilter]);
      
      if (previousPosts) {
        const updatedPosts = previousPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                userInspiration: rating,
                // Optimistically update average (will be corrected by server)
                inspirationScore: post.inspirationCount > 0 
                  ? ((post.inspirationScore * post.inspirationCount) + rating) / (post.inspirationCount + (post.userInspiration ? 0 : 1))
                  : rating,
                inspirationCount: post.userInspiration ? post.inspirationCount : post.inspirationCount + 1
              }
            : post
        );
        queryClient.setQueryData(['feed', feedFilter], updatedPosts);
      }
      
      return { previousPosts };
    },
    onError: (err, { postId }, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['feed', feedFilter], context.previousPosts);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
    }
  });

  // Group mutations
  const joinGroupMutation = useMutation({
    mutationFn: (groupId: string) => communityService.joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });

  // Comment functions
  const getComments = useCallback((postId: string) => {
    return queryClient.fetchQuery({
      queryKey: ['comments', postId],
      queryFn: () => communityService.getComments(postId)
    });
  }, [queryClient]);

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => 
      communityService.addComment(postId, content),
    onSuccess: (comment, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
    }
  });

  // Reward mutations
  const redeemRewardMutation = useMutation({
    mutationFn: (rewardId: string) => communityService.redeemReward(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    }
  });

  return {
    // Feed data
    posts,
    isLoadingFeed,
    feedError,
    feedFilter,
    setFeedFilter,
    refetchFeed,

    // Groups data
    groups,
    isLoadingGroups,

    // Points and rewards
    userPoints,
    isLoadingPoints,
    rewards,
    isLoadingRewards,

    // Post actions
    createPost: createPostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    
    likePost: likePostMutation.mutate,
    savePost: savePostMutation.mutate,
    sharePost: sharePostMutation.mutate,
    ratePost: (postId: string, rating: number) => ratePostMutation.mutate({ postId, rating }),
    isRatingPost: ratePostMutation.isPending,

    // Group actions
    joinGroup: joinGroupMutation.mutate,
    isJoiningGroup: joinGroupMutation.isPending,

    // Comment actions
    getComments,
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,

    // Reward actions
    redeemReward: redeemRewardMutation.mutate,
    isRedeemingReward: redeemRewardMutation.isPending
  };
};