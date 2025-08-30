import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, Suspense, lazy } from "react";
import { MediaProvider } from "@/shared/contexts/MediaProvider";
import { UIProvider, useUIContext } from "@/shared/contexts/UIContext";
import { useCommunity } from "@/shared/hooks/useCommunity";
import { CreatePost } from "@/components/community/CreatePost";
import DevTools from "@/components/dev/DevTools";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { SkipLink, useResponsiveTextSize } from "@/components/common/AccessibilityUtils";
import AIAssistantTrigger from "@/components/common/AIAssistantTrigger";
import BackendStatusIndicator from "@/components/common/BackendStatusIndicator";

// Lazy load the GlobalAIAssistant 3D module
const GlobalAIAssistant = lazy(() => import("@/components/3D/GlobalAIAssistant"));

// Lazy load new consolidated routes
const DiscoverLayout = lazy(() => import("./routes/Discover/DiscoverLayout"));
const SavedPage = lazy(() => import("./routes/Saved/SavedPage"));
const AdminLayout = lazy(() => import("./routes/Admin/AdminLayout"));
const ProfilePage = lazy(() => import("./routes/Profile/ProfilePage"));

// Keep existing essential routes
const Index = lazy(() => import("./pages/Index"));
const AttractionDetail = lazy(() => import("./pages/AttractionDetail"));
const CommunityFeed = lazy(() => import("./pages/Community"));
const InstagramDemo = lazy(() => import("./pages/InstagramDemo"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VideoUploadPage = lazy(() => import("./pages/VideoUploadPage"));
const ContextualSearchResults = lazy(() => import("./pages/ContextualSearchResults"));

// --- PaiNaiDee Example Pages ---
const PaiNaiDeeUsers = lazy(() => import("./pages/PaiNaiDeeUsers"));
const PaiNaiDeeTasks = lazy(() => import("./pages/PaiNaiDeeTasks"));
// --- End PaiNaiDee Example Pages ---

// --- System Pages ---
const HealthCheckPage = lazy(() => import("./pages/HealthCheckPage"));
// --- End System Pages ---

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

const AppContent = () => {
  const [currentLanguage, setCurrentLanguage] = useState<"th" | "en">("en");
  const [isAIAssistantLoaded, setIsAIAssistantLoaded] = useState(false);

  const { isCreatePostModalOpen, closeCreatePostModal } = useUIContext();
  const { createPost, isCreatingPost } = useCommunity();

  // Apply responsive text sizing for better accessibility
  useResponsiveTextSize();

  const handleCreatePost = (postData) => {
    createPost(postData, {
      onSuccess: () => {
        closeCreatePostModal();
      }
    });
  };

  return (
    <>
      <BackendStatusIndicator />
      <SkipLink />
      <Suspense fallback={
        <LoadingSpinner
          useSkeletonLoader={false}
          text={currentLanguage === "th" ? "กำลังโหลด..." : "Loading..."}
        />
      }>
        <Routes>
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
              />
            }
          />
          <Route
            path="/community/instagram"
            element={
              <InstagramDemo />
            }
          />
          <Route
            path="/search"
            element={
              <ContextualSearchResults
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
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
          {/* Legacy Route Redirects */}
          <Route path="/explore" element={<ExploreRedirect />} />
          <Route path="/favorites" element={<FavoritesRedirect />} />
          <Route path="/search" element={<SearchRedirect />} />
          <Route path="/map/:id?" element={<MapRedirect />} />
          <Route path="/ai-assistant" element={<AIAssistantRedirect />} />
          <Route path="/admin-panel" element={<AdminPanelRedirect />} />
          <Route path="/admin/enhanced" element={<EnhancedAdminRedirect />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/profile" element={<ProfileRedirect />} />
          <Route
            path="/category/:categoryName"
            element={<ExploreRedirect />}
          />
          {/* Dev routes */}
          {AccordionExamples && import.meta.env.DEV && (
            <Route
              path="/accordion-examples"
              element={<AccordionExamples />}
            />
          )}
          <Route path="/health-check" element={<HealthCheckPage />} />
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />

          {/* --- PaiNaiDee Example Routes --- */}
          <Route
            path="/painaidee/users"
            element={<PaiNaiDeeUsers />}
          />
          <Route
            path="/painaidee/tasks"
            element={<PaiNaiDeeTasks />}
          />
          {/* --- End PaiNaiDee Example Routes --- */}
        </Routes>
      </Suspense>
      {isAIAssistantLoaded ? (
        <Suspense fallback={
          <div className="fixed bottom-6 right-6 z-50">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
          </div>
        }>
          <GlobalAIAssistant language={currentLanguage} />
        </Suspense>
      ) : (
        <AIAssistantTrigger
          onClick={() => setIsAIAssistantLoaded(true)}
          language={currentLanguage}
        />
      )}
      <CreatePost
        open={isCreatePostModalOpen}
        onOpenChange={(isOpen) => !isOpen && closeCreatePostModal()}
        onSubmit={handleCreatePost}
        isSubmitting={isCreatingPost}
      />
      <DevTools />
    </>
  );
};


const App = () => {
  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <QueryClientProvider client={queryClient}>
        <MediaProvider>
          <UIProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </UIProvider>
        </MediaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
