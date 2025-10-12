import { Header } from "@/components/common/Header";
import SearchSection from "@/components/common/SearchSection";
import CategoryFilter from "@/components/common/CategoryFilter";
import { useDiscoveryState, DiscoveryMode } from "./hooks/useDiscoveryState";
import FeedView from "./FeedView";
import SearchView from "./SearchView";
import CategoryView from "./CategoryView";
import MapView from "./MapView";
import TrendingView from "./TrendingView";

interface DiscoverLayoutProps {
  currentLanguage: "th" | "en";
}

const DiscoverLayout = ({ currentLanguage, onLanguageChange }: { currentLanguage: 'th' | 'en', onLanguageChange: (lang: 'th' | 'en') => void }) => {
  const { state, setMode, setQuery, setCategory } = useDiscoveryState();

  const handleSearch = (query: string) => {
    setQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      setMode("feed");
      setCategory("");
    } else {
      setCategory(category);
    }
  };

  const attractionCounts = {
    all: 12,
    beach: 4,
    culture: 3,
    nature: 3,
    food: 2
  };

  const renderContent = () => {
    switch (state.mode) {
      case 'search':
        return <SearchView currentLanguage={currentLanguage} query={state.query} category={state.category} />;
      case 'category':
        return <CategoryView currentLanguage={currentLanguage} category={state.category} />;
      case 'map':
        return <MapView currentLanguage={currentLanguage} selectedAttractionId={state.selectedAttractionId} />;
      case 'trending':
        return <TrendingView currentLanguage={currentLanguage} />;
      case 'feed':
      default:
        return <FeedView currentLanguage={currentLanguage} />;
    }
  };

  const shouldShowSearchAndFilter = state.mode === 'feed' || state.mode === 'category';

  return (
    <div className="min-h-screen bg-background">
      <Header currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />

      {shouldShowSearchAndFilter && (
        <div className="border-b border-border/30 bg-card/30">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <SearchSection
              currentLanguage={currentLanguage}
              onSearch={handleSearch}
            />
            <CategoryFilter
              currentLanguage={currentLanguage}
              selectedCategory={state.category || "all"}
              onCategoryChange={handleCategoryChange}
              attractionCounts={attractionCounts}
            />
          </div>
        </div>
      )}

      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

export default DiscoverLayout;