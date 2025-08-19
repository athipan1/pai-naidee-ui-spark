import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { communityService } from '../services/communityService';
import { Post } from '../types/community';
import { usePostContext } from '../contexts/PostContext';

interface UsePostsOptions {
  pageSize?: number;
  enabled?: boolean;
  staleTime?: number;
}

interface PostsPage {
  posts: Post[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export const usePosts = (options: UsePostsOptions = {}) => {
  const {
    pageSize = 10,
    enabled = true,
    staleTime = 1000 * 60 * 5 // 5 minutes
  } = options;

  const postContext = usePostContext();
  const { feedFilter } = postContext;
  const queryClient = useQueryClient();

  // Use infinite query for pagination
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useInfiniteQuery({
    queryKey: ['feed', feedFilter, pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      // Simulate pagination with offset
      const offset = pageParam * pageSize;
      const allPosts = await communityService.getFeed(feedFilter);
      
      const startIndex = offset;
      const endIndex = offset + pageSize;
      const posts = allPosts.slice(startIndex, endIndex);
      const hasMore = endIndex < allPosts.length;
      
      return {
        posts,
        nextCursor: hasMore ? pageParam + 1 : null,
        hasMore
      } as PostsPage;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && !!feedFilter,
    staleTime,
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Flatten the pages into a single array of posts
  const posts = useMemo(() => {
    return data?.pages.flatMap(page => page.posts) || [];
  }, [data]);

  // Check if we have more data to load
  const hasMore = hasNextPage && (data?.pages[data.pages.length - 1]?.hasMore ?? false);

  // Load more posts function
  const loadMore = useCallback(async () => {
    if (hasMore && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasMore, isFetchingNextPage, fetchNextPage]);

  // Refresh posts function
  const refresh = useCallback(async () => {
    // Invalidate cache and refetch
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    await refetch();
  }, [queryClient, refetch]);

  // Get a specific post by ID
  const getPost = useCallback((postId: string): Post | undefined => {
    return posts.find(post => post.id === postId);
  }, [posts]);

  // Update a post in the cache
  const updatePost = useCallback((postId: string, updater: (post: Post) => Post) => {
    queryClient.setQueryData(['feed', feedFilter, pageSize], (oldData: { pages: PostsPage[]; pageParams: number[] } | undefined) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: PostsPage) => ({
          ...page,
          posts: page.posts.map((post: Post) => 
            post.id === postId ? updater(post) : post
          )
        }))
      };
    });
  }, [queryClient, feedFilter, pageSize]);

  // Add a new post to the beginning of the feed
  const addPost = useCallback((newPost: Post) => {
    queryClient.setQueryData(['feed', feedFilter, pageSize], (oldData: { pages: PostsPage[]; pageParams: number[] } | undefined) => {
      if (!oldData || !oldData.pages.length) {
        return {
          pages: [{
            posts: [newPost],
            nextCursor: 1,
            hasMore: false
          }],
          pageParams: [0]
        };
      }
      
      return {
        ...oldData,
        pages: [
          {
            ...oldData.pages[0],
            posts: [newPost, ...oldData.pages[0].posts]
          },
          ...oldData.pages.slice(1)
        ]
      };
    });
  }, [queryClient, feedFilter, pageSize]);

  // Remove a post from the cache
  const removePost = useCallback((postId: string) => {
    queryClient.setQueryData(['feed', feedFilter, pageSize], (oldData: { pages: PostsPage[]; pageParams: number[] } | undefined) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: PostsPage) => ({
          ...page,
          posts: page.posts.filter((post: Post) => post.id !== postId)
        }))
      };
    });
  }, [queryClient, feedFilter, pageSize]);

  return {
    // Data
    posts,
    totalCount: posts.length,
    
    // Loading states
    isLoading,
    isError,
    error,
    isRefetching,
    isFetchingNextPage,
    
    // Pagination
    hasMore,
    loadMore,
    
    // Actions
    refresh,
    getPost,
    updatePost,
    addPost,
    removePost,
    
    // Raw infinite query data
    infiniteQueryData: data
  };
};

export default usePosts;