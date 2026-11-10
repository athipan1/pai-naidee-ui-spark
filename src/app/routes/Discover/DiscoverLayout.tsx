import { lazy, Suspense } from "react";
import { ArrowLeft, Compass, Map, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  useDiscoveryState,
  type DiscoveryMode,
} from "./hooks/useDiscoveryState";
import FeedView from "./FeedView";
import SearchView from "./SearchView";
const MapView = lazy(() => import("./MapView"));
import BottomNavigation from "@/components/common/BottomNavigation";
import EnhancedLanguageToggle from "@/components/common/EnhancedLanguageToggle";

interface DiscoverLayoutProps {
  currentLanguage: "th" | "en";
  onLanguageChange: (language: "th" | "en") => void;
}

const DiscoverLayout = ({
  currentLanguage,
  onLanguageChange,
}: DiscoverLayoutProps) => {
  const navigate = useNavigate();
  const { state, setMode, setQuery, setSearchFilters } = useDiscoveryState();
  const th = currentLanguage === "th";
  const browsing = state.mode === "search" || state.mode === "category";

  return (
    <div className="discovery-theme min-h-screen bg-muted/20 pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0"
              aria-label={th ? "ย้อนกลับ" : "Go back"}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="hidden text-xs font-semibold tracking-widest text-primary sm:block">
                PAINAIDEE
              </p>
              <h1 className="text-xl font-bold tracking-tight">
                {th ? "สำรวจ" : "Discover"}
              </h1>
            </div>
          </div>
          <EnhancedLanguageToggle
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
            variant="button"
            size="sm"
          />
        </div>
      </header>
      <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6 lg:px-8">
        <Tabs
          value={
            state.mode === "category"
              ? "search"
              : state.mode === "trending"
                ? "feed"
                : state.mode
          }
          onValueChange={(value) => setMode(value as DiscoveryMode)}
        >
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted p-1 sm:w-fit">
            <TabsTrigger
              value="search"
              className="min-h-11 gap-2 rounded-lg px-3 sm:px-6"
            >
              <Search className="h-4 w-4" />
              {th ? "ค้นหา" : "Search"}
            </TabsTrigger>
            <TabsTrigger
              value="feed"
              className="min-h-11 gap-2 rounded-lg px-3 sm:px-6"
            >
              <Sparkles className="h-4 w-4" />
              {th ? "ฟีด" : "Feed"}
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="min-h-11 gap-2 rounded-lg px-3 sm:px-6"
            >
              <Map className="h-4 w-4" />
              {th ? "ใกล้ฉัน" : "Nearby"}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {browsing && (
          <div className="mb-5 mt-5 sm:mt-7">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Compass className="h-4 w-4" />
              {th
                ? "ออกไปพบมุมใหม่ของเมืองไทย"
                : "Find your next corner of Thailand"}
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {th ? "ทริปต่อไป เริ่มจากที่นี่" : "Your next trip starts here"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {th
                ? "ค้นหาจุดหมาย เลือกจังหวัด แล้วออกเดินทางในแบบของคุณ"
                : "Find a destination, pick a province, and make it your own."}
            </p>
          </div>
        )}
      </div>
      <main id="discover-content" className="mx-auto max-w-[1600px]">
        {browsing ? (
          <SearchView
            currentLanguage={currentLanguage}
            onSearch={setQuery}
            query={state.query}
            category={state.category}
            province={state.province}
            onFiltersChange={setSearchFilters}
          />
        ) : state.mode === "map" ? (
          <Suspense
            fallback={
              <p role="status" className="p-6">
                {th ? "กำลังโหลดแผนที่…" : "Loading map…"}
              </p>
            }
          >
            <MapView
              currentLanguage={currentLanguage}
              selectedAttractionId={state.selectedAttractionId}
              filters={{
                search: state.query || undefined,
                category: state.category || undefined,
                province: state.province || undefined,
              }}
            />
          </Suspense>
        ) : (
          <FeedView
            currentLanguage={currentLanguage}
            onBrowseAll={() =>
              setSearchFilters({ category: "", province: state.province })
            }
          />
        )}
      </main>
      <BottomNavigation currentLanguage={currentLanguage} />
    </div>
  );
};
export default DiscoverLayout;
