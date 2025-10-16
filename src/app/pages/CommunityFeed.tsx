import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OptimizedImage from '@/components/common/OptimizedImage';
import {
  TrendingUp,
  Users,
  Star,
  Filter,
  Search
} from 'lucide-react';
import { PostCard } from '@/components/community/PostCard';
import { useUIContext } from '@/shared/contexts/UIContext';
import { useFeed, useLikePost, useAddComment } from '@/shared/hooks/useCommunityQueries';
import { Input } from '@/components/ui/input';

interface CommunityFeedProps {
  currentLanguage: 'th' | 'en';
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  currentLanguage: _currentLanguage
}) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const { openCreatePostModal } = useUIContext();

  const { data: posts = [], isLoading: isLoadingFeed } = useFeed();
  const { mutate: likePost } = useLikePost();
  const { mutate: addComment } = useAddComment();

  // TODO: Implement filtering and search
  const filteredPosts = posts.filter(post =>
    searchQuery === '' ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
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
                      onLike={(postId) => likePost({ postId, userId: "123e4567-e89b-12d3-a456-426614174000" })}
                      onComment={(postId, content) => addComment({ postId, content, userId: "123e4567-e89b-12d3-a456-426614174000" })}
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
                    <Button onClick={openCreatePostModal}>
                      สร้างโพสต์แรก
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* TODO: Re-implement sidebar with Supabase data */}
            <div className="space-y-4">
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
      </Tabs>
    </div>
  );
};