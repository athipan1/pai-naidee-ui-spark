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

interface TravelPlace {
  id: string;
  name: string;
  nameLocal?: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string | null;
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
    // We use the loading state from react-query
    setLoading(apiLoading);

    if (apiData?.attractions) {
      const displayPlaces = apiData.attractions.map(attraction => ({
        id: attraction.id,
        name: attraction.name,
        nameLocal: attraction.nameLocal || attraction.name,
        province: attraction.province,
        category: attraction.category,
        rating: attraction.rating,
        reviewCount: attraction.reviewCount,
        image: attraction.image, // Pass image URL or null
        description: attraction.description,
        tags: attraction.tags || [],
        isTrending: Math.random() > 0.5 // Random trending for demo
      }));
      setPlaces(displayPlaces);
    }

    // Set categories (can be dynamic in future)
    setCategories(mockCategories);

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

  if (apiError) {
    return (
      <div className="h-full bg-gray-50 p-6 text-center">
        <h2 className="text-xl text-red-500">
          {currentLanguage === "th" ? "เกิดข้อผิดพลาด" : "An Error Occurred"}
        </h2>
        <p className="text-gray-600">
          {currentLanguage === "th"
            ? "ไม่สามารถโหลดข้อมูลสถานที่ท่องเที่ยวได้ โปรดลองอีกครั้งในภายหลัง"
            : "Could not load attractions. Please try again later."}
        </p>
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