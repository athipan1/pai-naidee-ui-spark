import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, TrendingUp, Filter, SortAsc } from "lucide-react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/common/BottomNavigation";
import PostCard from "@/components/common/PostCard";
import AttractionCard from "@/components/common/AttractionCard";
import { cn } from "@/shared/lib/utils";
import { searchPosts, searchLocations } from "@/shared/utils/contextualSearchAPI";
import { SearchResult } from "@/shared/utils/searchAPI";
import { PostSearchResult, Location } from "@/shared/types/posts";

interface ContextualSearchResultsProps {
  currentLanguage: "th" | "en";
  onLanguageChange: (language: "th" | "en") => void;
}

const ContextualSearchResults = ({ currentLanguage, onLanguageChange }: ContextualSearchResultsProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [postResults, setPostResults] = useState<PostSearchResult[]>([]);
  const [placeResults, setPlaceResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);
  const [processingTime, setProcessingTime] = useState(0);

  const content = {
    th: {
      searchResults: "ผลการค้นหา",
      noResults: "ไม่พบผลลัพธ์",
      searching: "กำลังค้นหา...",
      allResults: "ทั้งหมด",
      posts: "โพสต์",
      places: "สถานที่",
      filters: "ตัวกรอง",
      sort: "เรียงลำดับ",
      foundResults: "พบ",
      results: "ผลลัพธ์",
      in: "ใน",
      ms: "มิลลิวินาที",
      expandedSearch: "ขยายการค้นหาเป็น",
      relatedPosts: "โพสต์ที่เกี่ยวข้อง",
      exploreNearby: "สำรวจสถานที่ใกล้เคียง",
      backToHome: "กลับหน้าแรก"
    },
    en: {
      searchResults: "Search Results",
      noResults: "No results found",
      searching: "Searching...",
      allResults: "All",
      posts: "Posts",
      places: "Places",
      filters: "Filters",
      sort: "Sort",
      foundResults: "Found",
      results: "results",
      in: "in",
      ms: "ms",
      expandedSearch: "Expanded search to",
      relatedPosts: "Related Posts",
      exploreNearby: "Explore Nearby",
      backToHome: "Back to Home"
    }
  };

  const t = content[currentLanguage];

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, currentLanguage]);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Search for posts and places in parallel
      const [postsResponse, placesResponse] = await Promise.all([
        searchPosts(query, { language: currentLanguage, limit: 20 }),
        searchLocations(query, 10)
      ]);
      
      setPostResults(postsResponse.results);
      setPlaceResults(placesResponse);
      setExpandedTerms(postsResponse.expandedTerms);
      setProcessingTime(postsResponse.processingTime);
      
      // Set default tab based on results
      if (postsResponse.results.length > 0 && placesResponse.length > 0) {
        setActiveTab("all");
      } else if (postsResponse.results.length > 0) {
        setActiveTab("posts");
      } else if (placesResponse.length > 0) {
        setActiveTab("places");
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostLike = (postId: string) => {
    setPostResults(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likeCount: post.likeCount + 1 }
        : post
    ));
  };

  const handleLocationClick = (locationId: string) => {
    navigate(`/attraction/${locationId}`);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const totalResults = postResults.length + placeResults.length;

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Header currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.searchResults}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {currentLanguage === "th" 
              ? "กรุณาใส่คำค้นหาเพื่อเริ่มต้น" 
              : "Please enter a search query to begin"}
          </p>
          <Button onClick={() => navigate("/")}>{t.backToHome}</Button>
        </div>
        <BottomNavigation currentLanguage={currentLanguage} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t.searchResults}: "{query}"
          </h1>
          
          {/* Search Stats */}
          {!isLoading && totalResults > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span>
                {t.foundResults} {totalResults} {t.results} {t.in} {processingTime}{t.ms}
              </span>
              
              {/* Expanded Terms */}
              {expandedTerms.length > 1 && (
                <div className="flex items-center gap-2">
                  <span>{t.expandedSearch}:</span>
                  {expandedTerms.slice(0, 3).map((term, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {term}
                    </Badge>
                  ))}
                  {expandedTerms.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{expandedTerms.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-4 h-4 mr-2" />
              {t.filters}
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <SortAsc className="w-4 h-4 mr-2" />
              {t.sort}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              {t.searching}
            </div>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t.noResults}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {currentLanguage === "th" 
                ? "ลองใช้คำค้นหาอื่นหรือปรับเปลี่ยนตัวกรอง"
                : "Try different keywords or adjust your filters"}
            </p>
            <Button onClick={() => navigate("/")}>{t.backToHome}</Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t.allResults}
                <Badge variant="secondary" className="ml-1">
                  {totalResults}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t.posts}
                <Badge variant="secondary" className="ml-1">
                  {postResults.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="places" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t.places}
                <Badge variant="secondary" className="ml-1">
                  {placeResults.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {/* Mixed Results */}
              <div className="space-y-6">
                {/* Posts Section */}
                {postResults.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {t.posts} ({postResults.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {postResults.slice(0, 6).map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentLanguage={currentLanguage}
                          onLike={handlePostLike}
                          onLocationClick={handleLocationClick}
                          onUserClick={handleUserClick}
                          showMetrics={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Places Section */}
                {placeResults.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {t.places} ({placeResults.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {placeResults.slice(0, 6).map((place) => (
                        <div key={place.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              {currentLanguage === "th" && place.nameLocal ? place.nameLocal : place.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              {place.province}
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {place.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleLocationClick(place.id)}
                            >
                              {currentLanguage === "th" ? "ดูรายละเอียด" : "View Details"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {postResults.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentLanguage={currentLanguage}
                    onLike={handlePostLike}
                    onLocationClick={handleLocationClick}
                    onUserClick={handleUserClick}
                    showMetrics={true}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="places" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {placeResults.map((place) => (
                  <div key={place.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {currentLanguage === "th" && place.nameLocal ? place.nameLocal : place.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {place.province} • {place.category}
                      </div>
                      {place.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {currentLanguage === "th" && place.descriptionLocal 
                            ? place.descriptionLocal 
                            : place.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {place.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleLocationClick(place.id)}
                        >
                          {currentLanguage === "th" ? "ดูรายละเอียด" : "View Details"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/nearby/${place.id}`)}
                        >
                          {currentLanguage === "th" ? "ใกล้เคียง" : "Nearby"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <BottomNavigation currentLanguage={currentLanguage} />
    </div>
  );
};

export default ContextualSearchResults;