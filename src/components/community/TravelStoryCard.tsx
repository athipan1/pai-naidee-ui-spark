import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Clock, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Building2,
  MoreHorizontal,
  Verified,
  Route,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';
import { Post } from '@/shared/types/community';
import { InspirationRating } from './InspirationRating';
import { MapViewModal } from './MapViewModal';
import { CommentSection } from './CommentSection';
import { cn } from '@/shared/lib/utils';
import { useSeasonalTheme } from './SeasonalThemeProvider';

interface TravelStoryCardProps {
  post: Post;
  onInspire: (postId: string, rating: number) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  className?: string;
}

export const TravelStoryCard: React.FC<TravelStoryCardProps> = ({
  post,
  onInspire,
  onSave,
  onShare,
  onComment,
  className
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const { themeConfig } = useSeasonalTheme();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เพิ่งโพสต์';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} วันที่แล้ว`;
  };

  const getTravelZoneInfo = (zone: string) => {
    const zones = {
      adventure: { label: 'สายผจญภัย', color: 'bg-red-500' },
      chill: { label: 'สายชิล', color: 'bg-blue-500' },
      family: { label: 'ครอบครัว', color: 'bg-green-500' },
      solo: { label: 'เที่ยวคนเดียว', color: 'bg-purple-500' },
      foodie: { label: 'สายกิน', color: 'bg-orange-500' },
      culture: { label: 'วัฒนธรรม', color: 'bg-yellow-500' },
      nature: { label: 'ธรรมชาติ', color: 'bg-emerald-500' },
      budget: { label: 'ประหยัด', color: 'bg-pink-500' }
    };
    return zones[zone as keyof typeof zones] || { label: zone, color: 'bg-gray-500' };
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % post.images.length);
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn(
          "overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300",
          "border-0 bg-gradient-to-br from-white via-white to-gray-50/50",
          "dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50",
          className
        )}>
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={post.user.avatar} alt={post.user.displayName} />
                    <AvatarFallback>{post.user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-sm">{post.user.displayName}</h4>
                      {post.user.isVerified && (
                        <Verified className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatTimeAgo(post.createdAt)}</span>
                      {post.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{post.location.name}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Travel Zone Badge */}
              {post.travelZone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3"
                >
                  <Badge 
                    className={cn(
                      "text-white text-xs",
                      getTravelZoneInfo(post.travelZone).color
                    )}
                  >
                    {getTravelZoneInfo(post.travelZone).label}
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Title */}
            {post.title && (
              <div className="px-4 pb-3">
                <h3 className="text-lg font-semibold leading-tight">{post.title}</h3>
              </div>
            )}

            {/* Content */}
            <div className="px-4 pb-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Route Summary */}
            {post.route && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mx-4 mb-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg border"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Route className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">เส้นทางการเดินทาง</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{post.route.summary}</p>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.route.duration}</span>
                  </div>
                  {post.route.budget && (
                    <div className="flex items-center space-x-1">
                      <span>💰</span>
                      <span>{post.route.budget}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Media */}
            {(post.images.length > 0 || post.videos.length > 0) && (
              <div className="relative bg-black">
                <AnimatePresence mode="wait">
                  {post.images.length > 0 && (
                    <motion.div
                      key={imageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative"
                    >
                      <img
                        src={post.images[imageIndex]}
                        alt={`Post image ${imageIndex + 1}`}
                        className="w-full h-96 object-cover"
                      />
                      
                      {/* Image Navigation */}
                      {post.images.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>

                          {/* Image Indicators */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {post.images.map((_, index) => (
                              <button
                                key={index}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all",
                                  index === imageIndex ? "bg-white" : "bg-white/50"
                                )}
                                onClick={() => setImageIndex(index)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Video Thumbnail */}
                {post.videos.length > 0 && (
                  <div className="relative">
                    <div className="w-full h-96 bg-gray-900 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="bg-white/90 hover:bg-white text-gray-900"
                      >
                        <Play className="h-6 w-6 mr-2" />
                        เล่นวิดีโอ
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Badge 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-muted"
                      >
                        #{tag}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactions */}
            <div className="p-4 pt-0 space-y-3">
              {/* Inspiration Rating */}
              <InspirationRating
                postId={post.id}
                currentRating={post.userInspiration}
                averageRating={post.inspirationScore}
                totalVotes={post.inspirationCount}
                onRate={onInspire}
                showAverage={true}
                showVoteCount={true}
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-muted-foreground hover:text-foreground"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">{post.comments}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-muted-foreground hover:text-foreground"
                    onClick={() => onShare(post.id)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">{post.shares}</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Map View Button */}
                  {(post.route || post.location) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMapModal(true)}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-xs">ดูแผนที่</span>
                    </Button>
                  )}

                  {/* Save Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "p-0 h-auto",
                      post.isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => onSave(post.id)}
                  >
                    <Bookmark 
                      className={cn(
                        "h-4 w-4",
                        post.isSaved && "fill-current"
                      )} 
                    />
                  </Button>
                </div>
              </div>

              {/* Comment Section */}
              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CommentSection
                      postId={post.id}
                      onAddComment={(content) => onComment(post.id, content)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Map Modal */}
      <MapViewModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        route={post.route}
        location={post.location}
        title={post.title || post.content.substring(0, 50) + '...'}
      />
    </>
  );
};

export default TravelStoryCard;