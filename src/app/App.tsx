import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSupabaseConfigStatus } from "@/services/supabase.service";
import ConfigError from "@/components/common/ConfigError";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, Suspense, lazy } from "react";
import { MediaProvider } from "@/shared/contexts/MediaProvider";
import { UIProvider, useUIContext } from "@/shared/contexts/UIContext";
import { useCreatePost } from "@/shared/hooks/useCommunityQueries";
import { CreatePost } from "@/components/community/CreatePost";
import DevTools from "@/components/dev/DevTools";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { SkipLink, useResponsiveTextSize } from "@/components/common/AccessibilityUtils";

// Lazy load new consolidated routes
const DiscoverLayout = lazy(() => import("./routes/Discover/DiscoverLayout"));
const SavedPage = lazy(() => import("./routes/Saved/SavedPage"));
const AdminLayout = lazy(() => import("./routes/Admin/AdminLayout"));
const ProfilePage = lazy(() => import("./routes/Profile/ProfilePage"));

// Keep existing essential routes
const Index = lazy(() => import("./pages/Index"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AttractionDetail = lazy(() => import("./pages/AttractionDetail"));
const CommunityFeed = lazy(() => import("./pages/Community"));
const InstagramDemo = lazy(() => import("./pages/InstagramDemo"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ContextualSearchResults = lazy(() => import("./pages/ContextualSearchResults"));

// --- PaiNaiDee Example Pages ---
// const PaiNaiDeeUsers = lazy(() => import("./pages/PaiNaiDeeUsers"));
// const PaiNaiDeeTasks = lazy(() => import("./pages/PaiNaiDeeTasks"));
// --- End PaiNaiDee Example Pages ---

// --- System Pages ---
const SupabaseDiagnostic = lazy(() => import("./pages/SupabaseDiagnostic"));
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
  ProfileRedirect,
  CategoryRedirect
} from "./routes/Redirects";
import Dashboard from "./routes/Admin/Dashboard";
import AttractionManager from "@/components/admin/AttractionManager";
import Moderation from "./routes/Admin/Moderation";
import Analytics from "./routes/Admin/Analytics";

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

  const { isCreatePostModalOpen, closeCreatePostModal } = useUIContext();
  const { mutate: createPost, isPending: isCreatingPost } = useCreatePost();

  // Apply responsive text sizing for better accessibility
  useResponsiveTextSize();

  const handleCreatePost = (postData) => {
    // TODO: Replace with actual user ID from auth context
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    createPost({ ...postData, user_id: userId }, {
      onSuccess: () => {
        closeCreatePostModal();
      }
    });
  };

  return (
    <>
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
            element={<AdminLayout currentLanguage={currentLanguage} />}
          >
            <Route index element={<DashboardRedirect to="/admin/dashboard" />} />
            <Route path="dashboard" element={<Dashboard currentLanguage={currentLanguage} />} />
            <Route path="media" element={<AttractionManager currentLanguage={currentLanguage} />} />
            <Route path="moderation" element={<Moderation currentLanguage={currentLanguage} />} />
            <Route path="analytics" element={<Analytics currentLanguage={currentLanguage} />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
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
              />
            }
          />
          <Route
            path="/community/instagram"
            element={
              <InstagramDemo />
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
            element={<CategoryRedirect />}
          />
          {/* Dev routes */}
          {AccordionExamples && import.meta.env.DEV && (
            <Route
              path="/accordion-examples"
              element={<AccordionExamples />}
            />
          )}
          <Route path="/supabase-diagnostic" element={<SupabaseDiagnostic />} />
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />

          {/* --- PaiNaiDee Example Routes --- */}
          {/* <Route
            path="/painaidee/users"
            element={<PaiNaiDeeUsers />}
          />
          <Route
            path="/painaidee/tasks"
            element={<PaiNaiDeeTasks />}
          /> */}
          {/* --- End PaiNaiDee Example Routes --- */}
        </Routes>
      </Suspense>
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
  const configStatus = getSupabaseConfigStatus();

  if (!configStatus.isConfigured) {
    return <ConfigError missingVariables={configStatus.missingVariables} />;
  }

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

export { AppContent };
export default App;
