import React, { createContext, useContext, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Post, FeedFilter } from '../types/community';

interface PostContextType {
  // Global state for posts management
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  
  // Filter state
  feedFilter: FeedFilter;
  setFeedFilter: (filter: FeedFilter) => void;
  
  // Auth token for API calls
  token: string | null;
  setToken: (token: string | null) => void;
  
  // Utility methods
  invalidatePosts: () => void;
  refetchPosts: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

interface PostProviderProps {
  children: ReactNode;
  initialPosts?: Post[];
  initialFilter?: FeedFilter;
  authToken?: string | null;
}

export const PostProvider: React.FC<PostProviderProps> = ({
  children,
  initialPosts = [],
  initialFilter = { type: 'all', sortBy: 'latest' },
  authToken = null
}) => {
  const queryClient = useQueryClient();
  const [feedFilter, setFeedFilter] = React.useState<FeedFilter>(initialFilter);
  const [token, setToken] = React.useState<string | null>(authToken);

  // Get posts from React Query cache or fallback to initial posts
  const postsData = queryClient.getQueryData<Post[]>(['feed', feedFilter]);
  const posts = postsData || initialPosts;
  
  // Get loading state from React Query
  const queryState = queryClient.getQueryState(['feed', feedFilter]);
  const isLoading = queryState?.fetchStatus === 'fetching' || false;
  const error = queryState?.error as Error || null;

  // Utility methods for cache management
  const invalidatePosts = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
  }, [queryClient]);

  const refetchPosts = React.useCallback(() => {
    queryClient.refetchQueries({ queryKey: ['feed', feedFilter] });
  }, [queryClient, feedFilter]);

  const value: PostContextType = {
    posts,
    isLoading,
    error,
    feedFilter,
    setFeedFilter,
    token,
    setToken,
    invalidatePosts,
    refetchPosts
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};

/**
 * Hook to access post context
 * Must be used within PostProvider
 */
export const usePostContext = (): PostContextType => {
  const context = useContext(PostContext);
  
  if (context === undefined) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  
  return context;
};

/**
 * Hook to check if component is within PostProvider
 */
export const usePostContextOptional = (): PostContextType | undefined => {
  return useContext(PostContext);
};