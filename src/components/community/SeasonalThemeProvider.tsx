import React, { createContext, useContext, useEffect, useState } from 'react';
import { SeasonalTheme } from '@/shared/types/community';

interface SeasonalThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  gradient: string;
  decorations: string[];
  icon: string;
}

const seasonalThemes: Record<SeasonalTheme, SeasonalThemeConfig> = {
  spring: {
    colors: {
      primary: 'hsl(76, 55%, 60%)', // Fresh green
      secondary: 'hsl(46, 70%, 75%)', // Light yellow
      accent: 'hsl(340, 65%, 75%)', // Pink blossom
      background: 'hsl(76, 35%, 97%)'
    },
    gradient: 'linear-gradient(135deg, hsl(76, 55%, 60%) 0%, hsl(46, 70%, 75%) 100%)',
    decorations: ['🌸', '🌿', '🦋'],
    icon: '🌸'
  },
  summer: {
    colors: {
      primary: 'hsl(27, 85%, 65%)', // Warm orange (ไปไหนดี brand)
      secondary: 'hsl(197, 85%, 70%)', // Sky blue
      accent: 'hsl(45, 90%, 70%)', // Sunny yellow
      background: 'hsl(27, 35%, 97%)'
    },
    gradient: 'linear-gradient(135deg, hsl(27, 85%, 65%) 0%, hsl(197, 85%, 70%) 100%)',
    decorations: ['☀️', '🏖️', '🌊'],
    icon: '☀️'
  },
  autumn: {
    colors: {
      primary: 'hsl(25, 75%, 65%)', // Autumn orange
      secondary: 'hsl(45, 70%, 65%)', // Golden yellow
      accent: 'hsl(15, 80%, 60%)', // Red-orange
      background: 'hsl(25, 35%, 97%)'
    },
    gradient: 'linear-gradient(135deg, hsl(25, 75%, 65%) 0%, hsl(45, 70%, 65%) 100%)',
    decorations: ['🍂', '🍁', '🎋'],
    icon: '🍂'
  },
  winter: {
    colors: {
      primary: 'hsl(200, 75%, 65%)', // Cool blue
      secondary: 'hsl(220, 70%, 75%)', // Light blue
      accent: 'hsl(180, 60%, 70%)', // Cyan
      background: 'hsl(200, 35%, 97%)'
    },
    gradient: 'linear-gradient(135deg, hsl(200, 75%, 65%) 0%, hsl(220, 70%, 75%) 100%)',
    decorations: ['❄️', '⛄', '🌨️'],
    icon: '❄️'
  },
  songkran: {
    colors: {
      primary: 'hsl(197, 85%, 70%)', // Water blue
      secondary: 'hsl(27, 85%, 65%)', // Thai orange
      accent: 'hsl(320, 70%, 75%)', // Pink
      background: 'hsl(197, 35%, 97%)'
    },
    gradient: 'linear-gradient(135deg, hsl(197, 85%, 70%) 0%, hsl(27, 85%, 65%) 100%)',
    decorations: ['💧', '🌺', '🎊'],
    icon: '💧'
  },
  newyear: {
    colors: {
      primary: 'hsl(283, 75%, 65%)', // Purple
      secondary: 'hsl(45, 90%, 70%)', // Gold
      accent: 'hsl(15, 80%, 70%)', // Red
      background: 'hsl(283, 35%, 97%)'
    },
    gradient: 'linear-gradient(135deg, hsl(283, 75%, 65%) 0%, hsl(45, 90%, 70%) 100%)',
    decorations: ['🎆', '🎉', '✨'],
    icon: '🎆'
  },
  'loy-krathong': {
    colors: {
      primary: 'hsl(45, 90%, 70%)', // Golden
      secondary: 'hsl(25, 75%, 65%)', // Orange
      accent: 'hsl(60, 70%, 75%)', // Light yellow
      background: 'hsl(45, 35%, 97%)'
    },
    gradient: 'linear-gradient(135deg, hsl(45, 90%, 70%) 0%, hsl(25, 75%, 65%) 100%)',
    decorations: ['🏮', '🕯️', '🌙'],
    icon: '🏮'
  }
};

interface SeasonalThemeContextType {
  currentTheme: SeasonalTheme;
  themeConfig: SeasonalThemeConfig;
  setTheme: (theme: SeasonalTheme) => void;
}

const SeasonalThemeContext = createContext<SeasonalThemeContextType | undefined>(undefined);

export const useSeasonalTheme = () => {
  const context = useContext(SeasonalThemeContext);
  if (!context) {
    throw new Error('useSeasonalTheme must be used within SeasonalThemeProvider');
  }
  return context;
};

const getCurrentSeason = (): SeasonalTheme => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Thai festivals (approximate dates)
  if (month === 4 && day >= 13 && day <= 15) return 'songkran';
  if (month === 11 && day >= 1 && day <= 15) return 'loy-krathong';
  if (month === 12 && day >= 25) return 'newyear';
  if (month === 1 && day <= 5) return 'newyear';

  // Regular seasons for Thailand
  if (month >= 3 && month <= 5) return 'summer'; // Hot season
  if (month >= 6 && month <= 10) return 'autumn'; // Rainy season
  if (month >= 11 || month <= 2) return 'winter'; // Cool season

  return 'summer'; // Default
};

interface SeasonalThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: SeasonalTheme;
}

export const SeasonalThemeProvider: React.FC<SeasonalThemeProviderProps> = ({ 
  children, 
  initialTheme 
}) => {
  const [currentTheme, setCurrentTheme] = useState<SeasonalTheme>(
    initialTheme || getCurrentSeason()
  );

  useEffect(() => {
    if (!initialTheme) {
      // Auto-detect season if no initial theme provided
      setCurrentTheme(getCurrentSeason());
    }
  }, [initialTheme]);

  const themeConfig = seasonalThemes[currentTheme];

  // Apply CSS custom properties for the theme
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--seasonal-primary', themeConfig.colors.primary);
    root.style.setProperty('--seasonal-secondary', themeConfig.colors.secondary);
    root.style.setProperty('--seasonal-accent', themeConfig.colors.accent);
    root.style.setProperty('--seasonal-background', themeConfig.colors.background);
    root.style.setProperty('--seasonal-gradient', themeConfig.gradient);
  }, [themeConfig]);

  const setTheme = (theme: SeasonalTheme) => {
    setCurrentTheme(theme);
  };

  return (
    <SeasonalThemeContext.Provider value={{ currentTheme, themeConfig, setTheme }}>
      {children}
    </SeasonalThemeContext.Provider>
  );
};