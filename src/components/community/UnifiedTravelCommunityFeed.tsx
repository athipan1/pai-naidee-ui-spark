import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ResponsiveContainer } from '@/components/ui/responsive';
import { 
  TrendingUp, 
  Search,
  Sparkles,
  Grid3X3,
  AlignLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Clock
} from 'lucide-react';
import { TravelStoryCard } from './TravelStoryCard';
import { CreatePost } from './CreatePost';
import { FloatingPostButton } from './FloatingPostButton';
import { SeasonalThemeProvider, useSeasonalTheme } from './SeasonalThemeProvider';
import { useCommunity } from '@/shared/hooks/useCommunity';
import { FeedFilter, TravelZone, Post } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';

interface UnifiedTravelCommunityFeedProps {
  currentLanguage: 'th' | 'en';
  initialViewMode?: 'story' | 'grid';
}

type ViewMode = 'story' | 'grid';

const UnifiedTravelCommunityFeedContent: React.FC<UnifiedTravelCommunityFeedProps> = ({
  currentLanguage,
  initialViewMode = 'story'
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { themeConfig } = useSeasonalTheme();

  const {
    posts,
    isLoadingFeed,
    feedFilter,
    setFeedFilter,
    createPost,
    isCreatingPost,
    savePost,
    sharePost,
    ratePost,
    addComment,
  } = useCommunity();

  const handleFilterChange = (newFilter: Partial<FeedFilter>) => {
    setFeedFilter({ ...feedFilter, ...newFilter });
  };

  // Filter posts by search query
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (searchQuery === '') return true;
      
      const query = searchQuery.toLowerCase();
      const matchesLocation = post.location?.name.toLowerCase().includes(query) ||
                             post.location?.province.toLowerCase().includes(query);
      const matchesContent = post.content.toLowerCase().includes(query) ||
                            post.title?.toLowerCase().includes(query) ||
                            post.tags.some(tag => tag.toLowerCase().includes(query));
      
      return matchesLocation || matchesContent;
    }).sort((a, b) => {
      switch (feedFilter.sortBy) {
        case 'popular':
          return (b.likes + b.comments) - (a.likes + a.comments);
        case 'trending':
          return b.shares - a.shares;
        case 'inspiration':
          return b.inspirationScore - a.inspirationScore;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [posts, searchQuery, feedFilter.sortBy]);

  // Smart content adaptation: determine layout based on content
  const getPostLayout = (post: Post) => {
    const hasImages = post.images.length > 0;
    const hasVideos = post.videos.length > 0;
    const hasRichMedia = hasImages || hasVideos;
    const isTextHeavy = post.content.length > 300;
    
    if (viewMode === 'grid') {
      return hasRichMedia ? 'grid-visual' : 'grid-text';
    } else {
      return isTextHeavy || !hasRichMedia ? 'story-full' : 'story-compact';
    }
  };

  const travelZones: { value: TravelZone; label: string }[] = [
    { value: 'adventure', label: 'สายผจญภัย' },
    { value: 'chill', label: 'สายชิล' },
    { value: 'family', label: 'ครอบครัว' },
    { value: 'solo', label: 'เที่ยวคนเดียว' },
    { value: 'foodie', label: 'สายกิน' },
    { value: 'culture', label: 'วัฒนธรรม' },
    { value: 'nature', label: 'ธรรมชาติ' },
    { value: 'budget', label: 'ประหยัด' },
  ];

  return (
    <ResponsiveContainer maxWidth="2xl" className="space-y-6">
      {/* Unified Header with View Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/80 backdrop-blur-lg sticky top-0 z-20 border-b border-border/50 p-4 space-y-4 rounded-b-xl shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${themeConfig.colors.primary}08 0%, ${themeConfig.colors.secondary}08 100%)`,
        }}
      >
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-foreground">
              {currentLanguage === 'th' ? 'ชุมชนนักเดินทาง' : 'Travel Community'}
            </h1>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          
          <div className="flex border border-border/30 rounded-xl bg-background/50 backdrop-blur-sm p-1" role="group">
            <Button
              variant={viewMode === 'story' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('story')}
              className={cn(
                "rounded-lg transition-all duration-200",
                viewMode === 'story' 
                  ? "shadow-md bg-primary text-primary-foreground" 
                  : "hover:bg-muted/50"
              )}
              aria-label={currentLanguage === 'th' ? 'มุมมองเรื่องราว' : 'Story view'}
            >
              <AlignLeft className="w-4 h-4 mr-1" />
              {currentLanguage === 'th' ? 'เรื่องราว' : 'Story'}
            </Button>
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-lg transition-all duration-200",
                viewMode === 'grid' 
                  ? "shadow-md bg-primary text-primary-foreground" 
                  : "hover:bg-muted/50"
              )}
              aria-label={currentLanguage === 'th' ? 'มุมมองตาราง' : 'Grid view'}
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              {currentLanguage === 'th' ? 'ตาราง' : 'Grid'}
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs 
          value={feedFilter.type} 
          onValueChange={(value) => handleFilterChange({ type: value as 'all' | 'following' | 'groups' | 'saved' })}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 bg-background/60 backdrop-blur-sm border border-border/30">
            <TabsTrigger value="all" className="text-xs">
              {currentLanguage === 'th' ? 'ทั้งหมด' : 'All'}
            </TabsTrigger>
            <TabsTrigger value="following" className="text-xs">
              {currentLanguage === 'th' ? 'ติดตาม' : 'Following'}
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">
              {currentLanguage === 'th' ? 'กลุ่ม' : 'Groups'}
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-xs">
              {currentLanguage === 'th' ? 'บันทึก' : 'Saved'}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={currentLanguage === 'th' ? 'ค้นหาสถานที่ เรื่องราว หรือแท็ก...' : 'Search places, stories, or tags...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/80 backdrop-blur-sm border-border/30 rounded-xl"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <Select 
              value={feedFilter.sortBy}
              onValueChange={(value) => handleFilterChange({ sortBy: value as 'latest' | 'popular' | 'trending' | 'inspiration' })}
            >
              <SelectTrigger className="w-32 bg-background/60 backdrop-blur-sm border-border/30 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">
                  {currentLanguage === 'th' ? 'ล่าสุด' : 'Latest'}
                </SelectItem>
                <SelectItem value="popular">
                  {currentLanguage === 'th' ? 'ยอดนิยม' : 'Popular'}
                </SelectItem>
                <SelectItem value="trending">
                  {currentLanguage === 'th' ? 'กำลังมาแรง' : 'Trending'}
                </SelectItem>
                <SelectItem value="inspiration">
                  {currentLanguage === 'th' ? 'แรงบันดาลใจ' : 'Inspiring'}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={feedFilter.travelZone || 'all'}
              onValueChange={(value) => 
                handleFilterChange({ 
                  travelZone: value === 'all' ? undefined : value as TravelZone 
                })
              }
            >
              <SelectTrigger className="w-36 bg-background/60 backdrop-blur-sm border-border/30 rounded-lg">
                <SelectValue placeholder={currentLanguage === 'th' ? 'ประเภท' : 'Category'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {currentLanguage === 'th' ? 'ทุกประเภท' : 'All Types'}
                </SelectItem>
                {travelZones.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(feedFilter.travelZone || feedFilter.sortBy !== 'latest') && (
            <div className="flex items-center space-x-2 flex-wrap">
              {feedFilter.travelZone && (
                <Badge variant="secondary" className="text-xs bg-primary/10 border-primary/20">
                  {travelZones.find(z => z.value === feedFilter.travelZone)?.label}
                </Badge>
              )}
              {feedFilter.sortBy !== 'latest' && (
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {feedFilter.sortBy === 'popular' ? (currentLanguage === 'th' ? 'ยอดนิยม' : 'Popular') :
                   feedFilter.sortBy === 'trending' ? (currentLanguage === 'th' ? 'กำลังมาแรง' : 'Trending') : 
                   (currentLanguage === 'th' ? 'แรงบันดาลใจ' : 'Inspiring')}
                </Badge>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Posts Feed with Smart Layout */}
      <div className="px-2 pb-20">
        <AnimatePresence mode="popLayout">
          {isLoadingFeed ? (
            <div className={cn(
              "space-y-6",
              viewMode === 'grid' && "grid grid-cols-1 sm:grid-cols-2 gap-4 space-y-0"
            )}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    viewMode === 'grid' && "col-span-1"
                  )}
                >
                  <Card className="animate-pulse overflow-hidden rounded-2xl shadow-sm border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-10 w-10 bg-muted rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 bg-muted rounded w-1/3" />
                          <div className="h-2 bg-muted rounded w-1/4" />
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                      <div className={cn(
                        "bg-muted rounded-xl",
                        viewMode === 'grid' ? "h-32" : "h-48"
                      )} />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className={cn(
              viewMode === 'story' 
                ? "space-y-6" 
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            )}>
              {filteredPosts.map((post, index) => {
                const layout = getPostLayout(post);
                
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ 
                      delay: index * 0.05,
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    layout
                    className={cn(
                      viewMode === 'grid' && "col-span-1"
                    )}
                  >
                    {viewMode === 'story' ? (
                      <TravelStoryCard
                        post={post}
                        onInspire={ratePost}
                        onSave={savePost}
                        onShare={sharePost}
                        onComment={(postId, content) => addComment({ postId, content })}
                        className="rounded-2xl shadow-lg border-border/50 overflow-hidden transition-shadow duration-300 hover:shadow-xl"
                      />
                    ) : (
                      <GridPostCard
                        post={post}
                        layout={layout}
                        onSave={savePost}
                        onShare={sharePost}
                        currentLanguage={currentLanguage}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-4"
            >
              <div className="text-6xl">🗺️</div>
              <h3 className="text-lg font-medium text-foreground">
                {currentLanguage === 'th' ? 'ยังไม่มีเรื่องราวการเดินทาง' : 'No travel stories yet'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {currentLanguage === 'th' 
                  ? 'เริ่มต้นการเดินทางครั้งแรกของคุณและแบ่งปันประสบการณ์กับชุมชน' 
                  : 'Start your first journey and share your experiences with the community'}
              </p>
              <Button 
                onClick={() => setShowCreatePost(true)}
                className="mt-4 rounded-xl shadow-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {currentLanguage === 'th' ? 'แบ่งปันเรื่องราว' : 'Share Your Story'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <FloatingPostButton
        onClick={() => setShowCreatePost(true)}
        isVisible={!showCreatePost}
        currentLanguage={currentLanguage}
      />

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSubmit={createPost}
          isLoading={isCreatingPost}
          currentLanguage={currentLanguage}
        />
      )}
    </ResponsiveContainer>
  );
};

// Grid Post Card Component for visual-first display
interface GridPostCardProps {
  post: Post;
  layout: string;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
  currentLanguage: 'th' | 'en';
}

const GridPostCard: React.FC<GridPostCardProps> = ({
  post,
  onSave,
  onShare,
  currentLanguage
}) => {
  const [showMore, setShowMore] = useState(false);
  const hasMedia = post.images.length > 0 || post.videos.length > 0;

  return (
    <Card className="overflow-hidden rounded-2xl shadow-lg border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
      {/* Media Preview */}
      {hasMedia && (
        <div className="relative aspect-square overflow-hidden">
          <img
            src={post.images[0] || '/placeholder-image.jpg'}
            alt={post.title || 'Travel photo'}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {post.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
              +{post.images.length - 1}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* User Info */}
        <div className="flex items-center space-x-2">
          <img
            src={post.user.avatar}
            alt={post.user.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {post.user.displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              {new Date(post.createdAt).toLocaleDateString(currentLanguage === 'th' ? 'th-TH' : 'en-US')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {post.title && (
            <h3 className="font-medium text-sm text-foreground line-clamp-1">
              {post.title}
            </h3>
          )}
          <p className={cn(
            "text-xs text-muted-foreground",
            showMore ? "" : "line-clamp-2"
          )}>
            {post.content}
          </p>
          {post.content.length > 100 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-xs text-primary hover:underline"
            >
              {showMore 
                ? (currentLanguage === 'th' ? 'ย่อ' : 'Show less')
                : (currentLanguage === 'th' ? 'ดูเพิ่ม' : 'Show more')
              }
            </button>
          )}
        </div>

        {/* Location */}
        {post.location && (
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{post.location.name}, {post.location.province}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
              <Heart className="h-4 w-4" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-blue-500 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments}</span>
            </button>
            <button 
              onClick={() => onShare(post.id)}
              className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-green-500 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={() => onSave(post.id)}
            className="text-muted-foreground hover:text-amber-500 transition-colors"
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main export component with seasonal theme provider
export const UnifiedTravelCommunityFeed: React.FC<UnifiedTravelCommunityFeedProps> = (props) => {
  return (
    <SeasonalThemeProvider>
      <UnifiedTravelCommunityFeedContent {...props} />
    </SeasonalThemeProvider>
  );
};