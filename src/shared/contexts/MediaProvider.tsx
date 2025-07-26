import * as React from "react";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

interface MediaContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: "portrait" | "landscape";
}

const MediaContext = React.createContext<MediaContextType | undefined>(
  undefined
);

interface MediaProviderProps {
  children: React.ReactNode;
}

/**
 * MediaProvider component that provides media query context for the entire app
 * Provides responsive breakpoints and orientation detection
 */
export function MediaProvider({ children }: MediaProviderProps) {
  // Define breakpoints
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Detect orientation
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const orientation: "portrait" | "landscape" = isPortrait
    ? "portrait"
    : "landscape";

  const value: MediaContextType = {
    isMobile,
    isTablet,
    isDesktop,
    orientation,
  };

  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
}

/**
 * Hook to access media context
 * Must be used within MediaProvider
 */
export function useMedia(): MediaContextType {
  const context = React.useContext(MediaContext);

  if (context === undefined) {
    throw new Error("useMedia must be used within a MediaProvider");
  }

  return context;
}
