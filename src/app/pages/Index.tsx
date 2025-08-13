import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import SearchSection from "@/components/common/SearchSection";
import CategoryFilter from "@/components/common/CategoryFilter";
import AttractionCard from "@/components/common/AttractionCard";
import BottomNavigation from "@/components/common/BottomNavigation";
import APIErrorDisplay from "@/components/common/APIErrorDisplay";
import OptimizedImage from "@/components/common/OptimizedImage";
import { SearchResult } from "@/shared/utils/searchAPI";
import { PostSearchResult } from "@/shared/types/posts";
import { useAttractions } from "@/shared/hooks/useAttractionQueries";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import templeImage from "@/shared/assets/temple-culture.jpg";
import mountainImage from "@/shared/assets/mountain-nature.jpg";
import floatingMarketImage from "@/shared/assets/floating-market.jpg";
import heroBeachImage from "@/shared/assets/hero-beach.jpg";

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

  // Mock attraction data as fallback
  const _attractions = [
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

  // Use API data if available, otherwise use mock data
  const displayAttractions = apiData?.attractions ? apiData.attractions.map(attraction => ({
    id: attraction.id,
    name: attraction.name,
    nameLocal: attraction.nameLocal || attraction.name,
    province: "",
    category: attraction.category,
    rating: attraction.rating,
    reviewCount: Math.floor(Math.random() * 5000) + 1000, // Mock review count for API data
    image: attraction.images?.[0] || heroBeachImage,
    description: `Discover the beauty of ${attraction.name}`,
    tags: [attraction.category]
  })) : mockAttractions;

  // Track if we're using mock data
  useEffect(() => {
    setUsingMockData(!apiData?.attractions && !apiLoading);
  }, [apiData, apiLoading]);

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

  const handleSearch = (query: string, _results?: SearchResult[] | PostSearchResult[]) => {
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
        {/* API Status Display */}
        {(apiError || usingMockData) && (
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

        {/* Trending Destinations Section */}
        {_selectedCategory === "all" && (
          <section className="py-6 bg-accent/20" aria-label={currentLanguage === "th" ? "สถานที่ยอดนิยม" : "Trending destinations"}>
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="mr-2" role="img" aria-label="fire">🔥</span>
                  {currentLanguage === "th" ? "ยอดนิยมในขณะนี้" : "Trending Now"}
                </h2>
              </div>
              
              <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide" role="list">
                {displayAttractions.slice(0, 2).map((attraction) => (
                  <article
                    key={`trending-${attraction.id}`}
                    className="flex-shrink-0 w-64 md:w-72 bg-card rounded-xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
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
                    <div className="flex items-center space-x-3">
                      <OptimizedImage
                        src={attraction.image}
                        alt={attraction.name}
                        loading="lazy"
                        className="w-16 h-16 rounded-lg object-cover"
                        width={64}
                        height={64}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {currentLanguage === "th" && attraction.nameLocal ? attraction.nameLocal : attraction.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {attraction.province}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 fill-accent-yellow text-accent-yellow mr-1" />
                          <span className="text-sm font-medium">{attraction.rating}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({attraction.reviewCount})
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

        {/* Attractions Grid */}
        <section className="py-8" aria-label={currentLanguage === "th" ? "สถานที่แนะนำ" : "Recommended places"}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {currentLanguage === "th" ? "สถานที่แนะนำ" : "Recommended Places"}
              </h2>
              <Button 
                variant="outline" 
                onClick={handleViewMore}
                className="flex items-center gap-2"
              >
                <span className="text-sm">
                  {currentLanguage === "th" ? "ดูทั้งหมด" : "View All"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              role="list"
              aria-label={
                currentLanguage === "th" 
                  ? `รายการสถานที่ท่องเที่ยว ${Math.min(filteredAttractions.length, 8)} แห่ง`
                  : `Tourist attractions list ${Math.min(filteredAttractions.length, 8)} places`
              }
            >
              {/* Show only first 8 items on home page */}
              {filteredAttractions.slice(0, 8).map((attraction) => (
                <div key={attraction.id} role="listitem">
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
              <div className="text-center py-12" role="status" aria-live="polite">
                <p className="text-muted-foreground text-lg">
                  {currentLanguage === "th"
                    ? "ไม่พบสถานที่ในหมวดหมู่นี้"
                    : "No places found in this category"}
                </p>
                <Button 
                  onClick={handleViewMore}
                  className="mt-4"
                >
                  {currentLanguage === "th" ? "สำรวจเพิ่มเติม" : "Explore More"}
                </Button>
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
