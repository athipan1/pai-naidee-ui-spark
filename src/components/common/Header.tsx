import { useState } from 'react';
import { Menu, X, Globe2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentLanguage: 'th' | 'en';
  onLanguageChange: (lang: 'th' | 'en') => void;
}

const Header = ({ currentLanguage, onLanguageChange }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: currentLanguage === 'th' ? 'หน้าแรก' : 'Home', href: '#' },
    { label: currentLanguage === 'th' ? 'สำรวจ' : 'Explore', href: '#' },
    { label: currentLanguage === 'th' ? 'รายการโปรด' : 'Favorites', href: '#' },
    { label: currentLanguage === 'th' ? 'โปรไฟล์' : 'Profile', href: '#' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-md">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gradient font-noto-thai">
            {currentLanguage === 'th' ? 'ไปไหนดี' : 'PaiNaiDee'}
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Language Toggle & Mobile Menu */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLanguageChange(currentLanguage === 'th' ? 'en' : 'th')}
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
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-lg animate-fade-in">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block py-2 text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onLanguageChange(currentLanguage === 'th' ? 'en' : 'th');
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-1 rounded-xl sm:hidden w-full justify-center"
            >
              <Globe2 className="w-4 h-4" />
              <span className="font-medium">
                {currentLanguage === 'th' ? 'English' : 'ไทย'}
              </span>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;