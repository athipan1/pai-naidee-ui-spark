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
  MoreHorizontal,
  Verified,
  Route,
  ChevronLeft,
  ChevronRight,
  Play,
  Wallet,
  CalendarDays
} from 'lucide-react';
import { Post, TravelZone } from '@/shared/types/community';
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
  currentLanguage: 'th' | 'en';
}

export const TravelStoryCard: React.FC<TravelStoryCardProps> = ({
  post,
  onInspire,
  onSave,
  onShare,
  onComment,
  className,
  currentLanguage
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

  const getTravelZoneInfo = (zone: TravelZone) => {
    const zones: Record<TravelZone, { label: string; color: string; icon: React.ReactNode }> = {
      adventure: { label: 'สายผจญภัย', color: 'bg-accent-orange/20 text-accent-orange border-accent-orange/30', icon: '🏔️' },
      chill: { label: 'สายชิล', color: 'bg-accent-sky/20 text-accent-sky border-accent-sky/30', icon: '🌊' },
      family: { label: 'ครอบครัว', color: 'bg-accent-green/20 text-accent-green border-accent-green/30', icon: '👨‍👩‍👧‍👦' },
      solo: { label: 'เที่ยวคนเดียว', color: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30', icon: '🎒' },
      foodie: { label: 'สายกิน', color: 'bg-amber-500/20 text-amber-600 border-amber-500/30', icon: '🍜' },
      culture: { label: 'วัฒนธรรม', color: 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30', icon: '🏛️' },
      nature: { label: 'ธรรมชาติ', color: 'bg-teal-500/20 text-teal-600 border-teal-500/30', icon: '🌿' },
      budget: { label: 'ประหยัด', color: 'bg-accent-pink/20 text-accent-pink border-accent-pink/30', icon: '💰' },
    };
    return zones[zone] || { label: zone, color: 'bg-muted text-muted-foreground', icon: '✈️' };
  };

  const nextImage = () => setImageIndex((prev) => (prev + 1) % post.images.length);
  const prevImage = () => setImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);

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
          "overflow-hidden shadow-md hover:shadow-xl transition-all duration-300",
          "border border-border/50 bg-card",
          className
        )}>
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={post.user.avatar} alt={post.user.displayName} />
                    <AvatarFallback>{post.user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-sm text-foreground">{post.user.displayName}</h4>
                      {post.user.isVerified && <Verified className="h-4 w-4 text-primary" />}
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
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content Body */}
            <div className="px-4 space-y-3">
              {post.title && <h3 className="text-lg font-bold leading-tight text-foreground">{post.title}</h3>}
              <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
            </div>

            {/* Tags and Travel Zone */}
            <div className="px-4 pt-3 flex flex-wrap items-center gap-2">
              {post.travelZone && (
                <Badge variant="outline" className={cn("text-xs font-medium", getTravelZoneInfo(post.travelZone).color)}>
                  <span className="mr-1.5">{getTravelZoneInfo(post.travelZone).icon}</span>
                  {getTravelZoneInfo(post.travelZone).label}
                </Badge>
              )}
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Route Summary */}
            {post.route && (
              <div className="mx-4 mt-4 p-3 bg-muted/50 rounded-xl border border-border/50">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg"><Route className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary">เส้นทางการเดินทาง</h4>
                    <p className="text-xs text-muted-foreground">แผนการเดินทางที่แนะนำ</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 mb-3 leading-relaxed">{post.route.summary}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2 p-2 bg-background/60 rounded-lg">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">ระยะเวลา</p>
                      <p className="font-medium text-foreground">{post.route.duration}</p>
                    </div>
                  </div>
                  {post.route.budget && (
                    <div className="flex items-center space-x-2 p-2 bg-background/60 rounded-lg">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">งบประมาณ</p>
                        <p className="font-medium text-accent-green">{post.route.budget}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Media */}
            {(post.images.length > 0 || post.videos.length > 0) && (
              <div className="relative mt-4 mx-2 rounded-lg overflow-hidden border border-border/50">
                <AnimatePresence mode="wait">
                  {post.images.length > 0 && (
                    <motion.div key={imageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative group">
                      <img src={post.images[imageIndex]} alt={`Post image ${imageIndex + 1}`} className="w-full max-h-[50vh] object-cover" />
                      {post.images.length > 1 && (
                        <>
                          <Button variant="secondary" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all" onClick={prevImage}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="secondary" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all" onClick={nextImage}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
                            {post.images.map((_, index) => (
                              <button key={index} className={cn("w-2 h-2 rounded-full transition-all duration-300", index === imageIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80")} onClick={() => setImageIndex(index)} />
                            ))}
                          </div>
                          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                            {imageIndex + 1} / {post.images.length}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {post.videos.length > 0 && (
                  <div className="w-full aspect-video bg-black flex items-center justify-center">
                    <Button variant="secondary" size="lg" className="bg-white/90 hover:bg-white text-black rounded-full h-14 w-14 p-0 shadow-lg">
                      <Play className="h-7 w-7 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Interactions */}
            <div className="p-4 space-y-4">
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">✨</span>
                  <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300">ให้คะแนนแรงบันดาลใจ</h4>
                </div>
                <InspirationRating postId={post.id} currentRating={post.userInspiration} averageRating={post.inspirationScore} totalVotes={post.inspirationCount} onRate={onInspire} showAverage showVoteCount className="justify-center" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setShowComments(!showComments)}>
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    <span className="text-xs font-medium">{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => onShare(post.id)}>
                    <Share2 className="h-4 w-4 mr-1.5" />
                    <span className="text-xs font-medium">{post.shares}</span>
                  </Button>
                  {(post.route || post.location) && (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setShowMapModal(true)}>
                      <MapPin className="h-4 w-4 mr-1.5" />
                      <span className="text-xs hidden sm:inline">แผนที่</span>
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={post.isSaved ? (currentLanguage === 'th' ? 'ยกเลิกการบันทึกโพสต์' : 'Unsave post') : (currentLanguage === 'th' ? 'บันทึกโพสต์' : 'Save post')}
                  className={cn("rounded-full", post.isSaved ? "text-primary bg-primary/10" : "text-muted-foreground")}
                  onClick={() => onSave(post.id)}
                >
                  <Bookmark className={cn("h-5 w-5", post.isSaved && "fill-current")} />
                </Button>
              </div>

              {/* Comment Section */}
              <AnimatePresence>
                {showComments && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                    <CommentSection postId={post.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
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