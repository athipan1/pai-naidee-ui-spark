import { useState } from "react";
import { Heart, MessageCircle, Share2, MapPin, Clock, MoreHorizontal, Verified } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { Post, PostSearchResult } from "@/shared/types/posts";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

interface PostCardProps {
  post: Post | PostSearchResult;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onLocationClick?: (locationId: string) => void;
  onUserClick?: (userId: string) => void;
  showMetrics?: boolean;
  className?: string;
}

const PostCard = ({
  post,
  onLike,
  onComment,
  onShare,
  onLocationClick,
  onUserClick,
  showMetrics = false,
  className
}: PostCardProps) => {
  const { language } = useLanguage();
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const content = {
    th: {
      likes: "ไลค์",
      comments: "ความคิดเห็น",
      shares: "แชร์",
      views: "การดู",
      seeMore: "ดูเพิ่มเติม",
      seeLess: "ดูน้อยลง",
      location: "สถานที่",
      timeAgo: "เมื่อ",
      verified: "ยืนยันแล้ว"
    },
    en: {
      likes: "likes",
      comments: "comments", 
      shares: "shares",
      views: "views",
      seeMore: "See more",
      seeLess: "See less",
      location: "Location",
      timeAgo: "ago",
      verified: "Verified"
    }
  };

  const t = content[language];

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return language === "th" ? "เมื่อสักครู่" : "Just now";
    } else if (diffInHours < 24) {
      return language === "th" ? `${diffInHours} ชั่วโมงที่แล้ว` : `${diffInHours}h ${t.timeAgo}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return language === "th" ? `${diffInDays} วันที่แล้ว` : `${diffInDays}d ${t.timeAgo}`;
    }
  };

  const shouldTruncate = post.caption.length > 150;
  const displayCaption = shouldTruncate && !isExpanded 
    ? post.caption.substring(0, 150) + "..." 
    : post.caption;

  // Check if this is a search result with highlighting
  const isSearchResult = 'highlightedCaption' in post;
  const captionToShow = isSearchResult && post.highlightedCaption !== post.caption
    ? post.highlightedCaption
    : displayCaption;

  return (
    <Card className={cn("w-full max-w-lg mx-auto overflow-hidden", className)}>
      {/* User Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onUserClick?.(post.user.id)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {post.user.name}
                </p>
                {post.user.verified && (
                  <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatTimeAgo(post.createdAt)}</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <button
                      onClick={() => post.locationId && onLocationClick?.(post.locationId)}
                      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                    >
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-24">
                        {language === "th" && post.location.nameLocal
                          ? post.location.nameLocal 
                          : post.location.name}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Media Content */}
      <div className="relative">
        {post.media.length > 0 && (
          <div className="aspect-square overflow-hidden">
            <OptimizedImage
              src={post.media[0].url}
              alt={post.media[0].alt || post.caption}
              className="w-full h-full object-cover"
            />
            {post.media.length > 1 && (
              <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                +{post.media.length - 1}
              </Badge>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "p-0 h-auto hover:bg-transparent",
                isLiked ? "text-red-500" : "text-gray-700 dark:text-gray-300"
              )}
            >
              <Heart className={cn("h-6 w-6", isLiked && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(post.id)}
              className="p-0 h-auto text-gray-700 dark:text-gray-300 hover:bg-transparent"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(post.id)}
              className="p-0 h-auto text-gray-700 dark:text-gray-300 hover:bg-transparent"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
          {showMetrics && 'searchMetrics' in post && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Score: {post.searchMetrics.finalScore.toFixed(2)}
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300 mb-3">
          <span className="font-semibold">
            {formatNumber(post.likeCount)} {t.likes}
          </span>
          {post.commentCount > 0 && (
            <span>
              {formatNumber(post.commentCount)} {t.comments}
            </span>
          )}
          {post.shareCount && post.shareCount > 0 && (
            <span>
              {formatNumber(post.shareCount)} {t.shares}
            </span>
          )}
          {post.viewCount && post.viewCount > 0 && (
            <span className="text-gray-500 dark:text-gray-400">
              {formatNumber(post.viewCount)} {t.views}
            </span>
          )}
        </div>

        {/* Caption */}
        <div className="text-sm text-gray-900 dark:text-gray-100">
          <span className="font-semibold mr-2">{post.user.name}</span>
          <span 
            className="inline"
            dangerouslySetInnerHTML={{ 
              __html: isSearchResult ? captionToShow : displayCaption 
            }}
          />
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-1 font-medium"
            >
              {isExpanded ? t.seeLess : t.seeMore}
            </button>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Search Matched Terms (for debugging) */}
        {showMetrics && 'matchedTerms' in post && post.matchedTerms.length > 0 && (
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            Matched: {post.matchedTerms.join(", ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;