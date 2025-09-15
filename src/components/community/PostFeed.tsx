import React, { useCallback, useEffect, useRef } from 'react';
import { PostCard } from './PostCard';
import { PostDetail } from './PostDetail';
import { CreatePost } from './CreatePost';
import { FloatingPostButton } from './FloatingPostButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePosts } from '@/shared/hooks/usePosts';
import { useCreatePost } from '@/shared/hooks/useCreatePost';
import { useCommunity } from '@/shared/hooks/useCommunity';
import { usePostContext } from '@/shared/contexts/PostContext';
import { useMedia } from '@/shared/contexts/MediaProvider';
import { cn } from '@/shared/lib/utils';
import { CreatePostData, Post } from '@/shared/types/community';
import { PostCardSkeleton, ErrorState, EmptyState, LoadingSpinner } from '@/components/common/LoadingStates';

interface PostFeedProps {
  /** Custom className */
  className?: string;
  /** Show create post option */
  showCreatePost?: boolean;
  /** Custom empty state component */
  emptyComponent?: React.ReactNode;
  /** Number of posts to load per page */
  pageSize?: number;
  /** Enable pull to refresh */
  enablePullToRefresh?: boolean;
}

export const PostFeed: React.FC<PostFeedProps> = ({
  className,
  showCreatePost = true,
  emptyComponent,
  pageSize = 10,
  enablePullToRefresh = true
}) => {
  const { isMobile } = useMedia();
  const { feedFilter } = usePostContext();
  
  // Hooks for posts and interactions
  const {
    posts,
    isLoading,
    isError,
    error,
    hasMore,
    loadMore,
    isFetchingNextPage,
    refresh,
    isRefetching
  } = usePosts({ pageSize });

  const {
    likePostMutation,
    savePostMutation,
    sharePostMutation
  } = useCommunity();

  const {
    submitPost,
    isSubmitting
  } = useCreatePost({
    onSuccess: () => {
      setShowCreateDialog(false);
      refresh(); // Refresh feed after creating post
    }
  });

  // Local state
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [showPostDetail, setShowPostDetail] = React.useState(false);
  const [loadingPostId, setLoadingPostId] = React.useState<string | null>(null);

  // Refs for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || !hasMore || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    observer.observe(loadMoreElement);

    return () => {
      if (loadMoreElement) {
        observer.unobserve(loadMoreElement);
      }
    };
  }, [hasMore, isFetchingNextPage, loadMore]);

  // Post interaction handlers
  const handleLike = useCallback(async (postId: string) => {
    setLoadingPostId(postId);
    try {
      await likePostMutation.mutateAsync(postId);
    } finally {
      setLoadingPostId(null);
    }
  }, [likePostMutation]);

  const handleSave = useCallback(async (postId: string) => {
    setLoadingPostId(postId);
    try {
      await savePostMutation.mutateAsync(postId);
    } finally {
      setLoadingPostId(null);
    }
  }, [savePostMutation]);

  const handleShare = useCallback(async (postId: string) => {
    setLoadingPostId(postId);
    try {
      await sharePostMutation.mutateAsync(postId);
    } finally {
      setLoadingPostId(null);
    }
  }, [sharePostMutation]);

  const handleComment = useCallback((postId: string, content: string) => {
    // Comment functionality would be implemented here
    // console.log('Comment on post:', postId, content);
  }, []);

  const handleCreatePost = useCallback(async (postData: CreatePostData) => {
    await submitPost(postData);
  }, [submitPost]);

  // Post detail handlers
  const handleOpenPostDetail = useCallback((post: Post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  }, []);

  const handleClosePostDetail = useCallback(() => {
    setShowPostDetail(false);
    setSelectedPost(null);
  }, []);

  // Pull to refresh handler (mobile)
  const handleRefresh = useCallback(async () => {
    if (enablePullToRefresh) {
      await refresh();
    }
  }, [refresh, enablePullToRefresh]);

  // Loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: pageSize }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 space-y-4", className)}>
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-muted-foreground max-w-sm">
            {error?.message || 'Failed to load posts. Please try again.'}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {emptyComponent || (
          <EmptyState
            title="No posts yet"
            description="Be the first to share your travel experience!"
            actionLabel={showCreatePost ? "Create Post" : undefined}
            onAction={showCreatePost ? () => setShowCreateDialog(true) : undefined}
            icon={<Plus className="w-12 h-12 text-muted-foreground" />}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} ref={feedRef}>
      {/* Pull to refresh indicator */}
      {isRefetching && isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center py-4"
        >
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Refreshing...</span>
          </div>
        </motion.div>
      )}

      {/* Posts list */}
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.3,
              delay: index < 3 ? index * 0.1 : 0 // Stagger first 3 posts
            }}
          >
            <PostCard
              post={post}
              onLike={() => handleLike(post.id)}
              onSave={() => handleSave(post.id)}
              onShare={() => handleShare(post.id)}
              onComment={(content) => handleComment(post.id, content)}
              onOpenDetail={handleOpenPostDetail}
              isLoading={loadingPostId === post.id}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8">
          <div className="flex justify-center">
            {isFetchingNextPage ? (
              <LoadingSpinner size="md" text="Loading more posts..." />
            ) : (
              <Button 
                variant="outline" 
                onClick={loadMore}
                className="min-w-[120px]"
              >
                Load More
              </Button>
            )}
          </div>
        </div>
      )}

      {/* End of feed indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            You&apos;ve reached the end! 🎉
          </p>
        </div>
      )}

      {/* Floating create post button (mobile) */}
      {showCreatePost && isMobile && (
        <FloatingPostButton 
          onClick={() => setShowCreateDialog(true)}
          isLoading={isSubmitting}
        />
      )}

      {/* Create post dialog */}
      <CreatePost
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreatePost}
        isSubmitting={isSubmitting}
      />

      {/* Post detail modal */}
      <PostDetail
        post={selectedPost}
        open={showPostDetail}
        onOpenChange={handleClosePostDetail}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
        onComment={handleComment}
        isLoading={loadingPostId === selectedPost?.id}
      />
    </div>
  );
};

export default PostFeed;