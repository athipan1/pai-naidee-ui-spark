import React, { createContext, useContext, ReactNode } from 'react'
import { useMediaQuery } from '../hooks/use-media-query'

export interface MediaContextType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape' | 'unknown'
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

export interface MediaProviderProps {
  children: ReactNode
}

/**
 * MediaProvider component that provides responsive breakpoint information
 * Uses standard breakpoints: mobile (< 768px), tablet (768px - 1024px), desktop (>= 1024px)
 */
export function MediaProvider({ children }: MediaProviderProps) {
  // Standard breakpoints
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  
  // Orientation detection
  const isPortrait = useMediaQuery('(orientation: portrait)')
  const isLandscape = useMediaQuery('(orientation: landscape)')
  
  const orientation: 'portrait' | 'landscape' | 'unknown' = 
    isPortrait ? 'portrait' : 
    isLandscape ? 'landscape' : 
    'unknown'

  const value: MediaContextType = {
    isMobile,
    isTablet,
    isDesktop,
    orientation,
  }

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  )
}

/**
 * Hook to access media context
 * @returns MediaContextType with breakpoint and orientation information
 * @throws Error if used outside of MediaProvider
 */
export function useMedia(): MediaContextType {
  const context = useContext(MediaContext)
  
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider')
  }
  
  return context
}