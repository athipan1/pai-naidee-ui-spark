import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  MapPin, 
  MoreHorizontal,
  Verified
} from 'lucide-react';
import { InteractionBar } from './InteractionBar';
import { CommentSection } from './CommentSection';
import { Post } from '@/shared/types/community';
import { useMedia } from '@/shared/contexts/MediaProvider';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface PostDetailProps {
  /** The post to display */
  post: Post | null;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Post interaction callbacks */
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  /** Whether interactions are loading */
  isLoading?: boolean;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  post,
  open,
  onOpenChange,
  onLike,
  onSave,
  onShare,
  onComment
}) => {
  const { isMobile } = useMedia();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);

  // Reset state when post changes
  useEffect(() => {
    if (post) {
      setSelectedImageIndex(0);
      setShowFullCaption(false);
    }
  }, [post]);

  if (!post) return null;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'เมื่อสักครู่';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
    
    return format(date, 'dd MMM yyyy');
  };

  const truncateCaption = (text: string, limit: number = 150) => {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden",
          isMobile && "max-w-full max-h-full h-full w-full"
        )}
      >
        <div className="flex h-full">
          {/* Media Section - Left side on desktop, top on mobile */}
          <div className={cn(
            "relative bg-black flex items-center justify-center",
            isMobile ? "w-full h-80" : "w-3/5 min-h-[500px]"
          )}>
            {post.images && post.images.length > 0 ? (
              <div className="relative w-full h-full">
                <img
                  src={post.images[selectedImageIndex]}
                  alt={`Post image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                
                {/* Image navigation */}
                {post.images.length > 1 && (
                  <>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {post.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleImageClick(index)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            index === selectedImageIndex 
                              ? "bg-white" 
                              : "bg-white/50"
                          )}
                        />
                      ))}
                    </div>
                    
                    {selectedImageIndex > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                        onClick={() => setSelectedImageIndex(prev => prev - 1)}
                      >
                        ←
                      </Button>
                    )}
                    
                    {selectedImageIndex < post.images.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                        onClick={() => setSelectedImageIndex(prev => prev + 1)}
                      >
                        →
                      </Button>
                    )}
                  </>
                )}
              </div>
            ) : post.videos && post.videos.length > 0 ? (
              <video
                src={post.videos[0]}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center text-white/60">
                No media available
              </div>
            )}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content Section - Right side on desktop, bottom on mobile */}
          <div className={cn(
            "flex flex-col bg-background",
            isMobile ? "w-full flex-1" : "w-2/5 h-full"
          )}>
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.user.avatar} alt={post.user.displayName} />
                    <AvatarFallback>
                      {post.user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-sm">
                        {post.user.displayName}
                      </span>
                      {post.user.isVerified && (
                        <Verified className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      {post.location && (
                        <>
                          <MapPin className="h-3 w-3" />
                          <span>{post.location.name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Caption and Tags */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Title (if exists) */}
                {post.title && (
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                )}

                {/* Caption */}
                <div>
                  <p className="text-sm leading-relaxed">
                    {showFullCaption 
                      ? post.content 
                      : truncateCaption(post.content)
                    }
                  </p>
                  {post.content.length > 150 && (
                    <button
                      onClick={() => setShowFullCaption(!showFullCaption)}
                      className="text-xs text-muted-foreground hover:underline mt-1"
                    >
                      {showFullCaption ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Travel Zone */}
                {post.travelZone && (
                  <Badge variant="outline" className="w-fit">
                    {post.travelZone}
                  </Badge>
                )}

                <Separator />

                {/* Interaction Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    {post.likes > 0 && (
                      <span>{post.likes} likes</span>
                    )}
                    {post.comments > 0 && (
                      <span>{post.comments} comments</span>
                    )}
                  </div>
                  {post.shares > 0 && (
                    <span>{post.shares} shares</span>
                  )}
                </div>

                {/* Action Buttons */}
                <InteractionBar
                  post={post}
                  onLike={() => onLike(post.id)}
                  onSave={() => onSave(post.id)}
                  onShare={() => onShare(post.id)}
                  onComment={() => {}}
                />

                <Separator />

                {/* Comments */}
              <CommentSection
                postId={post.id}
              />
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetail;