import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { useMedia } from "@/shared/contexts/MediaProvider"

/**
 * Example component showing typical usage patterns for useMediaQuery and MediaProvider
 */
export function ExampleUsage() {
  // Using MediaProvider context for common breakpoints
  const { isMobile, isTablet, isDesktop, orientation } = useMedia()
  
  // Using custom media queries for specific needs
  const isSmallScreen = useMediaQuery('(max-width: 480px)')
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  return (
    <div className="responsive-component">
      {/* Conditional rendering based on device type */}
      {isMobile && (
        <div className="mobile-layout">
          <h1>Mobile Layout</h1>
          {isSmallScreen && <p>Extra small screen detected</p>}
        </div>
      )}
      
      {isTablet && (
        <div className="tablet-layout">
          <h1>Tablet Layout</h1>
        </div>
      )}
      
      {isDesktop && (
        <div className="desktop-layout">
          <h1>Desktop Layout</h1>
        </div>
      )}

      {/* Accessibility-aware content */}
      <div className={`content ${prefersReducedMotion ? 'no-animations' : 'with-animations'}`}>
        {prefersDarkMode ? (
          <p>Dark mode content</p>
        ) : (
          <p>Light mode content</p>
        )}
      </div>

      {/* Orientation-specific content */}
      {orientation === 'landscape' && (
        <div className="landscape-specific">
          <p>Landscape orientation content</p>
        </div>
      )}
    </div>
  )
}

// Example: Custom hook using useMediaQuery for reusable breakpoints
export function useCustomBreakpoints() {
  const isExtraSmall = useMediaQuery('(max-width: 479px)')
  const isSmall = useMediaQuery('(min-width: 480px) and (max-width: 767px)')
  const isMedium = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isLarge = useMediaQuery('(min-width: 1024px) and (max-width: 1439px)')
  const isExtraLarge = useMediaQuery('(min-width: 1440px)')

  return {
    isExtraSmall,
    isSmall,
    isMedium,
    isLarge,
    isExtraLarge,
  }
}

// Example: Device capabilities detection
export function useDeviceCapabilities() {
  const hasTouch = useMediaQuery('(pointer: coarse)')
  const hasHover = useMediaQuery('(hover: hover)')
  const isHighDPI = useMediaQuery('(-webkit-min-device-pixel-ratio: 2)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return {
    hasTouch,
    hasHover,
    isHighDPI,
    prefersReducedMotion,
    prefersDarkMode,
  }
}