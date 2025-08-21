import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ResponsiveContainer } from '@/components/ui/responsive';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
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
  Clock,
  SlidersHorizontal,
  PlusSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TravelStoryCard } from './TravelStoryCard';
import { CreatePost } from './CreatePost';
import { FloatingPostButton } from './FloatingPostButton';
import { SeasonalThemeProvider, useSeasonalTheme } from './SeasonalThemeProvider';
import { useCommunity } from '@/shared/hooks/useCommunity';
import { FeedFilter, TravelZone, Post } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';
import { useMediaQuery } from '@/shared/hooks/use-media-query';

interface UnifiedTravelCommunityFeedProps {
  initialViewMode?: 'story' | 'grid';
}

type ViewMode = 'story' | 'grid';

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

// Sub-component for filter controls to be reused in desktop view and mobile sheet
const FilterControls: React.FC<{
  feedFilter: FeedFilter;
  handleFilterChange: (newFilter: Partial<FeedFilter>) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  className?: string;
}> = ({ feedFilter, handleFilterChange, searchQuery, setSearchQuery, className }) => {
  const { t } = useTranslation();
  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('communityFeed.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background/80 backdrop-blur-sm border-border/30 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          value={feedFilter.sortBy}
          onValueChange={(value) => handleFilterChange({ sortBy: value as 'latest' | 'popular' | 'trending' | 'inspiration' })}
        >
          <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/30 rounded-lg">
            <SelectValue placeholder={t('communityFeed.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">{t('communityFeed.latest')}</SelectItem>
            <SelectItem value="popular">{t('communityFeed.popular')}</SelectItem>
            <SelectItem value="trending">{t('communityFeed.trending')}</SelectItem>
            <SelectItem value="inspiration">{t('communityFeed.inspiring')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={feedFilter.travelZone || 'all'}
          onValueChange={(value) => handleFilterChange({ travelZone: value === 'all' ? undefined : value as TravelZone })}
        >
          <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/30 rounded-lg">
            <SelectValue placeholder={t('communityFeed.category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('communityFeed.allTypes')}</SelectItem>
            {travelZones.map((zone) => (
              <SelectItem key={zone.value} value={zone.value}>{zone.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Animated View Mode Toggle
const ViewModeToggle: React.FC<{
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}> = ({ viewMode, setViewMode }) => {
  const { t } = useTranslation();
  return (
    <div className="relative flex items-center bg-muted/60 rounded-full p-1 border border-border/30" role="group">
      {['story', 'grid'].map((mode) => (
        <Button
          key={mode}
          variant="ghost"
          size="sm"
          onClick={() => setViewMode(mode as ViewMode)}
          className={cn(
            "relative z-10 w-full rounded-full transition-colors duration-200 px-4",
            viewMode !== mode && "hover:bg-transparent"
          )}
          aria-label={t(mode === 'story' ? 'communityFeed.storyView' : 'communityFeed.gridView')}
        >
          <span className="flex items-center">
            {mode === 'story' ? <AlignLeft className="w-4 h-4 mr-1.5" /> : <Grid3X3 className="w-4 h-4 mr-1.5" />}
            {t(mode === 'story' ? 'communityFeed.story' : 'communityFeed.grid')}
          </span>
        </Button>
      ))}
    <motion.div
      layoutId="view-mode-active-bg"
      className="absolute inset-0 z-0 bg-primary h-full rounded-full"
      initial={{ x: viewMode === 'story' ? '0%' : '100%' }}
      animate={{ x: viewMode === 'story' ? '0%' : '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ width: '50%' }}
    />
  </div>
);

// Refactored Header Component
const FeedHeader: React.FC<{
  themeConfig: any;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  feedFilter: FeedFilter;
  handleFilterChange: (newFilter: Partial<FeedFilter>) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onShowCreatePost: () => void;
}> = ({ themeConfig, viewMode, setViewMode, feedFilter, handleFilterChange, searchQuery, setSearchQuery, onShowCreatePost }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur-lg sticky top-0 z-20 border-b border-border/50 rounded-b-xl shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${themeConfig.colors.primary}08 0%, ${themeConfig.colors.secondary}08 100%)`,
      }}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-foreground">
              {t('communityFeed.headerTitle')}
            </h1>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          {isMobile ? (
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={onShowCreatePost}>
                <PlusSquare className="h-4 w-4 mr-2" />
                {t('communityFeed.createPostButton')}
              </Button>
              <Sheet open={isFilterSheetOpen} onOpenChange={setFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9" aria-label={t('communityFeed.filters')}>
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{t('communityFeed.filterAndSearch')}</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <FilterControls {...{ feedFilter, handleFilterChange, searchQuery, setSearchQuery }} />
                  </div>
                  <SheetFooter>
                    <Button onClick={() => setFilterSheetOpen(false)} className="w-full">
                      {t('communityFeed.viewResults')}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex items-center gap-4">
               <ViewModeToggle {...{ viewMode, setViewMode }} />
               <Button variant="primary" onClick={onShowCreatePost}>
                  <PlusSquare className="h-4 w-4 mr-2" />
                  {t('communityFeed.createPostButton')}
                </Button>
            </div>
          )}
        </div>

        <Tabs
          value={feedFilter.type}
          onValueChange={(value) => handleFilterChange({ type: value as 'all' | 'following' | 'groups' | 'saved' })}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 bg-background/60 backdrop-blur-sm border border-border/30">
            <TabsTrigger value="all" className="text-xs">{t('communityFeed.all')}</TabsTrigger>
            <TabsTrigger value="following" className="text-xs">{t('communityFeed.following')}</TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">{t('communityFeed.groups')}</TabsTrigger>
            <TabsTrigger value="saved" className="text-xs">{t('communityFeed.saved')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {isMobile ? (
          <div className="flex items-center justify-center">
            <ViewModeToggle {...{ viewMode, setViewMode }} />
          </div>
        ) : (
          <FilterControls {...{ feedFilter, handleFilterChange, searchQuery, setSearchQuery }} />
        )}

        {(feedFilter.travelZone || feedFilter.sortBy !== 'latest') && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">{t('communityFeed.activeFilters')}</span>
            {feedFilter.travelZone && (
              <Badge variant="secondary" className="text-xs bg-primary/10 border-primary/20">
                {travelZones.find(z => z.value === feedFilter.travelZone)?.label}
              </Badge>
            )}
            {feedFilter.sortBy !== 'latest' && (
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                {t(`communityFeed.${feedFilter.sortBy}`)}
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};


const UnifiedTravelCommunityFeedContent: React.FC<UnifiedTravelCommunityFeedProps> = ({
  initialViewMode = 'story'
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { themeConfig } = useSeasonalTheme();
  const { t } = useTranslation();

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
        case 'popular': return (b.likes + b.comments) - (a.likes + a.comments);
        case 'trending': return b.shares - a.shares;
        case 'inspiration': return b.inspirationScore - a.inspirationScore;
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [posts, searchQuery, feedFilter.sortBy]);

  const getPostLayout = (post: Post) => {
    const hasRichMedia = post.images.length > 0 || post.videos.length > 0;
    const isTextHeavy = post.content.length > 300;
    if (viewMode === 'grid') return hasRichMedia ? 'grid-visual' : 'grid-text';
    return isTextHeavy || !hasRichMedia ? 'story-full' : 'story-compact';
  };

  return (
    <ResponsiveContainer maxWidth="2xl" className="space-y-6">
      <FeedHeader
        themeConfig={themeConfig}
        viewMode={viewMode}
        setViewMode={setViewMode}
        feedFilter={feedFilter}
        handleFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onShowCreatePost={() => setShowCreatePost(true)}
      />

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
                {t('communityFeed.noStories')}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('communityFeed.noStoriesDescription')}
              </p>
              <Button 
                onClick={() => setShowCreatePost(true)}
                className="mt-4 rounded-xl shadow-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t('communityFeed.shareYourStory')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <FloatingPostButton
        onClick={() => setShowCreatePost(true)}
        isVisible={!showCreatePost}
      />

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <CreatePost
            open={showCreatePost}
            onOpenChange={setShowCreatePost}
            onSubmit={createPost}
            isSubmitting={isCreatingPost}
          />
        )}
      </AnimatePresence>
    </ResponsiveContainer>
  );
};

// Grid Post Card Component for visual-first display
interface GridPostCardProps {
  post: Post;
  layout: string;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
}

const GridPostCard: React.FC<GridPostCardProps> = ({
  post,
  onSave,
  onShare,
}) => {
  const [showMore, setShowMore] = useState(false);
  const hasMedia = post.images.length > 0 || post.videos.length > 0;
  const { themeConfig } = useSeasonalTheme();
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden rounded-2xl shadow-md border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card group">
      {/* Media Preview */}
      {hasMedia && (
        <div className="relative aspect-square overflow-hidden">
          <img
            src={post.images[0] || '/placeholder-image.jpg'}
            alt={post.title || 'Travel photo'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium">
              +{post.images.length}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <CardContent className="p-3 space-y-2">
        {/* User Info & Title */}
        <div>
           {post.title && <h3 className="font-semibold text-sm text-foreground line-clamp-1">{post.title}</h3>}
          <div className="flex items-center space-x-2 mt-1">
            <img src={post.user.avatar} alt={post.user.displayName} className="w-5 h-5 rounded-full object-cover"/>
            <p className="text-xs text-muted-foreground truncate">{post.user.displayName}</p>
          </div>
        </div>

        {/* Location */}
        {post.location && (
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0" />
            <span className="truncate">{post.location.name}, {post.location.province}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center -ml-2">
            <button type="button" aria-label={t('communityFeed.likePost')} className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md">
              <Heart className="h-4 w-4" />
              <span>{post.likes}</span>
            </button>
            <button type="button" aria-label={t('communityFeed.commentOnPost')} className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors p-2 rounded-md">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments}</span>
            </button>
            <button type="button" aria-label={t('communityFeed.sharePost')} onClick={() => onShare(post.id)} className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-accent-green transition-colors p-2 rounded-md">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <button 
            type="button"
            aria-label={t(post.isSaved ? 'communityFeed.unsavePost' : 'communityFeed.savePost')}
            onClick={() => onSave(post.id)}
            className={cn(
              "p-2 rounded-full transition-colors",
              post.isSaved
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            )}
          >
            <Bookmark className={cn("h-4 w-4", post.isSaved && "fill-current")} />
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