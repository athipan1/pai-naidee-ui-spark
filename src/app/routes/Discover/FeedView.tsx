import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Waves,
  Mountain,
  Building2,
  UtensilsCrossed,
  Camera,
  TrendingUp,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaceCard from "@/components/discover/PlaceCard";
import CategoryCard from "@/components/discover/CategoryCard";
import SectionHeader from "@/components/discover/SectionHeader";
import { useAttractions } from "@/shared/hooks/useAttractionQueries";
import { Attraction } from "@/shared/types/attraction";
import heroBeachImage from "@/shared/assets/hero-beach.jpg";

// Simplified type for local state
type DisplayPlace = Attraction & { isTrending?: boolean };

interface Category {
  id: string;
  name: string;
  nameLocal: string;
  icon: React.ElementType;
  color: string;
  count: number;
}

interface FeedViewProps {
  currentLanguage: "th" | "en";
}

const LoadingSkeleton = () => (
  <div className="h-full bg-gray-50 p-6">
    <div className="space-y-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-xl"></div>
          ))}
        </div>
      </div>
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-gray-200 h-40 rounded-xl"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ErrorDisplay = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="text-center py-20">
    <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-destructive mb-2">Error</h3>
    <p className="text-muted-foreground mb-4">{message}</p>
    <Button onClick={onRetry}>Try Again</Button>
  </div>
);

const EmptyState = ({ t }: { t: any }) => (
  <div className="text-center py-12">
    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-600 mb-2">{t.noPlaces}</h3>
    <p className="text-gray-500">
      {t.noPlacesDescription}
    </p>
  </div>
);


const FeedView = ({ currentLanguage }: FeedViewProps) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: apiData,
    error: apiError,
    isLoading: apiLoading,
    refetch
  } = useAttractions({
    page: 1,
    limit: 20,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const content = {
    th: {
      exploreCategories: "หมวดหมู่สถานที่",
      trendingNow: "กำลังมาแรง",
      recommendedPlaces: "สถานที่แนะนำ",
      allDestinations: "สถานที่ทั้งหมด",
      noPlaces: "ไม่พบสถานที่ท่องเที่ยว",
      noPlacesDescription: "ไม่พบสถานที่ในหมวดหมู่นี้ ลองเลือกหมวดหมู่อื่นดู",
      loading: "กำลังโหลด...",
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
      categories: {
        beach: "ชายหาด",
        culture: "วัฒนธรรม",
        nature: "ธรรมชาติ",
        food: "อาหาร",
        activity: "กิจกรรม",
      },
    },
    en: {
      exploreCategories: "Explore Categories",
      trendingNow: "Trending Now",
      recommendedPlaces: "Recommended Places",
      allDestinations: "All Destinations",
      noPlaces: "No Places Found",
      noPlacesDescription: "No places found in this category. Try another one.",
      loading: "Loading...",
      error: "An error occurred while loading data.",
      categories: {
        beach: "Beach",
        culture: "Culture",
        nature: "Nature",
        food: "Food",
        activity: "Activity",
      },
    },
  };

  const t = content[currentLanguage];

  const { places, categories } = useMemo(() => {
    const attractions = apiData?.attractions ?? [];

    const displayPlaces: DisplayPlace[] = attractions.map(att => ({
      ...att,
      image: att.image || heroBeachImage, // Fallback image
      isTrending: Math.random() > 0.7, // Random trending for demo
    }));

    const categoryCounts = attractions.reduce((acc, place) => {
      const category = place.category?.toLowerCase() || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryList: Category[] = [
      { id: "beach", name: "Beach", nameLocal: t.categories.beach, icon: Waves, color: "#0ea5e9", count: categoryCounts.beach || 0 },
      { id: "culture", name: "Culture", nameLocal: t.categories.culture, icon: Building2, color: "#f59e0b", count: categoryCounts.culture || 0 },
      { id: "nature", name: "Nature", nameLocal: t.categories.nature, icon: Mountain, color: "#10b981", count: categoryCounts.nature || 0 },
      { id: "food", name: "Food", nameLocal: t.categories.food, icon: UtensilsCrossed, color: "#ef4444", count: categoryCounts.food || 0 },
      { id: "activity", name: "Activity", nameLocal: t.categories.activity, icon: Camera, color: "#8b5cf6", count: categoryCounts.activity || 0 }
    ];

    return { places: displayPlaces, categories: categoryList };
  }, [apiData, currentLanguage, t.categories]);

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handlePlaceClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleViewAll = (section: string) => {
    navigate(`/discover?section=${section}`);
  };

  const trendingPlaces = places.filter(place => place.isTrending).slice(0, 6);
  const recommendedPlaces = places.slice(0, 8);
  const allPlaces = places;

  if (apiLoading) {
    return <LoadingSkeleton />;
  }

  if (apiError) {
    return <ErrorDisplay message={apiError.message || t.error} onRetry={() => refetch()} />;
  }

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Categories Section */}
        <section>
          <SectionHeader
            title={t.exploreCategories}
            subtitle={currentLanguage === "th" ? "เลือกหมวดหมู่ที่สนใจ" : "Choose your interests"}
            currentLanguage={currentLanguage}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                {...category}
                currentLanguage={currentLanguage}
                isSelected={selectedCategory === category.id}
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        </section>

        {/* Trending Section */}
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
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory">
              {trendingPlaces.map((place) => (
                <div key={place.id} className="flex-none w-80 snap-start">
                  <PlaceCard
                    {...place}
                    currentLanguage={currentLanguage}
                    isFavorite={favorites.includes(place.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onCardClick={handlePlaceClick}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Destinations Section */}
        <section>
           <SectionHeader
            title={t.allDestinations}
            subtitle={currentLanguage === "th" ? "สถานที่ท่องเที่ยวทั้งหมด" : "All travel destinations"}
            icon={MapPin}
            currentLanguage={currentLanguage}
          />
          {allPlaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allPlaces.map((place) => (
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
             <EmptyState t={t} />
          )}
        </section>
      </div>
    </div>
  );
};

export default FeedView;