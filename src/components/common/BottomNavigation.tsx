import { Compass, Heart, User, Users, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

// Simple admin role check - in real app this would come from auth context
const useAdminRole = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // TODO: Replace with actual auth check
    // For demo purposes, we'll simulate admin check
    const isAdminUser = localStorage.getItem('isAdmin') === 'true' || import.meta.env.DEV;
    setIsAdmin(isAdminUser);
  }, []);
  
  return isAdmin;
};

const BottomNavigation = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const isAdmin = useAdminRole();
  
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
    if (tabPath === "/saved") {
      return location.pathname.startsWith("/saved") || 
             location.pathname.startsWith("/favorites");
    }
    if (tabPath === "/me") {
      return location.pathname.startsWith("/profile") || 
             location.pathname === "/me";
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
      id: "community",
      path: "/community",
      label: { th: "ชุมชน", en: "Community" },
      icon: Users,
    },
    {
      id: "saved",
      path: "/saved",
      label: { th: "บันทึก", en: "Saved" },
      icon: Heart,
    },
    {
      id: "me",
      path: "/me",
      label: { th: "ฉัน", en: "Me" },
      icon: User,
    },
  ];

  // Add admin tab if user is admin
  const tabs = isAdmin ? [
    ...baseTabs,
    {
      id: "admin",
      path: "/admin",
      label: { th: "แอดมิน", en: "Admin" },
      icon: Shield,
    },
  ] : baseTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/20 safe-area-bottom">
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-around py-2 ${isAdmin ? 'grid grid-cols-5' : ''}`}>
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
                  ${tab.id === "admin" ? "text-orange-600" : ""}
                `}
              >
                <div className={`nav-icon transition-all duration-300 ${isActive ? "scale-110 animate-bounce" : ""}`}>
                  <Icon className={`w-6 h-6 ${isActive ? "drop-shadow-md" : ""} ${tab.id === "admin" ? "text-orange-600" : ""}`} />
                </div>
                <span className={`text-xs font-medium transition-all duration-300 ${isActive ? "font-semibold" : ""} ${tab.id === "admin" ? "text-orange-600" : ""}`}>
                  {tab.label[language]}
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
