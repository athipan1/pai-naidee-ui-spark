import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlaces } from "@/hooks/usePlaces";
import PlaceList from "@/components/discover/PlaceList";
import CategoryFilter from "@/components/discover/CategoryFilter";
import SearchBar from "@/components/discover/SearchBar";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/discover/SectionHeader";
import { MapPin } from "lucide-react";

interface FeedViewProps {
  currentLanguage: "th" | "en";
}

const FeedView: React.FC<FeedViewProps> = ({ currentLanguage }) => {
  const navigate = useNavigate();
  const {
    places,
    isLoading,
    error,
    hasMore,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    loadMore,
  } = usePlaces({ limit: 20 });

  const handlePlaceClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (newCategory: string | null) => {
    setCategory(newCategory);
  };

  const t = {
    th: {
      allDestinations: "สถานที่ทั้งหมด",
      discover: "สำรวจประเทศไทย",
      searchPlaceholder: "ค้นหาสถานที่ท่องเที่ยว (เช่น วัดโพธิ์, ดอยสุเทพ...)",
      loadingMore: "กำลังโหลดเพิ่มเติม...",
      noMorePlaces: "ไม่พบสถานที่เพิ่มเติม",
    },
    en: {
      allDestinations: "All Destinations",
      discover: "Discover Thailand",
      searchPlaceholder: "Search for attractions (e.g., Wat Pho, Doi Suthep...)",
      loadingMore: "Loading more...",
      noMorePlaces: "No more places to show.",
    },
  }[currentLanguage];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header and Search */}
        <header className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {t.discover}
          </h1>
          <SearchBar
            onSearchChange={handleSearchChange}
            initialQuery={searchQuery}
            placeholder={t.searchPlaceholder}
          />
        </header>

        {/* Category Filter */}
        <section>
          <CategoryFilter
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
          />
        </section>

        {/* Main Content Section */}
        <section>
          <SectionHeader
            title={t.allDestinations}
            icon={MapPin}
            currentLanguage={currentLanguage}
          />
          
          <PlaceList
            places={places}
            isLoading={isLoading && places.length === 0} // Only show skeleton on initial load
            error={error}
            currentLanguage={currentLanguage}
            onCardClick={handlePlaceClick}
          />

          {/* Infinite Scroll Trigger */}
          <div className="text-center mt-8">
            {isLoading && places.length > 0 && (
              <p className="text-gray-500">{t.loadingMore}</p>
            )}
            {!isLoading && hasMore && (
              <Button onClick={loadMore} variant="outline">
                Load More
              </Button>
            )}
            {!isLoading && !hasMore && places.length > 0 && (
              <p className="text-gray-500">{t.noMorePlaces}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FeedView;