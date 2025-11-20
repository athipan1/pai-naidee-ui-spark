import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import SearchSection from "@/components/common/SearchSection";
import CategoryFilter from "@/components/common/CategoryFilter";
import AttractionCard from "@/components/common/AttractionCard";
import BottomNavigation from "@/components/common/BottomNavigation";
import APIErrorDisplay from "@/components/common/APIErrorDisplay";
import OptimizedImage from "@/components/common/OptimizedImage";
import SupabaseSetupGuide from "@/components/common/SupabaseSetupGuide";
import { SearchResult } from "@/shared/types/search";
import { useAttractions } from "@/shared/hooks/useAttractionQueries";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import templeImage from "@/shared/assets/temple-culture.jpg";
import mountainImage from "@/shared/assets/mountain-nature.jpg";
import floatingMarketImage from "@/shared/assets/floating-market.jpg";
import heroBeachImage from "@/shared/assets/hero-beach.jpg";
import { isDevelopment } from "@/shared/utils/devUtils";

interface IndexProps {
  currentLanguage: "th" | "en";
  onLanguageChange: (language: "th" | "en") => void;
}

const Index = ({ currentLanguage, onLanguageChange }: IndexProps) => {
  const navigate = useNavigate();
  const [_selectedCategory, _setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [usingMockData, setUsingMockData] = useState(false);

  // Mock attractions data (defined first so it can be used in the API data fallback)
  const mockAttractions = [
    {
      id: "1",
      name: "Phi Phi Islands",
      nameLocal: "หมู่เกาะพีพี",
      province: currentLanguage === "th" ? "กระบี่" : "Krabi",
      category: "Beach",
      rating: 4.8,
      reviewCount: 2547,
      image: heroBeachImage,
      description:
        currentLanguage === "th"
          ? "น้ำทะเลใสและหน้าผาหินปูนที่สวยงาม ทำให้ที่นี่เป็นสวรรค์สำหรับผู้ที่ชื่นชอบชายหาดและการดำน้ำดูปะการัง"
          : "Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.",
      tags: ["Beach", "Snorkeling", "Island", "Photography"],
    },
    {
      id: "2",
      name: "Wat Phra Kaew",
      nameLocal: "วัดพระแก้ว",
      province: currentLanguage === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Culture",
      rating: 4.9,
      reviewCount: 5243,
      image: templeImage,
      description:
        currentLanguage === "th"
          ? "วัดที่ศักดิ์สิทธิ์ที่สุดในประเทศไทย เป็นที่ประดิษฐานของพระแก้วมรกต"
          : "The most sacred Buddhist temple in Thailand, home to the revered Emerald Buddha statue.",
      tags: ["Temple", "Culture", "Buddhism", "History"],
    },
    {
      id: "3",
      name: "Doi Inthanon",
      nameLocal: "ดอยอินทนนท์",
      province: currentLanguage === "th" ? "เชียงใหม่" : "Chiang Mai",
      category: "Nature",
      rating: 4.7,
      reviewCount: 1876,
      image: mountainImage,
      description:
        currentLanguage === "th"
          ? "ยอดเขาที่สูงที่สุดในประเทศไทย ชมวิวภูเขาที่งดงาม น้ำตก และอากาศเย็นสบาย"
          : "The highest peak in Thailand offering breathtaking mountain views, waterfalls, and cool weather.",
      tags: ["Mountain", "Nature", "Hiking", "Waterfalls"],
    },
    {
      id: "4",
      name: "Floating Market",
      nameLocal: "ตลาดน้ำ",
      province: currentLanguage === "th" ? "กรุงเทพฯ" : "Bangkok",
      category: "Food",
      rating: 4.5,
      reviewCount: 3156,
      image: floatingMarketImage,
      description:
        currentLanguage === "th"
          ? "สัมผัสวัฒนธรรมไทยแบบดั้งเดิม ขณะช้อปปิ้งผลไม้สดและอาหารพื้นเมืองจากเรือ"
          : "Experience traditional Thai culture while shopping for fresh fruits and local delicacies from boats.",
      tags: ["Food", "Culture", "Traditional", "Market"],
    },
  ];

  // Try to fetch real data first, fallback to mock data
  const {
    data: apiData,
    error: apiError,
    isLoading: apiLoading,
    refetch: refetchAttractions
  } = useAttractions({
    page: 1,
    limit: 10,
    category: _selectedCategory === "all" ? undefined : _selectedCategory
  });

  // Use API data if available and has content, otherwise use mock data
  const displayAttractions = (apiData?.attractions && apiData.attractions.length > 0)
    ? apiData.attractions.map(attraction => ({
      id: attraction.id,
      name: attraction.name,
      nameLocal: attraction.nameLocal || attraction.name,
      province: attraction.province,
      category: attraction.category,
      rating: attraction.rating,
      reviewCount: attraction.reviewCount,
      image: attraction.image || heroBeachImage, // Use placeholder if no image
      description: attraction.description,
      tags: attraction.tags,
    }))
    : mockAttractions;

  // Track if we're using mock data
  useEffect(() => {
    const isApiUnavailable = !apiLoading && (!!apiError || !apiData?.attractions || apiData.attractions.length === 0);
    setUsingMockData(isApiUnavailable);
  }, [apiData, apiError, apiLoading]);

  const filteredAttractions =
    _selectedCategory === "all"
      ? displayAttractions
      : displayAttractions.filter(
          (attraction) =>
            attraction.category.toLowerCase() === _selectedCategory.toLowerCase()
        );

  // Calculate category counts
  const attractionCounts = displayAttractions.reduce((counts, attraction) => {
    const category = attraction.category.toLowerCase();
    counts[category] = (counts[category] || 0) + 1;
    counts.all = displayAttractions.length;
    return counts;
  }, {} as { [key: string]: number });

  const handleSearch = (query: string, _results?: SearchResult[]) => {
    // Navigate to our new contextual search results page
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    navigate(`/search?${searchParams.toString()}`);
  };

  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleCardClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  const _handleCategoryChange = (category: string) => {
    if (category === "all") {
      navigate("/discover");
    } else {
      const searchParams = new URLSearchParams();
      searchParams.set('mode', 'category');
      searchParams.set('cat', category);
      navigate(`/discover?${searchParams.toString()}`);
    }
  };

  const handleViewMore = () => {
    navigate("/discover");
  };

  // Remove the view switching logic and just render the home page
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />

      <main id="main-content" role="main" className="focus:outline-none" tabIndex={-1}>
        {/* Supabase Setup Guide - Only show in development */}
        {isDevelopment && (
          <div className="container mx-auto px-4 pt-4">
            <SupabaseSetupGuide 
              currentLanguage={currentLanguage}
              showOnlyIfNeeded={true}
            />
          </div>
        )}
        
        {/* API Status Display - Only show if needed and in development/when there are issues */}
        {(apiError || (usingMockData && isDevelopment)) && (
          <div className="container mx-auto px-4 pt-4">
            <APIErrorDisplay
              error={apiError}
              isLoading={apiLoading}
              onRetry={refetchAttractions}
              showRetryButton={!!apiError}
              fallbackMessage={
                usingMockData
                  ? currentLanguage === "th"
                    ? "เซิร์ฟเวอร์ไม่พร้อมใช้งาน กำลังแสดงข้อมูลตัวอย่าง"
                    : "Server unavailable. Showing sample data instead."
                  : undefined
              }
              currentLanguage={currentLanguage}
            />
          </div>
        )}

        <SearchSection
          currentLanguage={currentLanguage}
          onSearch={handleSearch}
        />

        <CategoryFilter
          currentLanguage={currentLanguage}
          selectedCategory={_selectedCategory}
          onCategoryChange={_handleCategoryChange}
          attractionCounts={attractionCounts}
        />

        {/* Enhanced Trending Destinations Section */}
        {_selectedCategory === "all" && (
          <section className="py-8 bg-gradient-to-br from-accent/10 to-accent/5" aria-label={currentLanguage === "th" ? "สถานที่ยอดนิยม" : "Trending destinations"}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center">
                  <span className="mr-3 text-2xl animate-bounce" role="img" aria-label="fire">🔥</span>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {currentLanguage === "th" ? "ยอดนิยมในขณะนี้" : "Trending Now"}
                  </span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6" role="list">
                {displayAttractions.slice(0, 2).map((attraction) => (
                  <article
                    key={`trending-${attraction.id}`}
                    className="bg-card/90 backdrop-blur-sm rounded-2xl p-5 border border-border/30 shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer group hover:scale-[1.02] hover:-translate-y-1"
                    onClick={() => handleCardClick(attraction.id)}
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(attraction.id);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-shrink-0">
                        <OptimizedImage
                          src={attraction.image}
                          alt={attraction.name}
                          loading="lazy"
                          className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shadow-md group-hover:scale-110 transition-transform duration-300"
                          width={96}
                          height={96}
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                          🔥
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg md:text-xl truncate group-hover:text-primary transition-colors duration-300">
                          {currentLanguage === "th" && attraction.nameLocal ? attraction.nameLocal : attraction.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-2 text-primary" />
                          {attraction.province}
                        </p>
                        <div className="flex items-center mt-2 bg-accent/20 px-3 py-1 rounded-full w-fit">
                          <Star className="w-4 h-4 fill-accent-yellow text-accent-yellow mr-2" />
                          <span className="text-sm font-bold">{attraction.rating}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({attraction.reviewCount.toLocaleString()} {currentLanguage === "th" ? "รีวิว" : "reviews"})
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
              ))}
              </div>
            </div>
          </section>
        )}

        {/* Enhanced Attractions Grid */}
        <section className="py-12" aria-label={currentLanguage === "th" ? "สถานที่แนะนำ" : "Recommended places"}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {currentLanguage === "th" ? "สถานที่แนะนำ" : "Recommended Places"}
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  {currentLanguage === "th" 
                    ? "สถานที่ท่องเที่ยวยอดนิยมที่คัดสรรมาเป็นพิเศษ"
                    : "Handpicked popular destinations just for you"
                  }
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleViewMore}
                className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
              >
                <span className="text-sm font-medium">
                  {currentLanguage === "th" ? "ดูทั้งหมด" : "View All"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8"
              role="list"
              aria-label={
                currentLanguage === "th" 
                  ? `รายการสถานที่ท่องเที่ยว ${Math.min(filteredAttractions.length, 8)} แห่ง`
                  : `Tourist attractions list ${Math.min(filteredAttractions.length, 8)} places`
              }
            >
              {/* Show only first 8 items on home page */}
              {filteredAttractions.slice(0, 8).map((attraction) => (
                <div key={attraction.id} role="listitem" className="h-full">
                  <AttractionCard
                    {...attraction}
                    currentLanguage={currentLanguage}
                    isFavorite={favorites.includes(attraction.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onCardClick={handleCardClick}
                  />
                </div>
              ))}
            </div>

            {filteredAttractions.length === 0 && (
              <div className="text-center py-16" role="status" aria-live="polite">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {currentLanguage === "th"
                      ? "ไม่พบสถานที่ในหมวดหมู่นี้"
                      : "No places found in this category"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {currentLanguage === "th"
                      ? "ลองเลือกหมวดหมู่อื่น หรือค้นหาสถานที่ที่สนใจ"
                      : "Try selecting another category or search for places you're interested in"}
                  </p>
                  <Button 
                    onClick={handleViewMore}
                    className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    {currentLanguage === "th" ? "สำรวจเพิ่มเติม" : "Explore More"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNavigation currentLanguage={currentLanguage} />
    </div>
  );
};

export default Index;
