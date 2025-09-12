import { useState } from "react";
import { Menu, X, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import EnhancedLanguageToggle from "./EnhancedLanguageToggle";
import { useUIContext } from "@/shared/contexts/UIContext";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { openCreatePostModal } = useUIContext();
  const { language, setLanguage } = useLanguage();

  const menuItems = [
    { label: language === "th" ? "หน้าแรก" : "Home", href: "/" },
    { label: language === "th" ? "สำรวจ" : "Explore", href: "/explore" },
    { label: language === "th" ? "ชุมชนนักเดินทาง" : "Community", href: "/community" },
    { label: language === "th" ? "รายการโปรด" : "Favorites", href: "/favorites" },
    { label: language === "th" ? "โปรไฟล์" : "Profile", href: "/profile" },
  ];

  // Helper function to check if route is active
  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const isCommunityPage = location.pathname.startsWith('/community');

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-white/20 shadow-lg safe-area-top">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Enhanced Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 interactive-scale"
          aria-label={language === "th" ? "ไปไหนดี - หน้าแรก" : "PaiNaiDee - Home"}
        >
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg neon-glow">
            <MapPin className="w-6 h-6 text-white animate-float" />
          </div>
          <h1 className="text-xl font-bold text-gradient-tropical font-noto-thai">
            {language === "th" ? "ไปไหนดี" : "PaiNaiDee"}
          </h1>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav
          className="hidden md:flex items-center space-x-6"
          aria-label={language === "th" ? "เมนูหลัก" : "Main navigation"}
        >
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`text-muted-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg relative overflow-hidden ${
                isActiveRoute(item.href) ? "text-primary font-semibold bg-primary/10" : ""
              }`}
            >
              <span className="relative z-10">{item.label}</span>
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-primary/10 scale-0 hover:scale-100 transition-transform duration-300 rounded-lg" />
            </Link>
          ))}
        </nav>

        {/* Actions - Desktop */}
        <div className="hidden md:flex items-center space-x-3">
          {isCommunityPage && (
            <Button onClick={openCreatePostModal}>
              <Plus className="mr-2 h-4 w-4" />
              {language === "th" ? "โพสต์" : "Post"}
            </Button>
          )}
          <EnhancedLanguageToggle
            currentLanguage={language}
            onLanguageChange={setLanguage}
            variant="dropdown"
            size="sm"
          />
          <DarkModeToggle />
        </div>

        {/* Actions - Mobile */}
        <div className="flex items-center space-x-3 md:hidden">
          {isCommunityPage && (
            <Button size="sm" onClick={openCreatePostModal}>
              <Plus className="h-5 w-5" />
            </Button>
          )}
          <DarkModeToggle className="hidden sm:flex" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-xl"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-lg animate-fade-in">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`block py-2 text-muted-foreground hover:text-primary transition-colors duration-300 font-medium ${
                  isActiveRoute(item.href) ? "text-primary font-semibold" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Developer Dashboard Link - Only in development */}
            {import.meta.env.DEV && (
              <Link
                to="/dashboard"
                className={`block py-2 text-muted-foreground hover:text-primary transition-colors duration-300 font-medium border-t border-border/30 pt-4 ${
                  isActiveRoute("/dashboard") ? "text-primary font-semibold" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                🔧 {language === "th" ? "แดชบอร์ดนักพัฒนา" : "Developer Dashboard"}
              </Link>
            )}

            {/* Enhanced Language Toggle for Mobile */}
            <div className="pt-4 border-t border-border/30">
              <EnhancedLanguageToggle
                currentLanguage={language}
                onLanguageChange={(lang) => {
                  setLanguage(lang);
                  setIsMenuOpen(false);
                }}
                variant="dropdown"
                size="sm"
                className="w-full justify-center"
              />
            </div>

            {/* Dark Mode Toggle for Mobile */}
            <div className="flex justify-center">
              <DarkModeToggle size="sm" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
