import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { MediaProvider } from "@/shared/contexts/MediaProvider";
import DevTools from "@/components/dev/DevTools";
import Index from "./pages/Index";
import Explore from "../app/pages/Explore";
import Favorites from "../app/pages/Favorites";
import Profile from "../app/pages/Profile";
import CategoryPage from "./pages/CategoryPage";
import AccordionExamples from "./pages/AccordionExamples";
import NotFound from "./pages/NotFound";
import AttractionDetail from "./pages/AttractionDetail";
import MapPage from "./pages/MapPage";
import SearchResults from "./pages/SearchResults";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";

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
                path="/category/:categoryName"
                element={<CategoryPage currentLanguage={currentLanguage} />}
              />
              <Route
                path="/accordion-examples"
                element={<AccordionExamples />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <DevTools />
        </TooltipProvider>
      </MediaProvider>
    </QueryClientProvider>
  );
};

export default App;
