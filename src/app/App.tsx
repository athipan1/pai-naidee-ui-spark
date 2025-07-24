import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { MediaProvider } from "@/shared/contexts/MediaProvider";
import Index from "./pages/Index";
import Explore from "../app/pages/Explore";
import Favorites from "../app/pages/Favorites";
import Profile from "../app/pages/Profile";
import AttractionDetailNew from "./pages/AttractionDetailNew";
import CategoryPage from "./pages/CategoryPage";
import AccordionExamples from "./pages/AccordionExamples";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [currentLanguage, setCurrentLanguage] = useState<'th' | 'en'>('en');

  return (
    <QueryClientProvider client={queryClient}>
      <MediaProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />} />
              <Route path="/explore" element={<Explore currentLanguage={currentLanguage} onBack={() => window.history.back()} />} />
              <Route path="/favorites" element={<Favorites currentLanguage={currentLanguage} />} />
              <Route path="/profile" element={<Profile currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} onBack={() => window.history.back()} />} />
              <Route path="/attraction/:id" element={<AttractionDetailNew currentLanguage={currentLanguage} onBack={() => window.history.back()} />} />
              <Route path="/category/:categoryName" element={<CategoryPage currentLanguage={currentLanguage} />} />
              <Route path="/accordion-examples" element={<AccordionExamples />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MediaProvider>
    </QueryClientProvider>
  );
};

export default App;
