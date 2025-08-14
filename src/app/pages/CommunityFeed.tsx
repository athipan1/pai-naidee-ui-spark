import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OptimizedImage from '@/components/common/OptimizedImage';
import { 
  PlusCircle, 
  TrendingUp, 
  Users, 
  Star,
  Filter,
  Search
} from 'lucide-react';
import { PostCard } from '@/components/community/PostCard';
import { CreatePost } from '@/components/community/CreatePost';
import { GroupCard } from '@/components/community/GroupCard';
import { UserPoints } from '@/components/community/UserPoints';
import { useCommunity } from '@/shared/hooks/useCommunity';
import { FeedFilter } from '@/shared/types/community';
import { Input } from '@/components/ui/input';

interface CommunityFeedProps {
  currentLanguage: 'th' | 'en';
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  currentLanguage: _currentLanguage
}) => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');

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
    addComment,
    joinGroup,
    isJoiningGroup
  } = useCommunity();

  const handleFilterChange = (newFilter: Partial<FeedFilter>) => {
    setFeedFilter({ ...feedFilter, ...newFilter });
  };

  const filteredPosts = posts.filter(post => 
    searchQuery === '' || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ชุมชนนักเดินทาง</h1>
          <p className="text-muted-foreground">
            แบ่งปันเรื่องราวและประสบการณ์การเดินทางของคุณ
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCreatePost(true)}
          className="flex items-center space-x-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>สร้างโพสต์</span>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาโพสต์, กลุ่ม, หรือสถานที่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Feed</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>กลุ่ม</span>
          </TabsTrigger>
          <TabsTrigger value="points" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>คะแนน</span>
          </TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Feed Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">แสดง:</span>
                      
                      <Select 
                        value={feedFilter.type} 
                        onValueChange={(value: string) => handleFilterChange({ type: value })}
                      >
                        <SelectTrigger className="w-auto">
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
                      onValueChange={(value: string) => handleFilterChange({ sortBy: value })}
                    >
                      <SelectTrigger className="w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">ล่าสุด</SelectItem>
                        <SelectItem value="popular">ยอดนิยม</SelectItem>
                        <SelectItem value="trending">กำลังฮิต</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Posts */}
              {isLoadingFeed ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="h-12 w-12 bg-muted rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded w-1/4" />
                            <div className="h-3 bg-muted rounded w-1/6" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                        <div className="h-48 bg-muted rounded mt-4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={likePost}
                      onSave={savePost}
                      onShare={sharePost}
                      onComment={(postId, content) => addComment({ postId, content })}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">ไม่พบโพสต์</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery ? 'ลองค้นหาด้วยคำอื่น' : 'เป็นคนแรกที่สร้างโพสต์!'}
                    </p>
                    <Button onClick={() => setShowCreatePost(true)}>
                      สร้างโพสต์แรก
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* User Points */}
              {userPoints && !isLoadingPoints && (
                <UserPoints userPoints={userPoints} />
              )}

              {/* Quick Groups */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>กลุ่มแนะนำ</span>
                  </h3>
                  <div className="space-y-3">
                    {groups.slice(0, 3).map((group) => (
                      <div 
                        key={group.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      >
                        <OptimizedImage 
                          src={group.coverImage} 
                          alt={group.name}
                          className="h-10 w-10 rounded object-cover"
                          width={40}
                          height={40}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{group.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {group.memberCount.toLocaleString()} สมาชิก
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => setActiveTab('groups')}
                  >
                    ดูกลุ่มทั้งหมด
                  </Button>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>หัวข้อฮิต</span>
                  </h3>
                  <div className="space-y-2">
                    {['เชียงใหม่', 'แบกเป้', 'เที่ยวคนเดียว', 'สายกิน', 'ประหยัด'].map((tag) => (
                      <Badge 
                        key={tag}
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted w-full justify-start"
                        onClick={() => setSearchQuery(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingGroups ? (
              Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-muted" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-8 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={joinGroup}
                  onView={(groupId) => console.log('View group:', groupId)}
                  isJoining={isJoiningGroup}
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card>
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
                      <span>โพสต์เรื่องราวที่มีคุณภาพ</span>
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
                      <span>ได้รับไลก์จากโพสต์</span>
                    </div>
                    <Badge variant="secondary">5 คะแนน</Badge>
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

      {/* Create Post Modal */}
      <CreatePost
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onSubmit={createPost}
        isSubmitting={isCreatingPost}
      />
    </div>
  );
};