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
import { useCommunity } from '@/shared/hooks/useCommunity';
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

  const {
    posts,
    isLoadingFeed,
    feedFilter,
    setFeedFilter,
    groups,
    isLoadingGroups,
    userPoints,
    isLoadingPoints,
    createPost,
    isCreatingPost,
    likePost,
    savePost,
    sharePost,
    ratePost,
    addComment,
    joinGroup,
    isJoiningGroup
  } = useCommunity();

  const handleFilterChange = (newFilter: Partial<FeedFilter>) => {
    setFeedFilter({ ...feedFilter, ...newFilter });
  };

  const handleZoneChange = (zone: TravelZone | undefined) => {
    handleFilterChange({ travelZone: zone });
  };

  const filteredPosts = posts.filter(post => 
    searchQuery === '' || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    post.location?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    searchQuery === '' ||
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Seasonal Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: themeConfig.gradient }}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between text-white">
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <Compass className="h-6 w-6" />
                <span>ชุมชนนักเดินทาง</span>
                <span className="text-lg">{themeConfig.icon}</span>
              </h1>
              <p className="text-white/90 text-sm mt-1">
                แบ่งปันเรื่องราวและประสบการณ์การเดินทางของคุณ
              </p>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              {themeConfig.decorations.map((decoration, index) => (
                <motion.span
                  key={index}
                  className="text-2xl"
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
        
        {/* Decorative background elements */}
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
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาโพสต์, เรื่องราว, หรือสถานที่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl border-2 focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Travel Zone Filter */}
        <TravelZoneFilter
          selectedZone={feedFilter.travelZone}
          onZoneChange={handleZoneChange}
        />
      </motion.div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="feed" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Feed</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>กลุ่ม</span>
            </TabsTrigger>
            <TabsTrigger value="points" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>คะแนน</span>
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Feed Controls */}
                <Card className="border-2 border-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">แสดง:</span>
                        
                        <Select 
                          value={feedFilter.type} 
                          onValueChange={(value: any) => handleFilterChange({ type: value })}
                        >
                          <SelectTrigger className="w-auto border-0 bg-muted/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">โพสต์ทั้งหมด</SelectItem>
                            <SelectItem value="following">คนที่ติดตาม</SelectItem>
                            <SelectItem value="groups">จากกลุ่ม</SelectItem>
                            <SelectItem value="saved">ที่บันทึกไว้</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Select 
                        value={feedFilter.sortBy} 
                        onValueChange={(value: any) => handleFilterChange({ sortBy: value })}
                      >
                        <SelectTrigger className="w-auto border-0 bg-muted/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest">ล่าสุด</SelectItem>
                          <SelectItem value="popular">ยอดนิยม</SelectItem>
                          <SelectItem value="trending">กำลังฮิต</SelectItem>
                          <SelectItem value="inspiration">แรงบันดาลใจ</SelectItem>
                        </SelectContent>
                      </Select>
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
                            onInspire={ratePost}
                            onSave={savePost}
                            onShare={sharePost}
                            onComment={(postId, content) => addComment({ postId, content })}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="border-2 border-dashed border-muted">
                        <CardContent className="p-12 text-center">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          </motion.div>
                          <h3 className="font-medium mb-2 text-lg">ไม่พบโพสต์</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            {searchQuery ? 'ลองค้นหาด้วยคำอื่น หรือ' : 'เป็นคนแรกที่สร้างโพสต์!'}
                          </p>
                          <Button 
                            onClick={() => setShowCreatePost(true)}
                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            สร้างโพสต์แรก
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* User Points */}
                {userPoints && !isLoadingPoints && (
                  <UserPoints userPoints={userPoints} />
                )}

                {/* Quick Groups */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3 flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>กลุ่มแนะนำ</span>
                    </h3>
                    <div className="space-y-3">
                      {groups.slice(0, 3).map((group, index) => (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <img 
                            src={group.coverImage} 
                            alt={group.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{group.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {group.memberCount.toLocaleString('th-TH')} สมาชิก
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab('groups')}
                    >
                      ดูกลุ่มทั้งหมด
                    </Button>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3 flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>หัวข้อฮิต</span>
                    </h3>
                    <div className="space-y-2">
                      {['เชียงใหม่', 'แบกเป้', 'เที่ยวคนเดียว', 'สายกิน', 'ประหยัด'].map((tag, index) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-muted w-full justify-start transition-colors"
                            onClick={() => setSearchQuery(tag)}
                          >
                            #{tag}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingGroups ? (
                Array.from({ length: 6 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="animate-pulse">
                      <div className="h-32 bg-muted" />
                      <CardContent className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                        <div className="h-8 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : filteredGroups.length > 0 ? (
                filteredGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GroupCard
                      group={group}
                      onJoin={joinGroup}
                      onView={(groupId) => console.log('View group:', groupId)}
                      isJoining={isJoiningGroup}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="border-2 border-dashed border-muted">
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">ไม่พบกลุ่ม</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'ยังไม่มีกลุ่มในระบบ'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isLoadingPoints ? (
                <Card className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-1/3 mb-6" />
                    <div className="h-20 bg-muted rounded-full w-20 mx-auto mb-4" />
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-6" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-muted rounded" />
                      <div className="h-16 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ) : userPoints ? (
                <UserPoints userPoints={userPoints} />
              ) : null}

              {/* Points Information */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-medium">วิธีการสะสมคะแนน</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-blue-500" />
                        <span>โพสต์เรื่องราวที่ได้รับดาวแรงบันดาลใจ</span>
                      </div>
                      <Badge variant="secondary">50-100 คะแนน</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-green-500" />
                        <span>คอมเมนต์ที่ได้รับไลก์</span>
                      </div>
                      <Badge variant="secondary">10-25 คะแนน</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-purple-500" />
                        <span>แบ่งปันเส้นทางการเดินทาง</span>
                      </div>
                      <Badge variant="secondary">25-50 คะแนน</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-orange-500" />
                        <span>เชิญเพื่อนเข้าร่วม</span>
                      </div>
                      <Badge variant="secondary">25 คะแนน</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
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