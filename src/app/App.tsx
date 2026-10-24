import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, Suspense, lazy } from "react";
import { MediaProvider } from "@/shared/contexts/MediaProvider";
import { UIProvider } from "@/shared/contexts/UIContext";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import DevTools from "@/components/dev/DevTools";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { SkipLink, useResponsiveTextSize } from "@/components/common/AccessibilityUtils";

// Lazy load new consolidated routes
const DiscoverLayout = lazy(() => import("./routes/Discover/DiscoverLayout"));

// Keep existing essential routes
const Index = lazy(() => import("./pages/Index"));
const AttractionDetail = lazy(() => import("./pages/AttractionDetail"));

const NotFound = lazy(() => import("./pages/NotFound"));


// --- PaiNaiDee Example Pages ---
// const PaiNaiDeeUsers = lazy(() => import("./pages/PaiNaiDeeUsers"));
// const PaiNaiDeeTasks = lazy(() => import("./pages/PaiNaiDeeTasks"));
// --- End PaiNaiDee Example Pages ---

// --- End System Pages ---


// Redirect components for backward compatibility
import {
  ExploreRedirect,
  SearchRedirect,
  MapRedirect,
  AIAssistantRedirect,
  CategoryRedirect
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


  // Apply responsive text sizing for better accessibility
  useResponsiveTextSize();


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
          {/* Public launch: browsing only. Restricted routes never mount write-capable UI. */}
          <Route path="/saved" element={<Navigate to="/discover" replace />} />
          <Route path="/me" element={<Navigate to="/discover" replace />} />
          <Route path="/login" element={<Navigate to="/discover" replace />} />
          <Route path="/admin/*" element={<Navigate to="/discover" replace />} />
          <Route path="/upload/*" element={<Navigate to="/discover" replace />} />
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
          <Route path="/community/*" element={<Navigate to="/discover" replace />} />
          {/* Legacy Route Redirects */}
          <Route path="/explore" element={<ExploreRedirect />} />
          <Route path="/favorites" element={<Navigate to="/discover" replace />} />
          <Route path="/search" element={<SearchRedirect />} />
          <Route path="/map/:id?" element={<MapRedirect />} />
          <Route path="/ai-assistant" element={<AIAssistantRedirect />} />
          <Route path="/admin-panel" element={<Navigate to="/discover" replace />} />
          <Route path="/dashboard" element={<Navigate to="/discover" replace />} />
          <Route path="/profile" element={<Navigate to="/discover" replace />} />
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
      <DevTools />
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export { AppContent };
export default App;
