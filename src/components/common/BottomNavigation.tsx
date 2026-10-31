import { Compass, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface BottomNavigationProps {
  currentLanguage: "th" | "en";
}

const BottomNavigation = ({ currentLanguage }: BottomNavigationProps) => {
  const location = useLocation();
  
  // Helper function to determine if a tab is active
  const isTabActive = (tabPath: string) => {
    if (tabPath === "/discover") {
      return location.pathname === "/" || 
             location.pathname === "/discover" || 
             location.pathname.startsWith("/category") ||
             location.pathname.startsWith("/explore") ||
             location.pathname.startsWith("/search") ||
             location.pathname.startsWith("/map");
    }
    return location.pathname.startsWith(tabPath);
  };

  // Base navigation tabs - minimal set
  const baseTabs = [
    {
      id: "discover",
      path: "/discover",
      label: { th: "สำรวจ", en: "Discover" },
      icon: Compass,
    },
    {
      id: "trip-planner",
      path: "/trip-planner",
      label: { th: "AI วางแผนเที่ยว", en: "AI Trip Planner" },
      icon: Sparkles,
    },
  ];

  const tabs = baseTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/20 safe-area-bottom">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-sm items-center justify-center gap-5 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isTabActive(tab.path);

            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`
                  flex min-w-[120px] flex-col items-center space-y-1 rounded-xl p-3 transition-all duration-300 relative overflow-hidden interactive-scale
                  ${
                    isActive
                      ? "text-primary bg-primary/20 shadow-lg"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/30"
                  }
                  ${tab.id === "admin" ? "text-orange-600" : ""}
                `}
              >
                <div className={`nav-icon transition-all duration-300 ${isActive ? "scale-110 animate-bounce" : ""}`}>
                  <Icon className={`w-6 h-6 ${isActive ? "drop-shadow-md" : ""} ${tab.id === "admin" ? "text-orange-600" : ""}`} />
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${isActive ? "font-semibold" : ""} ${tab.id === "admin" ? "text-orange-600" : ""}`}>
                  {tab.label[currentLanguage]}
                </span>

                {/* Enhanced active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                    <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${tab.id === "admin" ? "bg-orange-600" : "bg-primary"}`} />
                  </div>
                )}

                {/* Admin badge */}
                {tab.id === "admin" && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-orange-600 rounded-full border border-background" />
                  </div>
                )}

                {/* Ripple effect background */}
                <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
