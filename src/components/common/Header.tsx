import { useState } from "react";
import { Menu, X, MapPin, Plus, LogIn, UserPlus, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import EnhancedLanguageToggle from "./EnhancedLanguageToggle";
import { useUIContext } from "@/shared/contexts/UIContext";
import { useAuth } from "@/shared/contexts/AuthContext";
import { signOut } from "@/services/auth.service";
import { useToast } from "@/components/ui/toast";

interface HeaderProps {
  currentLanguage: "th" | "en";
  onLanguageChange: (lang: "th" | "en") => void;
}

const Header = ({ currentLanguage, onLanguageChange }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openCreatePostModal } = useUIContext();
  const { user, isInitialized } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { label: currentLanguage === "th" ? "หน้าแรก" : "Home", href: "/" },
    { label: currentLanguage === "th" ? "สำรวจ" : "Explore", href: "/explore" },
    { label: currentLanguage === "th" ? "ชุมชนนักเดินทาง" : "Community", href: "/community" },
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

  const isCommunityPage = location.pathname.startsWith('/community');

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-xl safe-area-top">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Enhanced Logo with better spacing */}
        <Link
          to="/"
          className="flex items-center space-x-3 interactive-scale group"
          aria-label={currentLanguage === "th" ? "ไปไหนดี - หน้าแรก" : "PaiNaiDee - Home"}
        >
          <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg neon-glow group-hover:scale-110 transition-transform duration-300">
            <MapPin className="w-7 h-7 text-white animate-float" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gradient-tropical font-noto-thai group-hover:scale-105 transition-transform duration-300">
              {currentLanguage === "th" ? "ไปไหนดี" : "PaiNaiDee"}
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">
              {currentLanguage === "th" ? "คู่มือท่องเที่ยว" : "Travel Guide"}
            </p>
          </div>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center space-x-1"
          aria-label={currentLanguage === "th" ? "เมนูหลัก" : "Main navigation"}
        >
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`nav-link group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                isActiveRoute(item.href) 
                  ? "text-primary bg-primary/10 shadow-md" 
                  : "text-muted-foreground hover:text-primary hover:bg-accent/50"
              }`}
            >
              <span className="relative z-10">{item.label}</span>
              
              {/* Enhanced hover effect */}
              <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                isActiveRoute(item.href) 
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 scale-100" 
                  : "bg-gradient-to-r from-primary/10 to-secondary/10 scale-0 group-hover:scale-100"
              }`} />
              
              {/* Active indicator */}
              {isActiveRoute(item.href) && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
              )}
            </Link>
          ))}
        </nav>

        {/* Enhanced Actions - Desktop */}
        <div className="hidden md:flex items-center space-x-3">
          {isCommunityPage && (
            <Button onClick={openCreatePostModal} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Plus className="mr-2 h-4 w-4" />
              {currentLanguage === "th" ? "โพสต์" : "Post"}
            </Button>
          )}
          <EnhancedLanguageToggle
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
            variant="dropdown"
            size="sm"
          />
          <DarkModeToggle />
          {isInitialized && user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/me')}>
                <UserIcon className="mr-2 h-4 w-4" />
                {user.email}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {currentLanguage === "th" ? "ออกจากระบบ" : "Logout"}
              </Button>
            </>
          ) : isInitialized && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  {currentLanguage === "th" ? "เข้าสู่ระบบ" : "Login"}
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  {currentLanguage === "th" ? "สมัครสมาชิก" : "Sign Up"}
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Enhanced Actions - Mobile */}
        <div className="flex items-center space-x-2 md:hidden">
          {isCommunityPage && (
            <Button size="sm" onClick={openCreatePostModal} className="shadow-md">
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
                🔧 {currentLanguage === "th" ? "แดชบอร์ดนักพัฒนา" : "Developer Dashboard"}
              </Link>
            )}

            {/* Enhanced Language Toggle for Mobile */}
            <div className="pt-4 border-t border-border/30">
              <EnhancedLanguageToggle
                currentLanguage={currentLanguage}
                onLanguageChange={(lang) => {
                  onLanguageChange(lang);
                  setIsMenuOpen(false);
                }}
                variant="dropdown"
                size="sm"
                className="w-full justify-center"
              />
            </div>

            {/* Auth Links for Mobile */}
            <div className="pt-4 border-t border-border/30 space-y-2">
              {isInitialized && user ? (
                <>
                  <Link
                    to="/me"
                    className="flex items-center py-2 text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon className="mr-2 h-5 w-5" />
                    <span>{user.email}</span>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    {currentLanguage === "th" ? "ออกจากระบบ" : "Logout"}
                  </Button>
                </>
              ) : isInitialized && (
                <>
                  <Link
                    to="/login"
                    className="flex items-center py-2 text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    {currentLanguage === "th" ? "เข้าสู่ระบบ" : "Login"}
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center py-2 text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    {currentLanguage === "th" ? "สมัครสมาชิก" : "Sign Up"}
                  </Link>
                </>
              )}
            </div>

            {/* Dark Mode Toggle for Mobile */}
            <div className="flex justify-center pt-4">
              <DarkModeToggle size="sm" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
