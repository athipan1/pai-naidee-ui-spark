import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import SearchSection from "@/components/common/SearchSection";
import CategoryFilter from "@/components/common/CategoryFilter";
import { useDiscoveryState, DiscoveryMode } from "./hooks/useDiscoveryState";
import FeedView from "./FeedView";
import SearchView from "./SearchView";
import CategoryView from "./CategoryView";
import MapView from "./MapView";
import { useAllAttractions } from '@/shared/hooks/useAttractionQueries';
import EnhancedLanguageToggle from '@/components/common/EnhancedLanguageToggle';

interface DiscoverLayoutProps {
  currentLanguage: "th" | "en";
  onLanguageChange: (language: "th" | "en") => void;
}

const DiscoverLayout = ({ currentLanguage, onLanguageChange }: DiscoverLayoutProps) => {
  const navigate = useNavigate();
  const { state, setMode, setQuery, setCategory, setSearchFilters } = useDiscoveryState();

  const content = {
    th: {
      discover: "สำรวจ",
      feed: "ฟีด",
      search: "ค้นหา",
      category: "หมวดหมู่",
      map: "แผนที่",
      trending: "ยอดนิยม",
      searchPlaceholder: "ค้นหาสถานที่...",
      back: "กลับ",
      filters: "ตัวกรอง"
    },
    en: {
      discover: "Discover",
      feed: "Feed",
      search: "Search",
      category: "Category", 
      map: "Map",
      trending: "Trending",
      searchPlaceholder: "Search places...",
      back: "Back",
      filters: "Filters"
    },
  };

  const t = content[currentLanguage];

  // Handle search from SearchSection component
  const handleSearch = (query: string) => {
    setQuery(query);
  };

  // Handle category selection from CategoryFilter component  
  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      setMode("feed");
      setCategory("");
    } else {
      setCategory(category);
    }
  };

  // Calculate the counts using every paginated Railway result.
  const { data: catalog } = useAllAttractions(undefined, { enabled: state.mode === 'feed' || state.mode === 'category' });
  const attractionCounts = (catalog?.attractions ?? []).reduce((counts, item) => {
    const key = item.category.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
    counts.all = (counts.all || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const getModeTitle = (mode: DiscoveryMode): string => {
    switch (mode) {
      case 'search':
        return state.query ? `${t.search}: ${state.query}` : t.search;
      case 'category':
        return state.category ? `${t.category}: ${state.category}` : t.category;
      case 'map':
        return t.map;
      case 'trending':
        return t.trending;
      case 'feed':
      default:
        return t.discover;
    }
  };

  const renderContent = () => {
    switch (state.mode) {
      case 'search':
        return (
          <SearchView
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
            onSearch={handleSearch}
            query={state.query}
            category={state.category}
            province={state.province}
            onFiltersChange={setSearchFilters}
          />
        );
      case 'category':
        return (
          <CategoryView
            currentLanguage={currentLanguage}
            category={state.category}
          />
        );
      case 'map':
        return (
          <MapView
            currentLanguage={currentLanguage}
            selectedAttractionId={state.selectedAttractionId}
          />
        );
      case 'trending':
        return <FeedView currentLanguage={currentLanguage} />;
      case 'feed':
      default:
        return <FeedView currentLanguage={currentLanguage} />;
    }
  };

  const shouldShowSearchAndFilter = state.mode === 'feed' || state.mode === 'category';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`${state.mode === 'search' ? 'hidden md:block' : ''} sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="md:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-foreground">
                {getModeTitle(state.mode)}
              </h1>
            </div>

            {/* Mode Switcher - Only show for non-mobile or when relevant */}
            <div className="flex items-center space-x-2">
              <EnhancedLanguageToggle currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange} variant="button" size="sm" />
              {state.mode !== 'feed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('feed')}
                  className="hidden md:flex"
                >
                  {t.feed}
                </Button>
              )}
              
              <Tabs value={state.mode} onValueChange={(value) => setMode(value as DiscoveryMode)}>
                <TabsList className="hidden md:grid w-auto grid-cols-5">
                  <TabsTrigger value="feed">{t.feed}</TabsTrigger>
                  <TabsTrigger value="search">{t.search}</TabsTrigger>
                  <TabsTrigger value="category">{t.category}</TabsTrigger>
                  <TabsTrigger value="map">{t.map}</TabsTrigger>
                  <TabsTrigger value="trending" disabled>{t.trending}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter Section - only show for feed and category modes */}
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

      {/* Mobile Mode Switcher */}
      <div className={`${state.mode === 'search' ? 'hidden' : ''} md:hidden border-b border-border/30 bg-card/30`}>
        <div className="container mx-auto px-4">
          <Tabs value={state.mode} onValueChange={(value) => setMode(value as DiscoveryMode)}>
            <TabsList className="grid w-full grid-cols-5 h-12">
              <TabsTrigger value="feed" className="text-xs">{t.feed}</TabsTrigger>
              <TabsTrigger value="search" className="text-xs">{t.search}</TabsTrigger>
              <TabsTrigger value="category" className="text-xs">{t.category}</TabsTrigger>
              <TabsTrigger value="map" className="text-xs">{t.map}</TabsTrigger>
              <TabsTrigger value="trending" disabled className="text-xs">{t.trending}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

export default DiscoverLayout;
