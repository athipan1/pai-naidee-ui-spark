import { Home, Compass, Heart, User, Users, Bot } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface BottomNavigationProps {
  currentLanguage: "th" | "en";
}

const BottomNavigation = ({ currentLanguage }: BottomNavigationProps) => {
  const location = useLocation();
  
  // Helper function to determine if a tab is active
  const isTabActive = (tabPath: string) => {
    if (tabPath === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/category");
    }
    return location.pathname.startsWith(tabPath);
  };

  const tabs = [
    {
      id: "home",
      path: "/",
      label: { th: "หน้าแรก", en: "Home" },
      icon: Home,
    },
    {
      id: "explore",
      path: "/explore",
      label: { th: "สำรวจ", en: "Explore" },
      icon: Compass,
    },
    {
      id: "ai-assistant",
      path: "/ai-assistant",
      label: { th: "AI ผู้ช่วย", en: "AI Chat" },
      icon: Bot,
    },
    {
      id: "community",
      path: "/community",
      label: { th: "ชุมชน", en: "Community" },
      icon: Users,
    },
    {
      id: "favorites",
      path: "/favorites",
      label: { th: "โปรด", en: "Favorites" },
      icon: Heart,
    },
    {
      id: "profile",
      path: "/profile",
      label: { th: "โปรไฟล์", en: "Profile" },
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/20 safe-area-bottom">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isTabActive(tab.path);

            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`
                  flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-500 min-w-[70px] relative overflow-hidden interactive-scale
                  ${
                    isActive
                      ? "text-primary bg-primary/20 shadow-lg"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/30"
                  }
                `}
              >
                <div className={`nav-icon transition-all duration-300 ${isActive ? "scale-110 animate-bounce" : ""}`}>
                  <Icon className={`w-6 h-6 ${isActive ? "drop-shadow-md" : ""}`} />
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${isActive ? "font-semibold" : ""}`}>
                  {tab.label[currentLanguage]}
                </span>

                {/* Enhanced active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg" />
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
