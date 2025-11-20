import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MapPin,
  Building2,
  MoreHorizontal,
  Verified
} from 'lucide-react';
import { Post } from '@/shared/types/community';
import { InteractionBar } from './InteractionBar';
import { CommentSection } from './CommentSection';
import { cn } from '@/shared/lib/utils';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  /** Callback when post detail should be opened */
  onOpenDetail?: (post: Post) => void;
  /** Whether interactions are loading */
  isLoading?: boolean;
  className?: string;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onSave,
  onShare,
  onComment,
  onOpenDetail,
  isLoading = false,
  className
}) => {
  const [showComments, setShowComments] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เพิ่งโพสต์';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
    
    return date.toLocaleDateString('th-TH');
  };

  const getUserLevelColor = (level: string) => {
    switch (level) {
      case 'legend': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'expert': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'adventurer': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      case 'explorer': return 'bg-gradient-to-r from-green-400 to-emerald-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getUserLevelText = (level: string) => {
    switch (level) {
      case 'legend': return 'ตำนาน';
      case 'expert': return 'ผู้เชี่ยวชาญ';
      case 'adventurer': return 'นักผจญภัย';
      case 'explorer': return 'นักสำรวจ';
      default: return 'มือใหม่';
    }
  };

  return (
    <Card className={cn("mb-4 overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.user.avatar} alt={post.user.displayName} />
              <AvatarFallback>{post.user.displayName[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm">{post.user.displayName}</h3>
                {post.user.isVerified && (
                  <Verified className="h-4 w-4 text-blue-500 fill-current" />
                )}
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs text-white border-0",
                    getUserLevelColor(post.user.level)
                  )}
                >
                  {getUserLevelText(post.user.level)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>@{post.user.username}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
              
              {(post.location || post.accommodation) && (
                <div className="flex items-center space-x-2 mt-1">
                  {post.location && (
                    <div className="flex items-center space-x-1 text-xs text-primary">
                      <MapPin className="h-3 w-3" />
                      <span>{post.location.name}, {post.location.province}</span>
                    </div>
                  )}
                  {post.accommodation && (
                    <div className="flex items-center space-x-1 text-xs text-secondary-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>{post.accommodation.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="pt-3">
        <p className="text-sm leading-relaxed mb-3">{post.content}</p>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Images */}
        {post.images.length > 0 && (
          <div className="mb-3">
            {post.images.length === 1 ? (
              <img 
                src={post.images[0]} 
                alt="Post image"
                className="w-full rounded-lg object-cover max-h-96 cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => onOpenDetail?.(post)}
              />
            ) : (
              <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
                {post.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`Post image ${index + 1}`}
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => onOpenDetail?.(post)}
                    />
                    {index === 3 && post.images.length > 4 && (
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer"
                        onClick={() => onOpenDetail?.(post)}
                      >
                        <span className="text-white font-semibold">
                          +{post.images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interaction Bar */}
        <InteractionBar
          post={post}
          onLike={() => onLike(post.id)}
          onSave={() => onSave(post.id)}
          onShare={() => onShare(post.id)}
          onComment={() => setShowComments(!showComments)}
          isLoading={isLoading}
        />

        {/* Comments Section */}
        {showComments && (
        <CommentSection 
          postId={post.id}
        />
        )}
      </CardContent>
    </Card>
  );
};