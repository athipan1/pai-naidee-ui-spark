import { useState } from "react";
import Header from "@/components/common/Header";
import SearchSection from "@/components/common/SearchSection";
import CategoryFilter from "@/components/common/CategoryFilter";
import AttractionCard from "@/components/common/AttractionCard";
import BottomNavigation from "@/components/common/BottomNavigation";
import Explore from "./Explore";
import Favorites from "./Favorites";
import { useNavigate } from "react-router-dom";
import { SearchResult } from "@/shared/utils/searchAPI";
import { MapPin, Star } from "lucide-react";
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [_activeTab, setActiveTab] = useState("home");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<
    "home" | "explore" | "favorites"
  >("home");

  // Listen for navigation events from BottomNavigation
  // Mock attraction data
  const attractions = [
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

  const filteredAttractions =
    selectedCategory === "all"
      ? attractions
      : attractions.filter(
          (attraction) =>
            attraction.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  // Calculate category counts
  const attractionCounts = attractions.reduce((counts, attraction) => {
    const category = attraction.category.toLowerCase();
    counts[category] = (counts[category] || 0) + 1;
    counts.all = attractions.length;
    return counts;
  }, {} as { [key: string]: number });

  const handleSearch = (query: string, _results?: SearchResult[]) => {
    // Navigate to search results page with query parameter
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    navigate(`/search?${searchParams.toString()}`);
  };

  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const _handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "explore") {
      setCurrentView("explore");
    } else if (tab === "favorites") {
      setCurrentView("favorites");
    } else if (tab === "home") {
      setCurrentView("home");
    }
  };

  const handleCardClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  // Render different views based on currentView state
  if (currentView === "explore") {
    return (
      <Explore
        currentLanguage={currentLanguage}
        onBack={() => {
          setCurrentView("home");
          setActiveTab("home");
        }}
      />
    );
  }

  if (currentView === "favorites") {
    return <Favorites currentLanguage={currentLanguage} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />

      <SearchSection
        currentLanguage={currentLanguage}
        onSearch={handleSearch}
      />

      <CategoryFilter
        currentLanguage={currentLanguage}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        attractionCounts={attractionCounts}
      />

      {/* Trending Destinations Section */}
      {selectedCategory === "all" && (
        <section className="py-6 bg-accent/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <span className="mr-2">🔥</span>
                {currentLanguage === "th" ? "ยอดนิยมในขณะนี้" : "Trending Now"}
              </h2>
            </div>
            
            <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
              {attractions.slice(0, 2).map((attraction) => (
                <div
                  key={`trending-${attraction.id}`}
                  className="flex-shrink-0 w-64 md:w-72 bg-card rounded-xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => handleCardClick(attraction.id)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={attraction.image}
                      alt={attraction.name}
                      className="w-16 h-16 rounded-lg object-cover"
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
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Attractions Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {currentLanguage === "th" ? "สถานที่แนะนำ" : "Recommended Places"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredAttractions.length}{" "}
              {currentLanguage === "th" ? "สถานที่" : "places"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAttractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                {...attraction}
                currentLanguage={currentLanguage}
                isFavorite={favorites.includes(attraction.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          {filteredAttractions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {currentLanguage === "th"
                  ? "ไม่พบสถานที่ในหมวดหมู่นี้"
                  : "No places found in this category"}
              </p>
            </div>
          )}
        </div>
      </section>

      <BottomNavigation currentLanguage={currentLanguage} />
    </div>
  );
};

export default Index;
