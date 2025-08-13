import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Users } from "lucide-react";
import PostCard from "@/components/common/PostCard";
import { cn } from "@/shared/lib/utils";
import { getRelatedPosts } from "@/shared/utils/contextualSearchAPI";
import { mockPosts } from "@/shared/data/mockData";
import type { Post, PostSearchResult, RelatedPostsConfig } from "@/shared/types/posts";

interface RelatedPostsProps {
  sourceLocationId?: string;
  sourcePost?: Post;
  currentLanguage: "th" | "en";
  onLocationClick?: (locationId: string) => void;
  onUserClick?: (userId: string) => void;
  onSeeAll?: () => void;
  className?: string;
  maxResults?: number;
}

const RelatedPosts = ({
  sourceLocationId,
  sourcePost,
  currentLanguage,
  onLocationClick,
  onUserClick,
  onSeeAll,
  className,
  maxResults = 4
}: RelatedPostsProps) => {
  const [relatedPosts, setRelatedPosts] = useState<PostSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const content = {
    th: {
      relatedPosts: "โพสต์ที่เกี่ยวข้อง",
      nearbyPosts: "โพสต์ใกล้เคียง",
      similarPosts: "โพสต์ที่คล้ายกัน",
      seeAll: "ดูทั้งหมด",
      noRelatedPosts: "ไม่มีโพสต์ที่เกี่ยวข้อง",
      loadMore: "โหลดเพิ่มเติม",
      fromSameLocation: "จากสถานที่เดียวกัน",
      similarThemes: "ธีมที่คล้ายกัน"
    },
    en: {
      relatedPosts: "Related Posts",
      nearbyPosts: "Nearby Posts", 
      similarPosts: "Similar Posts",
      seeAll: "See All",
      noRelatedPosts: "No related posts",
      loadMore: "Load More",
      fromSameLocation: "From Same Location",
      similarThemes: "Similar Themes"
    }
  };

  const t = content[currentLanguage];

  useEffect(() => {
    loadRelatedPosts();
  }, [sourceLocationId, sourcePost, currentLanguage]);

  const loadRelatedPosts = async () => {
    setIsLoading(true);
    
    try {
      let results: PostSearchResult[] = [];
      
      if (sourcePost) {
        // If we have a source post, find posts related to it
        const config: RelatedPostsConfig = {
          maxResults,
          minSimilarityThreshold: 0.2,
          useSemanticSimilarity: false,
          weightByPopularity: true,
          weightByRecency: true
        };
        
        results = await getRelatedPosts(sourcePost, config);
      } else if (sourceLocationId) {
        // If we have only a location, find posts from the same location
        const locationPosts = mockPosts.filter(post => 
          post.locationId === sourceLocationId || 
          post.location?.name.toLowerCase().includes(sourceLocationId.toLowerCase())
        );
        
        results = locationPosts
          .slice(0, maxResults)
          .map(post => ({
            ...post,
            searchMetrics: {
              relevanceScore: 1,
              popularityScore: Math.min(post.likeCount / 1000, 1),
              recencyScore: 0.5,
              semanticScore: 0,
              finalScore: 1
            },
            matchedTerms: [post.locationId || ''],
            highlightedCaption: post.caption
          }));
      }
      
      setRelatedPosts(results);
    } catch (error) {
      console.error("Failed to load related posts:", error);
      setRelatedPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostLike = (postId: string) => {
    setRelatedPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likeCount: post.likeCount + 1 }
        : post
    ));
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.relatedPosts}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: maxResults }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-3"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedPosts.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.relatedPosts}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t.noRelatedPosts}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group posts by relationship type
  const sameLocationPosts = relatedPosts.filter(post => 
    post.locationId === sourceLocationId || 
    (sourcePost && post.locationId === sourcePost.locationId)
  );
  
  const similarThemePosts = relatedPosts.filter(post => 
    !sameLocationPosts.includes(post) &&
    sourcePost && 
    post.tags.some(tag => sourcePost.tags.includes(tag))
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t.relatedPosts}
        </CardTitle>
        {relatedPosts.length > maxResults && onSeeAll && (
          <Button variant="outline" size="sm" onClick={onSeeAll}>
            {t.seeAll}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Same Location Posts */}
        {sameLocationPosts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {t.fromSameLocation}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {sameLocationPosts.length}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {sameLocationPosts.slice(0, 4).map((post) => (
                <div key={post.id} className="transform scale-90 origin-top">
                  <PostCard
                    post={post}
                    currentLanguage={currentLanguage}
                    onLike={handlePostLike}
                    onLocationClick={onLocationClick}
                    onUserClick={onUserClick}
                    className="max-w-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Theme Posts */}
        {similarThemePosts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {t.similarThemes}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {similarThemePosts.length}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {similarThemePosts.slice(0, 4).map((post) => (
                <div key={post.id} className="transform scale-90 origin-top">
                  <PostCard
                    post={post}
                    currentLanguage={currentLanguage}
                    onLike={handlePostLike}
                    onLocationClick={onLocationClick}
                    onUserClick={onUserClick}
                    className="max-w-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Related Posts (fallback) */}
        {sameLocationPosts.length === 0 && similarThemePosts.length === 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {relatedPosts.slice(0, maxResults).map((post) => (
              <div key={post.id} className="transform scale-90 origin-top">
                <PostCard
                  post={post}
                  currentLanguage={currentLanguage}
                  onLike={handlePostLike}
                  onLocationClick={onLocationClick}
                  onUserClick={onUserClick}
                  className="max-w-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Show common tags */}
        {sourcePost && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentLanguage === "th" ? "แท็กที่เกี่ยวข้อง:" : "Related tags:"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {sourcePost.tags.slice(0, 6).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelatedPosts;