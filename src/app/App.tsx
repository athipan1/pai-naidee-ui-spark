import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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

const queryClient = new QueryClient();

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
