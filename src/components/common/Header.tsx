import { useState } from "react";
import { Menu, X, Globe2, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";

interface HeaderProps {
  currentLanguage: "th" | "en";
  onLanguageChange: (lang: "th" | "en") => void;
}

const Header = ({ currentLanguage, onLanguageChange }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: currentLanguage === "th" ? "หน้าแรก" : "Home", href: "/" },
    { label: currentLanguage === "th" ? "สำรวจ" : "Explore", href: "/explore" },
    { label: currentLanguage === "th" ? "รายการโปรด" : "Favorites", href: "/favorites" },
    { label: currentLanguage === "th" ? "โปรไฟล์" : "Profile", href: "/profile" },
  ];

  // Helper function to check if route is active
  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-effect border-b border-white/20 shadow-lg safe-area-top">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Enhanced Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 interactive-scale"
          aria-label={currentLanguage === "th" ? "ไปไหนดี - หน้าแรก" : "PaiNaiDee - Home"}
        >
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg neon-glow">
            <MapPin className="w-6 h-6 text-white animate-float" />
          </div>
          <h1 className="text-xl font-bold text-gradient-tropical font-noto-thai">
            {currentLanguage === "th" ? "ไปไหนดี" : "PaiNaiDee"}
          </h1>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav 
          className="hidden md:flex items-center space-x-6"
          aria-label={currentLanguage === "th" ? "เมนูหลัก" : "Main navigation"}
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

        {/* Language Toggle & Mobile Menu */}
        <div className="flex items-center space-x-3">
          {/* Developer Dashboard Link - Only in development */}
          {import.meta.env.DEV && (
            <Link to="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-muted-foreground hover:text-primary"
                title="Developer Dashboard"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          )}

          {/* Dark Mode Toggle */}
          <DarkModeToggle className="hidden sm:flex" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onLanguageChange(currentLanguage === "th" ? "en" : "th")
            }
            className="hidden sm:flex items-center space-x-1 rounded-xl"
          >
            <Globe2 className="w-4 h-4" />
            <span className="font-medium">{currentLanguage.toUpperCase()}</span>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden rounded-xl"
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
                🔧 {currentLanguage === "th" ? "แดชบอร์ดนักพัฒนา" : "Developer Dashboard"}
              </Link>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onLanguageChange(currentLanguage === "th" ? "en" : "th");
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-1 rounded-xl sm:hidden w-full justify-center"
            >
              <Globe2 className="w-4 h-4" />
              <span className="font-medium">
                {currentLanguage === "th" ? "English" : "ไทย"}
              </span>
            </Button>
            
            {/* Dark Mode Toggle for Mobile */}
            <div className="flex justify-center sm:hidden">
              <DarkModeToggle size="sm" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
