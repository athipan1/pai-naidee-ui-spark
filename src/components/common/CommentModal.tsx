import { useState } from "react";
import { X, Send, Heart, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  text: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  currentLanguage: "th" | "en";
}

const CommentModal = ({
  isOpen,
  onClose,
  currentLanguage,
}: CommentModalProps) => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      user: {
        id: "user1",
        name: "สมชาย ใจดี",
        avatar: "/placeholder-avatar.jpg",
      },
      text: "สวยมากเลยครับ! อยากไปเที่ยวจัง 😍",
      likes: 12,
      isLiked: false,
      createdAt: "2 ชั่วโมงที่แล้ว",
    },
    {
      id: "2",
      user: {
        id: "user2",
        name: "มาลี รักเที่ยว",
        avatar: "/placeholder-avatar2.jpg",
      },
      text: "ไปมาแล้วครับ น้ำใสมากจริงๆ แนะนำเลย!",
      likes: 8,
      isLiked: true,
      createdAt: "1 ชั่วโมงที่แล้ว",
    },
  ]);

  const [newComment, setNewComment] = useState("");

  const content = {
    th: {
      comments: "ความคิดเห็น",
      writeComment: "เขียนความคิดเห็น...",
      send: "ส่ง",
      reply: "ตอบกลับ",
      like: "ถูกใจ",
      likes: "คนถูกใจ",
    },
    en: {
      comments: "Comments",
      writeComment: "Write a comment...",
      send: "Send",
      reply: "Reply",
      like: "Like",
      likes: "likes",
    },
  };

  const t = content[currentLanguage];

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          id: "current-user",
          name: currentLanguage === "th" ? "คุณ" : "You",
          avatar: "/placeholder-avatar.jpg",
        },
        text: newComment,
        likes: 0,
        isLiked: false,
        createdAt: currentLanguage === "th" ? "เมื่อสักครู่" : "Just now",
      };

      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="w-full bg-background rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{t.comments}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Comments List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-accent rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {comment.createdAt}
                    </span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <button
                      className={`flex items-center space-x-1 ${comment.isLiked ? "text-red-500" : ""}`}
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      <Heart
                        className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`}
                      />
                      <span>{comment.likes}</span>
                    </button>
                    <button>{t.reply}</button>
                    <Button variant="ghost" size="icon" className="w-4 h-4 p-0">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t.writeComment}
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
