import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, Suspense, lazy } from "react";
import { MediaProvider } from "@/shared/contexts/MediaProvider";
import DevTools from "@/components/dev/DevTools";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Explore = lazy(() => import("./pages/Explore"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Profile = lazy(() => import("./pages/Profile"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const AccordionExamples = lazy(() => import("./pages/AccordionExamples"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AttractionDetail = lazy(() => import("./pages/AttractionDetail"));
const MapPage = lazy(() => import("./pages/MapPage"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const EnhancedAdminPanel = lazy(() => import("@/components/admin/EnhancedAdminPanel"));
const VideoUploadPage = lazy(() => import("./pages/VideoUploadPage"));
const AIAssistantPage = lazy(() => import("./pages/AIAssistantPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      retry: (failureCount, error) => {
        // Don't retry for 404 errors
        if (error?.message?.includes('not found')) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnReconnect: true, // Refetch when internet connection is restored
    },
    mutations: {
      retry: 2,
    },
  },
});

const App = () => {
  const [currentLanguage, setCurrentLanguage] = useState<"th" | "en">("en");

  return (
    <QueryClientProvider client={queryClient}>
      <MediaProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Index
                      currentLanguage={currentLanguage}
                      onLanguageChange={setCurrentLanguage}
                    />
                  }
                />
                <Route
                  path="/explore"
                  element={
                    <Explore
                      currentLanguage={currentLanguage}
                      onBack={() => window.history.back()}
                    />
                  }
                />
                <Route
                  path="/favorites"
                  element={<Favorites currentLanguage={currentLanguage} />}
                />
                <Route
                  path="/profile"
                  element={
                    <Profile
                      currentLanguage={currentLanguage}
                      onLanguageChange={setCurrentLanguage}
                      onBack={() => window.history.back()}
                    />
                  }
                />
                <Route
                  path="/attraction/:id"
                  element={
                    <AttractionDetail
                      currentLanguage={currentLanguage}
                      onBack={() => window.history.back()}
                    />
                  }
                />
                <Route
                  path="/map/:id?"
                  element={
                    <MapPage
                      currentLanguage={currentLanguage}
                      onBack={() => window.history.back()}
                    />
                  }
                />
                <Route
                  path="/search"
                  element={
                    <SearchResults currentLanguage={currentLanguage} />
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <Dashboard
                      currentLanguage={currentLanguage}
                      onBack={() => window.history.back()}
                    />
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminPanel currentLanguage={currentLanguage} />
                  }
                />
                <Route
                  path="/admin/enhanced"
                  element={
                    <EnhancedAdminPanel currentLanguage={currentLanguage} />
                  }
                />
                <Route
                  path="/video-upload"
                  element={
                    <VideoUploadPage 
                      currentLanguage={currentLanguage}
                      onBack={() => window.history.back()}
                    />
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={
                    <AIAssistantPage 
                      currentLanguage={currentLanguage}
                      onBack={() => window.history.back()}
                    />
                  }
                />
                <Route
                  path="/category/:categoryName"
                  element={<CategoryPage currentLanguage={currentLanguage} />}
                />
                <Route
                  path="/accordion-examples"
                  element={<AccordionExamples />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <DevTools />
        </TooltipProvider>
      </MediaProvider>
    </QueryClientProvider>
  );
};

export default App;
