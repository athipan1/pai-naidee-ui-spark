import React, { useCallback, useEffect, useRef } from 'react';
import { PostCard } from './PostCard';
import { PostDetail } from './PostDetail';
import { CreatePost } from './CreatePost';
import { FloatingPostButton } from './FloatingPostButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeed, useLikePost, useAddComment, useCreatePost } from '@/shared/hooks/useCommunityQueries';
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
  const { data: posts = [], isLoading, isError, error, refetch: refresh, isRefetching } = useFeed();
  const { mutate: likePost, isPending: isLikingPost } = useLikePost();
  const { mutate: createPost, isPending: isCreatingPost } = useCreatePost();
  const { mutate: addComment } = useAddComment();


  // Local state
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null);
  const [showPostDetail, setShowPostDetail] = React.useState(false);

  // Refs for infinite scroll
  const feedRef = useRef<HTMLDivElement>(null);

  // Post interaction handlers
  const handleLike = useCallback((postId: string) => {
    // TODO: Replace with actual user ID from auth context
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    likePost({ postId, userId });
  }, [likePost]);

  const handleComment = useCallback((postId: string, content: string) => {
    // TODO: Replace with actual user ID from auth context
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    addComment({ postId, content, userId });
  }, [addComment]);

  const handleCreatePost = useCallback((postData: CreatePostData) => {
    // TODO: Replace with actual user ID from auth context
    createPost(postData, {
        onSuccess: () => {
            setShowCreateDialog(false);
            refresh(); // Refresh feed after creating post
        }
    });
  }, [createPost, refresh]);

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
              onSave={(postId) => console.log('Save:', postId)}
              onShare={(postId) => console.log('Share:', postId)}
              onComment={(content) => handleComment(post.id, content)}
              onOpenDetail={handleOpenPostDetail}
              isLoading={isLikingPost}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* TODO: Re-implement infinite scroll */}

      {/* Floating create post button (mobile) */}
      {showCreatePost && isMobile && (
        <FloatingPostButton 
          onCreatePost={() => setShowCreateDialog(true)}
        />
      )}

      {/* Create post dialog */}
      <CreatePost
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreatePost}
        isSubmitting={isCreatingPost}
      />

      {/* Post detail modal */}
      <PostDetail
        post={selectedPost}
        open={showPostDetail}
        onOpenChange={handleClosePostDetail}
        onLike={handleLike}
        onSave={(postId) => console.log('Save:', postId)}
        onShare={(postId) => console.log('Share:', postId)}
        onComment={handleComment}
        isLoading={isLikingPost}
      />
    </div>
  );
};

export default PostFeed;