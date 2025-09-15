import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAttractions } from "@/shared/hooks/useAttractionQueries";
import APIErrorDisplay from "@/components/common/APIErrorDisplay";
import AttractionCard from "@/components/common/AttractionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AttractionCardSkeleton, ErrorState, EmptyState } from "@/components/common/LoadingStates";

interface ExploreProps {
  currentLanguage: "th" | "en";
  onBack: () => void;
}

const Explore = ({ currentLanguage, onBack }: ExploreProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const { data, isLoading, isError, error, refetch } = useAttractions({ search: searchQuery });

  const handleFavoriteToggle = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleCardClick = (id: string) => {
    navigate(`/attraction/${id}`);
  };

  const content = {
    th: {
      title: "สำรวจ",
      searchPlaceholder: "ค้นหาสถานที่...",
      noResults: "ไม่พบผลลัพธ์",
      tryDifferentKeyword: "ลองใช้คำค้นหาอื่น",
    },
    en: {
      title: "Explore",
      searchPlaceholder: "Search for places...",
      noResults: "No results found",
      tryDifferentKeyword: "Try a different keyword",
    },
  };

  const t = content[currentLanguage];

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t.title}</h1>
        </div>
        
        {/* Search bar skeleton */}
        <div className="mb-6">
          <Skeleton className="w-full h-10 rounded-md" />
        </div>

        {/* Grid of attraction card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <AttractionCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t.title}</h1>
        </div>
        
        <ErrorState
          title="Failed to load attractions"
          message={error?.message || "Unable to fetch attractions. Please check your connection and try again."}
          onRetry={() => refetch()}
          onGoHome={onBack}
          variant="network"
          className="mt-8"
        />
      </div>
    );
  }

  const attractions = data?.attractions || [];

  if (attractions.length === 0) {
    const isSearching = searchQuery.length > 0;
    const emptyTitle = isSearching ? t.noResults : "ยังไม่มีข้อมูลสถานที่";
    const emptyMessage = isSearching ? t.tryDifferentKeyword : "ลองรีเฟรชหน้าเว็บหรือกลับมาใหม่ภายหลัง";

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">{t.title}</h1>
            <div className="w-9"></div> {/* Spacer */}
          </div>
        </header>

        <div className="flex-grow flex items-center justify-center">
          <EmptyState
            title={emptyTitle}
            description={emptyMessage}
            actionLabel={isSearching ? "Clear Search" : "Refresh"}
            onAction={isSearching ? () => setSearchQuery("") : () => refetch()}
            icon={<Search className="w-12 h-12 text-muted-foreground" />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">{t.title}</h1>
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Attractions Grid */}
      <main className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {attractions.map((attraction) => (
            <AttractionCard
              key={attraction.id}
              {...attraction}
              isFavorite={favorites.includes(attraction.id)}
              onFavoriteToggle={handleFavoriteToggle}
              onCardClick={handleCardClick}
              currentLanguage={currentLanguage}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Explore;
