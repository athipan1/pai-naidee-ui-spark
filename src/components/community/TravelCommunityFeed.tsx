import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  Users, 
  Star,
  Filter,
  Search,
  Compass,
  Award,
  Sparkles
} from 'lucide-react';
import { TravelStoryCard } from './TravelStoryCard';
import { CreatePost } from './CreatePost';
import { GroupCard } from './GroupCard';
import { UserPoints } from './UserPoints';
import { TravelZoneFilter } from './TravelZoneFilter';
import { FloatingPostButton } from './FloatingPostButton';
import { SeasonalThemeProvider, useSeasonalTheme } from './SeasonalThemeProvider';
import { useFeed, useLikePost, useAddComment, useCreatePost } from '@/shared/hooks/useCommunityQueries';
import { FeedFilter, TravelZone } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';

interface TravelCommunityFeedProps {
  currentLanguage: 'th' | 'en';
}

const TravelCommunityFeedContent: React.FC<TravelCommunityFeedProps> = ({
  currentLanguage
}) => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const { themeConfig } = useSeasonalTheme();

  const { data: posts = [], isLoading: isLoadingFeed, refetch: refresh } = useFeed();
  const { mutate: createPost, isPending: isCreatingPost } = useCreatePost();
  const { mutate: likePost } = useLikePost();
  const { mutate: addComment } = useAddComment();
  const [feedFilter, setFeedFilter] = useState<FeedFilter>({ type: 'all', sortBy: 'latest' });

  const handleFilterChange = (newFilter: Partial<FeedFilter>) => {
    setFeedFilter(prev => ({ ...prev, ...newFilter }));
  };

  const handleZoneChange = (zone: TravelZone | undefined) => {
    handleFilterChange({ travelZone: zone });
  };

  // Filter posts by search query (focusing on location-based posts with images/videos)
  const filteredPosts = posts.filter(post => {
    if (searchQuery === '') return true;
    
    const query = searchQuery.toLowerCase();
    const hasMediaContent = post.images.length > 0 || post.videos.length > 0;
    
    // Check if post has location and media content
    const matchesLocation = post.location?.name.toLowerCase().includes(query) ||
                           post.location?.province.toLowerCase().includes(query);
    
    // Also check content, title, and tags
    const matchesContent = post.content.toLowerCase().includes(query) ||
                          post.title?.toLowerCase().includes(query) ||
                          post.tags.some(tag => tag.toLowerCase().includes(query));
    
    // For location searches, prioritize posts with media content
    if (matchesLocation && hasMediaContent) return true;
    if (matchesContent) return true;
    
    return false;
  }).sort((a, b) => {
    // If searching for a location, sort by engagement (likes + comments)
    if (searchQuery !== '') {
      const engagementA = a.likes + a.comments;
      const engagementB = b.likes + b.comments;
      return engagementB - engagementA;
    }
    
    // Default sorting based on feed filter
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

  const filteredGroups = groups.filter(group =>
    searchQuery === '' ||
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Enhanced Header with Better Visual Hierarchy */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 mb-2"
        style={{ background: themeConfig.gradient }}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between text-white">
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center space-x-3 mb-2">
                <Compass className="h-8 w-8" />
                <span>ชุมชนนักเดินทาง</span>
                <span className="text-2xl">{themeConfig.icon}</span>
              </h1>
              <p className="text-white/90 text-base leading-relaxed max-w-2xl">
                แบ่งปันเรื่องราวและประสบการณ์การเดินทางของคุณ 
                พบปะเพื่อนใหม่ และค้นหาแรงบันดาลใจสำหรับการเดินทางครั้งต่อไป
              </p>
              
              {/* Key Features Highlight */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>เล่าเรื่องการเดินทาง</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 text-sm">
                  <Users className="h-4 w-4" />
                  <span>ค้นหาเพื่อนเดินทาง</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 text-sm">
                  <Award className="h-4 w-4" />
                  <span>สะสมคะแนนนักเดินทาง</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-2">
              {themeConfig.decorations.map((decoration, index) => (
                <motion.span
                  key={index}
                  className="text-3xl"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0] 
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                >
                  {decoration}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Enhanced Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute top-4 right-4 w-32 h-32 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-4 left-4 w-24 h-24 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' }}
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.2, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Enhanced Search & Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        {/* Improved Search Bar with Helper Text */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Search className="h-4 w-4" />
            <span>ค้นหาเรื่องราวการเดินทางที่น่าสนใจ</span>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="พิมพ์ชื่อสถานที่, ประเภทการเดินทาง, หรือคำค้นหาอื่นๆ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  // Keep search within community to show location-based posts
                  setActiveTab('feed');
                }
              }}
              className="pl-12 pr-4 py-4 text-base rounded-xl border-2 focus:border-primary/50 transition-colors bg-white/80 backdrop-blur-sm"
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </motion.button>
            )}
          </div>
          
          {/* Search Suggestions */}
          {searchQuery === '' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-wrap gap-2 mt-3"
            >
              <span className="text-xs text-muted-foreground">คำค้นหายอดนิยม:</span>
              {['เชียงใหม่', 'แบกเป้', 'เที่ยวงบน้อย', 'ทะเลใต้', 'ภูเขา'].map((suggestion) => (
                <Badge 
                  key={suggestion}
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setActiveTab('feed');
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </motion.div>
          )}
        </div>

        {/* Enhanced Travel Zone Filter with Better Labels */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Compass className="h-4 w-4" />
            <span>เลือกสไตล์การเดินทางที่ชอบ</span>
          </div>
          <TravelZoneFilter
            selectedZone={feedFilter.travelZone}
            onZoneChange={handleZoneChange}
          />
        </div>
      </motion.div>

      {/* Enhanced Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm">
            <TabsTrigger 
              value="feed" 
              className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <TrendingUp className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">ฟีดเรื่องราว</span>
                <span className="text-xs opacity-70 hidden sm:block">เรื่องราวการเดินทาง</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="groups" 
              className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Users className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">กลุ่มชุมชน</span>
                <span className="text-xs opacity-70 hidden sm:block">ค้นหาเพื่อนเดินทาง</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="points" 
              className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Award className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">คะแนนรางวัล</span>
                <span className="text-xs opacity-70 hidden sm:block">แลกของรางวัล</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Enhanced Feed Controls */}
                <Card className="border-2 border-primary/10 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Filter className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold">ตัวกรองเนื้อหา:</span>
                        </div>
                        
                        <Select 
                          value={feedFilter.type} 
                          onValueChange={(value: any) => handleFilterChange({ type: value })}
                        >
                          <SelectTrigger className="w-auto min-w-[160px] border-0 bg-muted/50 hover:bg-muted/70 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              <div className="flex items-center space-x-2">
                                <span>📚</span>
                                <span>โพสต์ทั้งหมด</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="following">
                              <div className="flex items-center space-x-2">
                                <span>👥</span>
                                <span>คนที่ติดตาม</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="groups">
                              <div className="flex items-center space-x-2">
                                <span>🎯</span>
                                <span>จากกลุ่ม</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="saved">
                              <div className="flex items-center space-x-2">
                                <span>🔖</span>
                                <span>ที่บันทึกไว้</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">เรียงตาม:</span>
                        <Select 
                          value={feedFilter.sortBy} 
                          onValueChange={(value: any) => handleFilterChange({ sortBy: value })}
                        >
                          <SelectTrigger className="w-auto min-w-[140px] border-0 bg-muted/50 hover:bg-muted/70 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="latest">
                              <div className="flex items-center space-x-2">
                                <span>🕐</span>
                                <span>ล่าสุด</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="popular">
                              <div className="flex items-center space-x-2">
                                <span>🔥</span>
                                <span>ยอดนิยม</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="trending">
                              <div className="flex items-center space-x-2">
                                <span>📈</span>
                                <span>กำลังฮิต</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="inspiration">
                              <div className="flex items-center space-x-2">
                                <span>✨</span>
                                <span>แรงบันดาลใจ</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts */}
                <AnimatePresence mode="popLayout">
                  {isLoadingFeed ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card className="animate-pulse">
                            <CardContent className="p-6">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="h-12 w-12 bg-muted rounded-full" />
                                <div className="space-y-2 flex-1">
                                  <div className="h-4 bg-muted rounded w-1/4" />
                                  <div className="h-3 bg-muted rounded w-1/6" />
                                </div>
                              </div>
                              <div className="space-y-2 mb-4">
                                <div className="h-4 bg-muted rounded w-3/4" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                              </div>
                              <div className="h-64 bg-muted rounded-xl" />
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : filteredPosts.length > 0 ? (
                    <div className="space-y-6">
                      {filteredPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -50 }}
                          transition={{ delay: index * 0.1 }}
                          layout
                        >
                          <TravelStoryCard
                            post={post}
                            onInspire={(postId) => likePost({ postId, userId: "123e4567-e89b-12d3-a456-426614174000" })}
                            onComment={(postId, content) => addComment({ postId, content, userId: "123e4567-e89b-12d3-a456-426614174000" })}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="p-12 text-center">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="mb-6"
                          >
                            <Sparkles className="h-20 w-20 text-primary mx-auto" />
                          </motion.div>
                          <h3 className="font-semibold mb-3 text-xl text-primary">
                            {searchQuery ? 'ไม่พบเรื่องราวที่ค้นหา' : 'เริ่มต้นการเดินทางของคุณ!'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                            {searchQuery
                              ? `ลองค้นหาด้วยคำอื่น หรือเริ่มสร้างเรื่องราวของคุณเอง`
                              : 'เป็นคนแรกที่แบ่งปันประสบการณ์การเดินทางที่น่าประทับใจ และสร้างแรงบันดาลใจให้กับนักเดินทางคนอื่นๆ'
                            }
                          </p>

                          {/* Action suggestions */}
                          <div className="space-y-3">
                            <Button
                              onClick={() => setShowCreatePost(true)}
                              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-6 py-3"
                              size="lg"
                            >
                              <Sparkles className="h-5 w-5 mr-2" />
                              {searchQuery ? 'สร้างเรื่องราวใหม่' : 'สร้างโพสต์แรก'}
                            </Button>

                            {searchQuery && (
                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setSearchQuery('')}
                                  className="text-sm"
                                >
                                  ดูโพสต์ทั้งหมด
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Help text */}
                          <div className="mt-8 p-4 bg-white/50 rounded-lg">
                            <h4 className="text-sm font-medium mb-2 text-primary">💡 เคล็ดลับการสร้างโพสต์ที่ดี:</h4>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>• เล่าเรื่องราวพร้อมรูปภาพสวยๆ</p>
                              <p>• แชร์เส้นทางและค่าใช้จ่าย</p>
                              <p>• ใส่แฮชแท็กที่เกี่ยวข้อง</p>
                              <p>• ให้คำแนะนำที่มีประโยชน์</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* TODO: Re-implement sidebar with Supabase data */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Enhanced Trending Topics */}
                <Card className="overflow-hidden bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-2 flex items-center space-x-2 text-primary">
                      <TrendingUp className="h-5 w-5" />
                      <span>หัวข้อฮิตวันนี้</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      แฮชแท็กที่นักเดินทางกำลังพูดถึงมากที่สุด
                    </p>
                    <div className="space-y-2">
                      {[
                        { tag: 'เชียงใหม่', count: '245 โพสต์' },
                        { tag: 'แบกเป้', count: '189 โพสต์' },
                        { tag: 'เที่ยวคนเดียว', count: '156 โพสต์' },
                        { tag: 'สายกิน', count: '134 โพสต์' },
                        { tag: 'ประหยัด', count: '98 โพสต์' }
                      ].map((item, index) => (
                        <motion.div
                          key={item.tag}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div
                            className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all group"
                            onClick={() => setSearchQuery(item.tag)}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">#</span>
                              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                {item.tag}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {item.count}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Travel Tips Section */}
                <Card className="overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/50">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-2 flex items-center space-x-2 text-orange-700 dark:text-orange-300">
                      <Sparkles className="h-5 w-5" />
                      <span>เคล็ดลับการเดินทาง</span>
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="text-orange-500 mt-0.5">💡</span>
                        <p className="text-orange-700 dark:text-orange-300">
                          แชร์เรื่องราวพร้อมรูปภาพคุณภาพสูงจะได้คะแนนมากขึ้น
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-orange-500 mt-0.5">🗺️</span>
                        <p className="text-orange-700 dark:text-orange-300">
                          เพิ่มแผนที่และเส้นทางเพื่อช่วยนักเดินทางคนอื่น
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-orange-500 mt-0.5">🏷️</span>
                        <p className="text-orange-700 dark:text-orange-300">
                          ใช้แฮชแท็กที่เกี่ยวข้องเพื่อให้คนอื่นค้นหาเจอได้ง่าย
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Create Post Modal */}
      <CreatePost
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onSubmit={createPost}
        isSubmitting={isCreatingPost}
      />

      {/* Floating Post Button */}
      <FloatingPostButton
        onCreatePost={() => setShowCreatePost(true)}
      />
    </div>
  );
};

// Main component with seasonal theme provider
export const TravelCommunityFeed: React.FC<TravelCommunityFeedProps> = (props) => {
  return (
    <SeasonalThemeProvider>
      <TravelCommunityFeedContent {...props} />
    </SeasonalThemeProvider>
  );
};