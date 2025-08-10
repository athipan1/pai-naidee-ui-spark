import React, { useState, useCallback, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { InstagramPostCard } from './InstagramPostCard';
import { StoryBar, mockStories } from './StoryBar';
import { InstagramTopBar } from './InstagramTopBar';
import { InstagramBottomNav } from './InstagramBottomNav';
import { travelMockPosts, generateMorePosts } from '@/shared/data/travelMockData';
import { Post } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';
import { Heart, RefreshCw } from 'lucide-react';

interface InstagramCommunityFeedProps {
  currentLanguage: 'th' | 'en';
  onLanguageChange?: (language: 'th' | 'en') => void;
  onBack?: () => void;
}

export const InstagramCommunityFeed: React.FC<InstagramCommunityFeedProps> = ({
  currentLanguage,
  onLanguageChange,
  onBack
}) => {
  const [posts, setPosts] = useState<Post[]>(travelMockPosts);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'add' | 'notifications' | 'profile'>('home');
  const [refreshing, setRefreshing] = useState(false);

  // Simulate loading more posts
  const loadMorePosts = useCallback(() => {
    if (loading) return;
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const morePosts = generateMorePosts(3);
      setPosts(prevPosts => [...prevPosts, ...morePosts]);
      setLoading(false);
      
      // Stop infinite scroll after 50 posts to avoid infinite generation
      if (posts.length + morePosts.length >= 50) {
        setHasMore(false);
      }
    }, 1000);
  }, [loading, posts.length]);

  // Handle post interactions
  const handleLike = useCallback((postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.likes + (post.isLiked ? -1 : 1)
            }
          : post
      )
    );
  }, []);

  const handleSave = useCallback((postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, isSaved: !post.isSaved }
          : post
      )
    );
  }, []);

  const handleShare = useCallback((postId: string) => {
    // Show share modal or copy link
    if (navigator.share) {
      navigator.share({
        title: 'Check out this travel post!',
        text: 'Found this amazing travel post on ไปไหนดี',
        url: window.location.href
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
    
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, shares: post.shares + 1 }
          : post
      )
    );
  }, []);

  const handleComment = useCallback((postId: string) => {
    // Navigate to comment modal or detailed post view
    console.log('Open comments for post:', postId);
  }, []);

  const handleStoryClick = useCallback((storyId: string) => {
    console.log('Open story:', storyId);
    // Navigate to story viewer
  }, []);

  const handleAddStory = useCallback(() => {
    console.log('Add new story');
    // Open camera/story creation
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // Simulate refresh delay
    setTimeout(() => {
      // In a real app, this would fetch fresh posts from the API
      setPosts([...travelMockPosts]);
      setHasMore(true);
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleTopBarAction = useCallback((action: string) => {
    console.log(`Handle ${action} action`);
    // Handle camera, notifications, messages
  }, []);

  const handleTabChange = useCallback((tab: 'home' | 'search' | 'add' | 'notifications' | 'profile') => {
    setActiveTab(tab);
    if (tab !== 'home') {
      console.log(`Navigate to ${tab} tab`);
      // In a real app, you'd navigate to different pages/components
    }
  }, []);

  // Skeleton loader component
  const SkeletonPost = () => (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 animate-pulse">
      <div className="flex items-center p-3 space-x-3">
        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24" />
          <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-16" />
        </div>
      </div>
      <div className="aspect-[4/5] bg-gray-300 dark:bg-gray-700" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Top Navigation */}
      <InstagramTopBar
        onNotificationsClick={() => handleTopBarAction('notifications')}
        onMessagesClick={() => handleTopBarAction('messages')}
        onCameraClick={() => handleTopBarAction('camera')}
      />

      <div className="max-w-md mx-auto bg-white dark:bg-black min-h-screen pb-16">
        {/* Story Bar */}
        <StoryBar
          stories={mockStories}
          onStoryClick={handleStoryClick}
          onAddStory={handleAddStory}
        />

        {/* Feed */}
        <div className="relative">
          {/* Pull to refresh indicator */}
          {refreshing && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
              <RefreshCw className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-300" />
            </div>
          )}

          <InfiniteScroll
            dataLength={posts.length}
            next={loadMorePosts}
            hasMore={hasMore}
            loader={
              <div className="py-4">
                <SkeletonPost />
              </div>
            }
            endMessage={
              <div className="py-8 text-center">
                <Heart className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  You're all caught up! ✨
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Check back later for more travel inspiration
                </p>
              </div>
            }
            refreshFunction={handleRefresh}
            pullDownToRefresh={false} // We'll handle this manually for better UX
            className="pb-4"
          >
            {posts.map((post, index) => (
              <InstagramPostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onSave={handleSave}
                onShare={handleShare}
                onComment={handleComment}
                className={cn(
                  "animate-fade-in",
                  index === 0 && "animate-slide-down"
                )}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))}
          </InfiniteScroll>
        </div>
      </div>

      {/* Bottom Navigation */}
      <InstagramBottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userAvatar="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150"
      />
    </div>
  );
};