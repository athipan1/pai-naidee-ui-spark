import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAllAttractions } from '@/shared/hooks/useAttractionQueries';
import AttractionCard from "@/components/common/AttractionCard";
import { Skeleton } from "@/components/ui/skeleton";

// The Attraction type should ideally come from a shared location,
// but we're defining it here to match the expected data structure.
interface Attraction {
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
}

interface CategoryViewProps {
  currentLanguage: "th" | "en";
  category: string;
}

const CategoryView = ({ currentLanguage, category }: CategoryViewProps) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);

  const decodedCategory = category ? decodeURIComponent(category) : undefined;

  const {
    data: catalogue,
    isLoading,
    isError,
    error,
  } = useAllAttractions({ category: decodedCategory });

  const attractions = catalogue?.attractions ?? [];


  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleCardClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  const getCategoryInfo = (categoryName?: string) => {
    const categoryMap: Record<string, { emoji: string; th: string; en: string }> = {
      Beach: { emoji: "🏖️", th: "ชายหาด", en: "Beach" },
      Culture: { emoji: "🛕", th: "วัฒนธรรม", en: "Culture" },
      Nature: { emoji: "⛰️", th: "ธรรมชาติ", en: "Nature" },
      Food: { emoji: "🍜", th: "อาหาร", en: "Food" },
      Mountain: { emoji: "⛰️", th: "ภูเขา", en: "Mountain" },
      Temple: { emoji: "🛕", th: "วัด", en: "Temple" },
    };
    if (!categoryName) return { emoji: "🌏", th: "สถานที่ทั้งหมด", en: "All Places" };
    return categoryMap[categoryName] || { emoji: "📍", th: categoryName, en: categoryName };
  };

  if (isLoading) {
    return (
      <div data-testid="loading-skeleton" className="h-full bg-background px-4 pb-8">
        {/* Header Skeleton */}
        <div className="border-b border-border/30 bg-card/50 backdrop-blur-sm mb-6 sticky top-0 z-20">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <div className="text-6xl mb-4">😢</div>
        <h3 className="text-xl font-semibold mb-2">
          {currentLanguage === "th" ? "เกิดข้อผิดพลาด" : "An Error Occurred"}
        </h3>
        <p className="text-muted-foreground">
          {currentLanguage === "th"
            ? "ขออภัย, ไม่สามารถเชื่อมต่อกับบริการได้ในขณะนี้"
            : "Service temporarily unavailable. Please try again later."}
        </p>
        <p className="text-xs text-muted-foreground mt-2 italic">
          {error?.message || "TypeError: Load failed"}
        </p>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(decodedCategory);
  const displayName = currentLanguage === "th" ? categoryInfo.th : categoryInfo.en;

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-card/50 backdrop-blur-sm mb-6 sticky top-0 z-20">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{categoryInfo.emoji}</span>
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-sm text-muted-foreground">
                {attractions.length}{" "}
                {currentLanguage === "th" ? "สถานที่" : "places found"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        {attractions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {attractions.map((attraction) => (
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
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">
              {currentLanguage === "th"
                ? "ไม่พบสถานที่ในหมวดนี้"
                : "No places found in this category"}
            </h3>
            <p className="text-muted-foreground">
              {currentLanguage === "th"
                ? "ลองเลือกหมวดหมู่อื่นหรือกลับไปที่หน้าหลัก"
                : "Try selecting another category or go back to the home page"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryView;
