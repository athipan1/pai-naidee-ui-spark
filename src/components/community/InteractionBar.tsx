import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark 
} from 'lucide-react';
import { Post } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';

interface InteractionBarProps {
  post: Post;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onComment: () => void;
}

export const InteractionBar: React.FC<InteractionBarProps> = ({
  post,
  onLike,
  onSave,
  onShare,
  onComment
}) => {
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="border-t pt-3 mt-3">
      {/* Stats */}
      {(post.likes > 0 || post.comments > 0 || post.shares > 0) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-4">
            {post.likes > 0 && (
              <span>{formatCount(post.likes)} คนถูกใจ</span>
            )}
            {post.comments > 0 && (
              <span>{formatCount(post.comments)} ความคิดเห็น</span>
            )}
          </div>
          {post.shares > 0 && (
            <span>{formatCount(post.shares)} การแชร์</span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20",
              post.isLiked && "text-red-500"
            )}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors",
                post.isLiked && "fill-current"
              )} 
            />
            <span className="text-xs">ถูกใจ</span>
          </Button>

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">ความคิดเห็น</span>
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-green-50 dark:hover:bg-green-950/20"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs">แชร์</span>
          </Button>
        </div>

        {/* Save Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className={cn(
            "flex items-center space-x-2 px-3 py-2 hover:bg-yellow-50 dark:hover:bg-yellow-950/20",
            post.isSaved && "text-yellow-600"
          )}
        >
          <Bookmark 
            className={cn(
              "h-4 w-4 transition-colors",
              post.isSaved && "fill-current"
            )} 
          />
          <span className="text-xs">บันทึก</span>
        </Button>
      </div>
    </div>
  );
};