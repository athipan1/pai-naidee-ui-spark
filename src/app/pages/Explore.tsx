import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAttractions } from "@/shared/hooks/useAttractionQueries";
import { APIErrorDisplay } from "@/components/common/APIErrorDisplay";
import AttractionCard from "@/components/common/AttractionCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ExploreProps {
  currentLanguage: "th" | "en";
  onBack: () => void;
}

const Explore = ({ currentLanguage, onBack }: ExploreProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isError, error, refetch } = useAttractions({ search: searchQuery });

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
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 h-screen flex items-center justify-center">
        <APIErrorDisplay
          error={error}
          onRetry={refetch}
          currentLanguage={currentLanguage}
        />
      </div>
    );
  }

  const attractions = data?.attractions || [];

  if (attractions.length === 0) {
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
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">{t.noResults}</p>
            <p className="text-muted-foreground">{t.tryDifferentKeyword}</p>
          </div>
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
              attraction={attraction}
              onClick={() => navigate(`/attraction/${attraction.id}`)}
              currentLanguage={currentLanguage}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Explore;
