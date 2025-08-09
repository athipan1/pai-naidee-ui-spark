import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LanguageSwitcherProps {
  language: 'th' | 'en' | 'auto';
  onLanguageChange: (language: 'th' | 'en' | 'auto') => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, onLanguageChange }) => {
  const languages = [
    { code: 'auto', label: 'Auto', flag: '🌐' },
    { code: 'th', label: 'ไทย', flag: '🇹🇭' },
    { code: 'en', label: 'English', flag: '🇺🇸' }
  ];

  return (
    <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-travel-neutral-500/20">
      <Globe className="h-4 w-4 text-travel-neutral-500 ml-2" />
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "ghost"}
          size="sm"
          onClick={() => onLanguageChange(lang.code as 'th' | 'en' | 'auto')}
          className={`
            text-xs px-3 py-1 h-auto transition-all duration-200
            ${language === lang.code 
              ? 'bg-travel-blue-500 hover:bg-travel-blue-500 text-white' 
              : 'hover:bg-travel-blue-50 text-travel-neutral-800'
            }
          `}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.label}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;