import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, MapPin } from 'lucide-react';
import { Post } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';

interface InstagramPostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
  onComment: (postId: string) => void;
  className?: string;
}

export const InstagramPostCard: React.FC<InstagramPostCardProps> = ({
  post,
  onLike,
  onSave,
  onShare,
  onComment,
  className
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const lastTapRef = useRef<number>(0);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return `${Math.floor(diffInDays / 7)}w`;
  };

  const truncateCaption = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleImageDoubleClick = () => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    
    if (timeDiff < 300) {
      // Double tap detected
      setLikeAnimation(true);
      onLike(post.id);
      setTimeout(() => setLikeAnimation(false), 1000);
    }
    
    lastTapRef.current = now;
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto bg-white dark:bg-black border-0 border-b border-gray-200 dark:border-gray-800 rounded-none md:rounded-lg md:border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.user.avatar} alt={post.user.displayName} />
            <AvatarFallback className="text-xs">{post.user.displayName[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {post.user.username}
              </span>
              {post.user.isVerified && (
                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            
            {post.location && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3 w-3" />
                <span>{post.location.name}</span>
              </div>
            )}
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Image */}
      <div className="relative bg-gray-100 dark:bg-gray-900 aspect-[4/5] overflow-hidden">
        {post.images.length > 0 && (
          <>
            <img
              src={post.images[0]}
              alt="Post"
              className={cn(
                "w-full h-full object-cover cursor-pointer transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onClick={handleImageDoubleClick}
              onDoubleClick={handleImageDoubleClick}
            />
            
            {/* Like animation overlay */}
            {likeAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart 
                  className="h-20 w-20 text-white fill-red-500 animate-scale-in" 
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))',
                    animation: 'likeAnimation 1s ease-out'
                  }}
                />
              </div>
            )}
            
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
            )}
            
            {/* Multiple images indicator */}
            {post.images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black bg-opacity-50 rounded-full px-2 py-1">
                <span className="text-white text-xs">1/{post.images.length}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-transparent"
              onClick={() => onLike(post.id)}
            >
              <Heart className={cn(
                "h-6 w-6 transition-colors",
                post.isLiked ? "fill-red-500 text-red-500" : "text-gray-900 dark:text-white"
              )} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-transparent"
              onClick={() => onComment(post.id)}
            >
              <MessageCircle className="h-6 w-6 text-gray-900 dark:text-white" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-transparent"
              onClick={() => onShare(post.id)}
            >
              <Share className="h-6 w-6 text-gray-900 dark:text-white" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-transparent"
            onClick={() => onSave(post.id)}
          >
            <Bookmark className={cn(
              "h-6 w-6 transition-colors",
              post.isSaved ? "fill-gray-900 text-gray-900 dark:fill-white dark:text-white" : "text-gray-900 dark:text-white"
            )} />
          </Button>
        </div>

        {/* Likes count */}
        {post.likes > 0 && (
          <div className="mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {post.likes.toLocaleString()} likes
            </span>
          </div>
        )}

        {/* Caption */}
        <div className="mb-2">
          <span className="text-sm text-gray-900 dark:text-white">
            <span className="font-semibold mr-2">{post.user.username}</span>
            {showFullCaption || post.content.length <= 100 ? (
              post.content
            ) : (
              <>
                {truncateCaption(post.content)}
                <button 
                  className="text-gray-500 dark:text-gray-400 ml-1"
                  onClick={() => setShowFullCaption(true)}
                >
                  more
                </button>
              </>
            )}
          </span>
        </div>

        {/* Hashtags */}
        {post.tags.length > 0 && (
          <div className="mb-2">
            <span className="text-sm text-blue-500 dark:text-blue-400">
              {post.tags.map(tag => `#${tag}`).join(' ')}
            </span>
          </div>
        )}

        {/* Comments link */}
        {post.comments > 0 && (
          <button 
            className="text-sm text-gray-500 dark:text-gray-400 mb-2 block"
            onClick={() => onComment(post.id)}
          >
            View all {post.comments} comments
          </button>
        )}

        {/* Time */}
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
          {formatTimeAgo(post.createdAt)}
        </div>
      </div>
    </Card>
  );
};