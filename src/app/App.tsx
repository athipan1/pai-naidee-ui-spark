import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, Suspense, lazy } from "react";
import { MediaProvider } from "@/shared/contexts/MediaProvider";
import DevTools from "@/components/dev/DevTools";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { SkipLink, useResponsiveTextSize } from "@/components/common/AccessibilityUtils";
import GlobalAIAssistant from "@/components/3D/GlobalAIAssistant";

// Lazy load new consolidated routes
const DiscoverLayout = lazy(() => import("./routes/Discover/DiscoverLayout"));
const SavedPage = lazy(() => import("./routes/Saved/SavedPage"));
const AdminLayout = lazy(() => import("./routes/Admin/AdminLayout"));
const ProfilePage = lazy(() => import("./routes/Profile/ProfilePage"));

// Keep existing essential routes
const Index = lazy(() => import("./pages/Index"));
const AttractionDetail = lazy(() => import("./pages/AttractionDetail"));
const CommunityFeed = lazy(() => import("./pages/Community"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VideoUploadPage = lazy(() => import("./pages/VideoUploadPage"));

// Redirect components for backward compatibility
import {
  ExploreRedirect,
  FavoritesRedirect,
  SearchRedirect,
  MapRedirect,
  AIAssistantRedirect,
  AdminPanelRedirect,
  EnhancedAdminRedirect,
  DashboardRedirect,
  ProfileRedirect
} from "./routes/Redirects";

// Conditionally load AccordionExamples only in development
const AccordionExamples = import.meta.env.DEV 
  ? lazy(() => import("./pages/AccordionExamples"))
  : null;

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

  // Apply responsive text sizing for better accessibility
  useResponsiveTextSize();

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <QueryClientProvider client={queryClient}>
        <MediaProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SkipLink />
              <Suspense fallback={
                <LoadingSpinner 
                  useSkeletonLoader={false}
                  text={currentLanguage === "th" ? "กำลังโหลด..." : "Loading..."}
                />
              }>
                <Routes>
                {/* 
                  Route Consolidation Summary:
                  - / -> Home (lightweight, redirects to /discover for main content)
                  - /discover -> Unified discovery interface (mode=feed|category|search|map|trending)
                  - /saved -> Consolidated favorites/saved content
                  - /community -> Community feed (unchanged)
                  - /me -> Profile with language toggle and settings
                  - /admin -> Consolidated admin console (role-gated)
                  
                  Legacy routes redirect to new canonical paths for backward compatibility
                */}
                
                {/* Main Routes */}
                <Route
                  path="/"
                  element={
                    <Index
                      currentLanguage={currentLanguage}
                      onLanguageChange={setCurrentLanguage}
                    />
                  }
                />
                
                {/* New Consolidated Routes */}
                <Route
                  path="/discover"
                  element={
                    <DiscoverLayout currentLanguage={currentLanguage} />
                  }
                />
                
                <Route
                  path="/saved"
                  element={
                    <SavedPage currentLanguage={currentLanguage} />
                  }
                />
                
                <Route
                  path="/me"
                  element={
                    <ProfilePage
                      currentLanguage={currentLanguage}
                      onLanguageChange={setCurrentLanguage}
                    />
                  }
                />
                
                <Route
                  path="/admin"
                  element={
                    <AdminLayout currentLanguage={currentLanguage} />
                  }
                />

                {/* Existing Essential Routes */}
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
                  path="/community"
                  element={
                    <CommunityFeed
                      currentLanguage={currentLanguage}
                      onLanguageChange={setCurrentLanguage}
                      onBack={() => window.history.back()}
                    />
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

                {/* Legacy Route Redirects for Backward Compatibility */}
                <Route path="/explore" element={<ExploreRedirect />} />
                <Route path="/favorites" element={<FavoritesRedirect />} />
                <Route path="/search" element={<SearchRedirect />} />
                <Route path="/map/:id?" element={<MapRedirect />} />
                <Route path="/ai-assistant" element={<AIAssistantRedirect />} />
                <Route path="/admin-panel" element={<AdminPanelRedirect />} />
                <Route path="/admin/enhanced" element={<EnhancedAdminRedirect />} />
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route path="/profile" element={<ProfileRedirect />} />
                
                {/* Legacy category route - redirect to discover with category mode */}
                <Route
                  path="/category/:categoryName"
                  element={<ExploreRedirect />} // Will be handled by DiscoverLayout
                />

                {/* Development-only routes */}
                {AccordionExamples && import.meta.env.DEV && (
                  <Route
                    path="/accordion-examples"
                    element={<AccordionExamples />}
                  />
                )}

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            
            {/* Global AI Assistant - appears on all pages */}
            <GlobalAIAssistant language={currentLanguage} />
            
            <DevTools />
          </BrowserRouter>
        </TooltipProvider>
      </MediaProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
