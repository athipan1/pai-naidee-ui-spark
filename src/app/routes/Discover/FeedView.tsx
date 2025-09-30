import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Waves,
  Mountain,
  Building2,
  UtensilsCrossed,
  Camera,
  TrendingUp,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaceCard from "@/components/discover/PlaceCard";
import CategoryCard from "@/components/discover/CategoryCard";
import SectionHeader from "@/components/discover/SectionHeader";
import { useAttractions } from "@/shared/hooks/useAttractionQueries";
import { isSupabaseConfigured } from "@/services/supabase.service";
import templeImage from "@/shared/assets/temple-culture.jpg";
import mountainImage from "@/shared/assets/mountain-nature.jpg";
import floatingMarketImage from "@/shared/assets/floating-market.jpg";
import heroBeachImage from "@/shared/assets/hero-beach.jpg";

interface TravelPlace {
  id: string;
  name: string;
  nameLocal?: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  tags: string[];
  isTrending?: boolean;
}

interface Category {
  id: string;
  name: string;
  nameLocal: string;
  icon: any;
  color: string;
  count: number;
}

interface FeedViewProps {
  currentLanguage: "th" | "en";
}

const FeedView = ({ currentLanguage }: FeedViewProps) => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<TravelPlace[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Try to get data from API, fallback to mock data
  const {
    data: apiData,
    error: apiError,
    isLoading: apiLoading
  } = useAttractions({
    page: 1,
    limit: 20,
    category: selectedCategory === "all" ? undefined : selectedCategory
  });

  const content = {
    th: {
      discover: "สำรวจ",
      exploreCategories: "หมวดหมู่สถานที่",
      trendingNow: "กำลังมาแรง",
      recommendedPlaces: "สถานที่แนะนำ",
      allDestinations: "สถานที่ทั้งหมด",
      noPlaces: "ไม่พบสถานที่ท่องเที่ยว",
      loading: "กำลังโหลด...",
      categories: {
        beach: "ชายหาด",
        culture: "วัฒนธรรม",
        nature: "ธรรมชาติ",
        food: "อาหาร",
        activity: "กิจกรรม",
        all: "ทั้งหมด"
      }
    },
    en: {
      discover: "Discover",
      exploreCategories: "Explore Categories",
      trendingNow: "Trending Now",
      recommendedPlaces: "Recommended Places", 
      allDestinations: "All Destinations",
      noPlaces: "No places found",
      loading: "Loading...",
      categories: {
        beach: "Beach",
        culture: "Culture",
        nature: "Nature",
        food: "Food",
        activity: "Activity",
        all: "All"
      }
    },
  };

  const t = content[currentLanguage];

  // Mock data for fallback
  const mockPlaces: TravelPlace[] = [
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
      isTrending: true
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
      isTrending: false
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
      isTrending: true
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
      isTrending: false
    },
  ];

  const mockCategories: Category[] = [
    {
      id: "beach",
      name: "Beach",
      nameLocal: "ชายหาด",
      icon: Waves,
      color: "#0ea5e9",
      count: 1
    },
    {
      id: "culture", 
      name: "Culture",
      nameLocal: "วัฒนธรรม",
      icon: Building2,
      color: "#f59e0b",
      count: 1
    },
    {
      id: "nature",
      name: "Nature",
      nameLocal: "ธรรมชาติ",
      icon: Mountain,
      color: "#10b981",
      count: 1
    },
    {
      id: "food",
      name: "Food",
      nameLocal: "อาหาร",
      icon: UtensilsCrossed,
      color: "#ef4444",
      count: 1
    },
    {
      id: "activity",
      name: "Activity",
      nameLocal: "กิจกรรม",
      icon: Camera,
      color: "#8b5cf6",
      count: 0
    }
  ];

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const supabaseConfigured = isSupabaseConfigured();
      
      // Use API data if available and configured, otherwise use mock data
      if (supabaseConfigured && apiData?.attractions && apiData.attractions.length > 0) {
        const displayPlaces = apiData.attractions.map(attraction => ({
          id: attraction.id,
          name: attraction.name,
          nameLocal: attraction.nameLocal || attraction.name,
          province: attraction.province,
          category: attraction.category,
          rating: attraction.rating,
          reviewCount: attraction.reviewCount,
          image: attraction.image || heroBeachImage,
          description: attraction.description,
          tags: attraction.tags || [],
          isTrending: Math.random() > 0.5 // Random trending for demo
        }));
        setPlaces(displayPlaces);
      } else {
        // Fallback to mock data if Supabase is not configured or API fails
        setPlaces(mockPlaces);
      }
      
      setCategories(mockCategories);
      setLoading(false);
    };

    // We depend on the loading state of the API call to trigger this effect
    if (!apiLoading) {
      setTimeout(loadData, 500); // Simulate loading
    }
  }, [apiData, apiLoading, currentLanguage]);

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const handlePlaceClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      navigate("/discover");
    } else {
      navigate(`/discover?mode=category&cat=${categoryId}`);
    }
  };

  const handleViewAll = (section: string) => {
    navigate(`/discover?section=${section}`);
  };

  // Filter places by selected category
  const filteredPlaces = selectedCategory === "all" 
    ? places 
    : places.filter(place => place.category.toLowerCase() === selectedCategory.toLowerCase());

  const trendingPlaces = places.filter(place => place.isTrending).slice(0, 6);
  const recommendedPlaces = places.slice(0, 8);

  if (loading) {
    return (
      <div className="h-full bg-gray-50 p-6">
        <div className="space-y-8">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-24 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Explore Categories Section */}
        <section>
          <SectionHeader
            title={t.exploreCategories}
            subtitle={currentLanguage === "th" ? "เลือกหมวดหมู่ที่สนใจ" : "Choose your interests"}
            currentLanguage={currentLanguage}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                nameLocal={category.nameLocal}
                icon={category.icon}
                color={category.color}
                count={category.count}
                currentLanguage={currentLanguage}
                isSelected={selectedCategory === category.id}
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        </section>

        {/* Trending Now Section */}
        {trendingPlaces.length > 0 && (
          <section>
            <SectionHeader
              title={t.trendingNow}
              subtitle={currentLanguage === "th" ? "สถานที่ที่กำลังมาแรงในขณะนี้" : "Places that are popular right now"}
              icon={TrendingUp}
              showViewAll={true}
              onViewAll={() => handleViewAll("trending")}
              currentLanguage={currentLanguage}
            />
            
            {/* Horizontal scroll for trending */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {trendingPlaces.map((place) => (
                <div key={place.id} className="flex-none w-80 snap-start">
                  <div className="relative">
                    <PlaceCard
                      {...place}
                      currentLanguage={currentLanguage}
                      isFavorite={favorites.includes(place.id)}
                      onFavoriteToggle={handleFavoriteToggle}
                      onCardClick={handlePlaceClick}
                    />
                    {/* Trending badge */}
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{currentLanguage === "th" ? "มาแรง" : "Trending"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Places Section */}
        <section>
          <SectionHeader
            title={t.recommendedPlaces}
            subtitle={currentLanguage === "th" ? "สถานที่ที่แนะนำสำหรับคุณ" : "Places recommended for you"}
            icon={Star}
            showViewAll={true}
            onViewAll={() => handleViewAll("recommended")}
            currentLanguage={currentLanguage}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendedPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                {...place}
                currentLanguage={currentLanguage}
                isFavorite={favorites.includes(place.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onCardClick={handlePlaceClick}
              />
            ))}
          </div>
        </section>

        {/* All Destinations Section */}
        <section>
          <SectionHeader
            title={t.allDestinations}
            subtitle={currentLanguage === "th" ? "สถานที่ท่องเที่ยวทั้งหมด" : "All travel destinations"}
            icon={MapPin}
            currentLanguage={currentLanguage}
          />
          
          {filteredPlaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  {...place}
                  currentLanguage={currentLanguage}
                  isFavorite={favorites.includes(place.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  onCardClick={handlePlaceClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {t.noPlaces}
              </h3>
              <p className="text-gray-500">
                {currentLanguage === "th" 
                  ? "ลองเลือกหมวดหมู่อื่น หรือค้นหาสถานที่ที่สนใจ"
                  : "Try selecting another category or search for places you're interested in"
                }
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FeedView;