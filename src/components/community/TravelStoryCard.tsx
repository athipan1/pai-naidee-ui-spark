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

              {/* Enhanced Travel Zone Badge */}
              {post.travelZone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={cn(
                        "text-white text-xs px-3 py-1 font-medium shadow-sm",
                        getTravelZoneInfo(post.travelZone).color
                      )}
                    >
                      <span className="mr-1">
                        {post.travelZone === 'adventure' && '🏔️'}
                        {post.travelZone === 'chill' && '🌊'}
                        {post.travelZone === 'family' && '👨‍👩‍👧‍👦'}
                        {post.travelZone === 'solo' && '🎒'}
                        {post.travelZone === 'foodie' && '🍜'}
                        {post.travelZone === 'culture' && '🏛️'}
                        {post.travelZone === 'nature' && '🌿'}
                        {post.travelZone === 'budget' && '💰'}
                      </span>
                      {getTravelZoneInfo(post.travelZone).label}
                    </Badge>
                    
                    {/* Enhanced Location Info */}
                    {post.location && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        <MapPin className="h-3 w-3" />
                        <span>{post.location.name}</span>
                        {post.location.region && (
                          <>
                            <span>•</span>
                            <span>{post.location.region}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
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

            {/* Enhanced Route Summary */}
            {post.route && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mx-4 mb-4 p-4 bg-gradient-to-br from-blue-50 via-green-50 to-amber-50 dark:from-blue-950/20 dark:via-green-950/20 dark:to-amber-950/20 rounded-xl border border-primary/20 shadow-sm"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Route className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary">เส้นทางการเดินทาง</h4>
                    <p className="text-xs text-muted-foreground">แผนการเดินทางที่แนะนำ</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {post.route.summary}
                </p>
                
                {/* Enhanced Route Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">ระยะเวลา</p>
                      <p className="text-sm font-medium">{post.route.duration}</p>
                    </div>
                  </div>
                  {post.route.budget && (
                    <div className="flex items-center space-x-2 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                      <span className="text-lg">💰</span>
                      <div>
                        <p className="text-xs text-muted-foreground">งบประมาณ</p>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          {post.route.budget}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Quick Action for Route */}
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                    onClick={() => setShowMapModal(true)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    ดูเส้นทางบนแผนที่
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Enhanced Media */}
            {(post.images.length > 0 || post.videos.length > 0) && (
              <div className="relative bg-black rounded-lg mx-4 overflow-hidden shadow-lg">
                <AnimatePresence mode="wait">
                  {post.images.length > 0 && (
                    <motion.div
                      key={imageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative group"
                    >
                      <img
                        src={post.images[imageIndex]}
                        alt={`Post image ${imageIndex + 1}`}
                        className="w-full h-96 object-cover"
                      />
                      
                      {/* Enhanced Image Navigation */}
                      {post.images.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-black/70 hover:bg-black/90 text-white border-0 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 bg-black/70 hover:bg-black/90 text-white border-0 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>

                          {/* Enhanced Image Indicators */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {post.images.map((_, index) => (
                              <button
                                key={index}
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                  index === imageIndex 
                                    ? "bg-white scale-125" 
                                    : "bg-white/60 hover:bg-white/80"
                                )}
                                onClick={() => setImageIndex(index)}
                              />
                            ))}
                          </div>
                          
                          {/* Image Counter */}
                          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {imageIndex + 1} / {post.images.length}
                          </div>
                        </>
                      )}
                      
                      {/* Photo Credit/Caption Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          📸 {post.location?.name || 'ภาพจากการเดินทาง'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced Video Thumbnail */}
                {post.videos.length > 0 && (
                  <div className="relative group">
                    <div className="w-full h-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <Button
                          variant="secondary"
                          size="lg"
                          className="bg-white/95 hover:bg-white text-gray-900 mb-4 rounded-full h-16 w-16 p-0 shadow-lg"
                        >
                          <Play className="h-8 w-8 ml-1" />
                        </Button>
                        <p className="text-white text-sm">
                          🎥 วิดีโอจากการเดินทาง
                        </p>
                        <p className="text-white/70 text-xs mt-1">
                          คลิกเพื่อเล่นวิดีโอ
                        </p>
                      </div>
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

            {/* Enhanced Interactions */}
            <div className="p-4 pt-0 space-y-4">
              {/* Enhanced Inspiration Rating */}
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">✨</span>
                  <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    ให้คะแนนแรงบันดาลใจ
                  </h4>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                  เรื่องราวนี้สร้างแรงบันดาลใจให้คุณแค่ไหน?
                </p>
                <InspirationRating
                  postId={post.id}
                  currentRating={post.userInspiration}
                  averageRating={post.inspirationScore}
                  totalVotes={post.inspirationCount}
                  onRate={onInspire}
                  showAverage={true}
                  showVoteCount={true}
                  className="justify-center"
                />
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">{post.comments}</span>
                    <span className="text-xs ml-1 hidden sm:inline">ความคิดเห็น</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => onShare(post.id)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">{post.shares}</span>
                    <span className="text-xs ml-1 hidden sm:inline">แชร์</span>
                  </Button>
                  
                  {/* Travel Journal Feature */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors hidden md:flex"
                  >
                    <span className="text-sm mr-1">📖</span>
                    <span className="text-xs">เพิ่มในสมุดท่องเที่ยว</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Enhanced Map View Button */}
                  {(post.route || post.location) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-green-200 text-green-700 dark:from-green-950/20 dark:to-blue-950/20 dark:border-green-800 dark:text-green-300"
                      onClick={() => setShowMapModal(true)}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">ดูแผนที่</span>
                    </Button>
                  )}

                  {/* Enhanced Save Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "p-2 h-auto rounded-full transition-all",
                      post.isSaved 
                        ? "text-primary bg-primary/10 hover:bg-primary/20" 
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
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