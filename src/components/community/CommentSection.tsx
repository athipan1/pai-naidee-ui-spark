import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Send,
  Reply,
  Verified
} from 'lucide-react';
import { Comment } from '@/shared/types/community';
import { useCommunity } from '@/shared/hooks/useCommunity';
import { cn } from '@/shared/lib/utils';

interface CommentSectionProps {
  postId: string;
  onAddComment: (content: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onAddComment
}) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  const { getComments, isAddingComment } = useCommunity();

  useEffect(() => {
    const loadComments = async () => {
      setIsLoadingComments(true);
      try {
        const postComments = await getComments(postId);
        setComments(postComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    loadComments();
  }, [postId, getComments]);

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    
    onAddComment(commentText);
    setCommentText('');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เพิ่งแสดงความคิดเห็น';
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

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      {/* Add Comment */}
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150" />
          <AvatarFallback>คุ</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="แสดงความคิดเห็น..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[60px] resize-none"
          />
          
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || isAddingComment}
              className="flex items-center space-x-2"
            >
              <Send className="h-3 w-3" />
              <span>ส่ง</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {isLoadingComments ? (
        <div className="flex justify-center py-4">
          <div className="text-sm text-muted-foreground">กำลังโหลดความคิดเห็น...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.user.avatar} alt={comment.user.displayName} />
                <AvatarFallback>{comment.user.displayName[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm">{comment.user.displayName}</h4>
                    {comment.user.isVerified && (
                      <Verified className="h-3 w-3 text-blue-500 fill-current" />
                    )}
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs text-white border-0 h-4",
                        getUserLevelColor(comment.user.level)
                      )}
                    >
                      {comment.user.level === 'legend' ? 'ตำนาน' :
                       comment.user.level === 'expert' ? 'ผู้เชี่ยวชาญ' :
                       comment.user.level === 'adventurer' ? 'นักผจญภัย' :
                       comment.user.level === 'explorer' ? 'นักสำรวจ' : 'มือใหม่'}
                    </Badge>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{formatTimeAgo(comment.createdAt)}</span>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "h-auto p-0 text-xs hover:text-red-500",
                      comment.isLiked && "text-red-500"
                    )}
                  >
                    <Heart className={cn(
                      "h-3 w-3 mr-1",
                      comment.isLiked && "fill-current"
                    )} />
                    {comment.likes > 0 ? comment.likes : 'ถูกใจ'}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-auto p-0 text-xs hover:text-blue-500"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    ตอบกลับ
                  </Button>
                </div>

                {/* Replies would go here */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-4 pt-2 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-2">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={reply.user.avatar} alt={reply.user.displayName} />
                          <AvatarFallback className="text-xs">{reply.user.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="bg-muted/50 rounded-lg p-2 flex-1">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="font-medium text-xs">{reply.user.displayName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};