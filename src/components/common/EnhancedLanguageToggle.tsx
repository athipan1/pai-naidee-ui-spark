import { Globe2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { showToast } from "./EnhancedToast";

interface Language {
  code: "th" | "en";
  name: string;
  nativeName: string;
  flag: string;
}

interface EnhancedLanguageToggleProps {
  currentLanguage: "th" | "en";
  onLanguageChange: (lang: "th" | "en") => void;
  variant?: "button" | "dropdown";
  size?: "sm" | "md" | "lg";
  showFlag?: boolean;
  showName?: boolean;
  className?: string;
}

const languages: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸"
  },
  {
    code: "th",
    name: "Thai",
    nativeName: "ไทย",
    flag: "🇹🇭"
  }
];

const EnhancedLanguageToggle = ({
  currentLanguage,
  onLanguageChange,
  variant = "dropdown",
  size = "md",
  showFlag = true,
  showName = true,
  className = ""
}: EnhancedLanguageToggleProps) => {
  const currentLang = languages.find(lang => lang.code === currentLanguage);
  const otherLang = languages.find(lang => lang.code !== currentLanguage);

  const handleLanguageChange = (langCode: "th" | "en") => {
    if (langCode !== currentLanguage) {
      onLanguageChange(langCode);
      const selectedLang = languages.find(lang => lang.code === langCode);
      if (selectedLang) {
        showToast.languageChanged(selectedLang.nativeName);
      }
    }
  };

  const sizeClasses = {
    sm: "h-8 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-10 px-4 text-base"
  };

  // Simple toggle button (switches between two languages)
  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size={size === "md" ? "default" : size}
        onClick={() => handleLanguageChange(otherLang?.code || "en")}
        className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
        aria-label={`Switch to ${otherLang?.nativeName}`}
        title={`Switch to ${otherLang?.nativeName}`}
      >
        {showFlag && <span className="text-sm" role="img" aria-hidden="true">{currentLang?.flag}</span>}
        {showName && <span className="font-medium">{currentLang?.code.toUpperCase()}</span>}
      </Button>
    );
  }

  // Dropdown with all language options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size === "md" ? "default" : size}
          className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}
          aria-label="Change language"
          aria-haspopup="menu"
          aria-expanded="false"
        >
          {showFlag && (
            <span className="text-sm" role="img" aria-hidden="true">
              {currentLang?.flag}
            </span>
          )}
          {showName && (
            <span className="font-medium">
              {currentLang?.nativeName}
            </span>
          )}
          <Globe2 className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
            disabled={language.code === currentLanguage}
          >
            <div className="flex items-center gap-3">
              <span className="text-base" role="img" aria-hidden="true">
                {language.flag}
              </span>
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">{language.name}</span>
              </div>
            </div>
            
            {language.code === currentLanguage && (
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  Current
                </Badge>
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnhancedLanguageToggle;