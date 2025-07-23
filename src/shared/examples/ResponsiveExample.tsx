import { useMedia } from '@/shared/contexts/MediaProvider'
import { useMediaQuery } from '@/shared/hooks/use-media-query'

/**
 * Example component demonstrating the useMediaQuery hook and MediaProvider
 */
export function ResponsiveExample() {
  // Using the MediaProvider context for standard breakpoints
  const { isMobile, isTablet, isDesktop, orientation } = useMedia()
  
  // Using custom media queries
  const isSmallScreen = useMediaQuery('(max-width: 480px)')
  const isLargeScreen = useMediaQuery('(min-width: 1200px)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Responsive Design Example</h2>
      
      {/* Conditional rendering based on device type */}
      {isMobile && (
        <div className="bg-blue-100 p-3 rounded mb-3">
          📱 Mobile View: Simplified layout
        </div>
      )}
      
      {isTablet && (
        <div className="bg-green-100 p-3 rounded mb-3">
          📟 Tablet View: Medium complexity
        </div>
      )}
      
      {isDesktop && (
        <div className="bg-purple-100 p-3 rounded mb-3">
          💻 Desktop View: Full features
        </div>
      )}
      
      {/* Conditional content based on custom queries */}
      <div className="grid gap-4">
        <div className={`
          ${isMobile ? 'grid-cols-1' : ''}
          ${isTablet ? 'grid-cols-2' : ''}
          ${isDesktop ? 'grid-cols-3' : ''}
          grid
        `}>
          <div className="bg-gray-100 p-3 rounded">Card 1</div>
          <div className="bg-gray-100 p-3 rounded">Card 2</div>
          <div className="bg-gray-100 p-3 rounded">Card 3</div>
        </div>
        
        {/* Show additional content for larger screens */}
        {isLargeScreen && (
          <div className="bg-yellow-100 p-3 rounded">
            🖥️ Extra content for large screens (≥1200px)
          </div>
        )}
        
        {/* Respect user preferences */}
        {!prefersReducedMotion && (
          <div className="animate-pulse bg-red-100 p-3 rounded">
            ✨ Animated content (hidden for users who prefer reduced motion)
          </div>
        )}
        
        {/* Adapt to color scheme preference */}
        <div className={`
          p-3 rounded
          ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}
        `}>
          {isDarkMode ? '🌙' : '☀️'} Adapts to color scheme preference
        </div>
        
        {/* Show device info */}
        <div className="text-sm text-gray-600">
          <p>Orientation: {orientation}</p>
          <p>Small screen (≤480px): {isSmallScreen ? 'Yes' : 'No'}</p>
          <p>Dark mode preferred: {isDarkMode ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )
}