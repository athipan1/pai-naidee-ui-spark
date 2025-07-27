import { Home, Compass, Heart, User } from "lucide-react";
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
      id: "favorites",
      path: "/favorites",
      label: { th: "รายการโปรด", en: "Favorites" },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border/50 safe-area-bottom">
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
                  flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 min-w-[60px]
                  ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                  }
                `}
              >
                <div className={`nav-icon ${isActive ? "scale-110" : ""}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">
                  {tab.label[currentLanguage]}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="w-1 h-1 bg-primary rounded-full animate-scale-in" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
