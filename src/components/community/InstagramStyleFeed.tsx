import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostProvider } from '@/shared/contexts/PostContext';
import { MediaProvider } from '@/shared/contexts/MediaProvider';
import { PostFeed } from '@/components/community/PostFeed';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { FeedFilter, TravelZone } from '@/shared/types/community';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface InstagramStyleFeedProps {
  /** Initial filter */
  initialFilter?: FeedFilter;
  /** Auth token */
  authToken?: string | null;
}

export const InstagramStyleFeed: React.FC<InstagramStyleFeedProps> = ({
  initialFilter = { type: 'all', sortBy: 'latest' },
  authToken = null
}) => {
  const [feedFilter, setFeedFilter] = useState<FeedFilter>(initialFilter);

  const handleFilterChange = (newFilter: Partial<FeedFilter>) => {
    setFeedFilter(prev => ({ ...prev, ...newFilter }));
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
    <QueryClientProvider client={queryClient}>
      <MediaProvider>
        <PostProvider 
          initialFilter={feedFilter}
          authToken={authToken}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Feed Controls */}
            <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-10 border-b p-4 space-y-4">
              {/* Filter Tabs */}
              <Tabs 
                value={feedFilter.type} 
                onValueChange={(value) => handleFilterChange({ type: value as 'all' | 'following' | 'groups' | 'saved' })}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                  <TabsTrigger value="following">กำลังติดตาม</TabsTrigger>
                  <TabsTrigger value="groups">กลุ่ม</TabsTrigger>
                  <TabsTrigger value="saved">บันทึกไว้</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Sort and Filter Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Select 
                    value={feedFilter.sortBy}
                    onValueChange={(value) => handleFilterChange({ sortBy: value as 'latest' | 'popular' | 'trending' | 'inspiration' })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">ล่าสุด</SelectItem>
                      <SelectItem value="popular">ยอดนิยม</SelectItem>
                      <SelectItem value="trending">กำลังมาแรง</SelectItem>
                      <SelectItem value="inspiration">แรงบันดาลใจ</SelectItem>
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
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Travel Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสไตล์</SelectItem>
                      {travelZones.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Current filter indicator */}
                <div className="flex items-center space-x-2">
                  {feedFilter.travelZone && (
                    <Badge variant="secondary" className="text-xs">
                      {travelZones.find(z => z.value === feedFilter.travelZone)?.label}
                    </Badge>
                  )}
                  {feedFilter.sortBy !== 'latest' && (
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {feedFilter.sortBy === 'popular' ? 'ยอดนิยม' :
                       feedFilter.sortBy === 'trending' ? 'กำลังมาแรง' : 'แรงบันดาลใจ'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Post Feed */}
            <div className="px-4 pb-20">
              <PostFeed
                showCreatePost={true}
                enablePullToRefresh={true}
                pageSize={10}
                emptyComponent={
                  <div className="text-center py-12 space-y-4">
                    <div className="text-6xl">🗾</div>
                    <h3 className="text-lg font-semibold">ยังไม่มีโพสต์</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      เป็นคนแรกที่แชร์ประสบการณ์การเดินทางของคุณ!
                    </p>
                  </div>
                }
              />
            </div>
          </div>
        </PostProvider>
      </MediaProvider>
    </QueryClientProvider>
  );
};

export default InstagramStyleFeed;