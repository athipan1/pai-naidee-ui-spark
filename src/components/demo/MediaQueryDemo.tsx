import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useMedia } from "@/shared/contexts/MediaProvider";

/**
 * Demo component to showcase useMediaQuery hook and MediaProvider usage
 * This component displays current device information and media query results
 */
export function MediaQueryDemo() {
  // Using MediaProvider context
  const { isMobile, isTablet, isDesktop, orientation } = useMedia();

  // Using custom media queries with useMediaQuery hook
  const isSmallScreen = useMediaQuery("(max-width: 480px)");
  const isLargeScreen = useMediaQuery("(min-width: 1440px)");
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const hasHover = useMediaQuery("(hover: hover)");
  const isHighDPI = useMediaQuery("(-webkit-min-device-pixel-ratio: 2)");

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Device Information
      </h2>

      {/* MediaProvider results */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
          MediaProvider Results:
        </h3>
        <div className="space-y-2">
          <div
            className={`flex items-center gap-2 ${isMobile ? "text-green-600" : "text-gray-400"}`}
          >
            <span
              className={`w-3 h-3 rounded-full ${isMobile ? "bg-green-500" : "bg-gray-300"}`}
            ></span>
            Mobile: {isMobile ? "Yes" : "No"}
          </div>
          <div
            className={`flex items-center gap-2 ${isTablet ? "text-green-600" : "text-gray-400"}`}
          >
            <span
              className={`w-3 h-3 rounded-full ${isTablet ? "bg-green-500" : "bg-gray-300"}`}
            ></span>
            Tablet: {isTablet ? "Yes" : "No"}
          </div>
          <div
            className={`flex items-center gap-2 ${isDesktop ? "text-green-600" : "text-gray-400"}`}
          >
            <span
              className={`w-3 h-3 rounded-full ${isDesktop ? "bg-green-500" : "bg-gray-300"}`}
            ></span>
            Desktop: {isDesktop ? "Yes" : "No"}
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            Orientation: {orientation}
          </div>
        </div>
      </div>

      {/* Custom media queries */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Custom Media Queries:
        </h3>
        <div className="space-y-2 text-sm">
          <div
            className={`flex items-center gap-2 ${isSmallScreen ? "text-orange-600" : "text-gray-400"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isSmallScreen ? "bg-orange-500" : "bg-gray-300"}`}
            ></span>
            Small Screen (≤480px): {isSmallScreen ? "Yes" : "No"}
          </div>
          <div
            className={`flex items-center gap-2 ${isLargeScreen ? "text-purple-600" : "text-gray-400"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isLargeScreen ? "bg-purple-500" : "bg-gray-300"}`}
            ></span>
            Large Screen (≥1440px): {isLargeScreen ? "Yes" : "No"}
          </div>
          <div
            className={`flex items-center gap-2 ${prefersDarkMode ? "text-indigo-600" : "text-gray-400"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${prefersDarkMode ? "bg-indigo-500" : "bg-gray-300"}`}
            ></span>
            Prefers Dark Mode: {prefersDarkMode ? "Yes" : "No"}
          </div>
          <div
            className={`flex items-center gap-2 ${hasHover ? "text-teal-600" : "text-gray-400"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${hasHover ? "bg-teal-500" : "bg-gray-300"}`}
            ></span>
            Has Hover: {hasHover ? "Yes" : "No"}
          </div>
          <div
            className={`flex items-center gap-2 ${isHighDPI ? "text-pink-600" : "text-gray-400"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isHighDPI ? "bg-pink-500" : "bg-gray-300"}`}
            ></span>
            High DPI: {isHighDPI ? "Yes" : "No"}
          </div>
        </div>
      </div>

      {/* Responsive content examples */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
        <h4 className="font-medium mb-2 text-gray-800 dark:text-white">
          Responsive Content:
        </h4>
        {isMobile && (
          <div className="text-sm text-blue-600 dark:text-blue-400">
            📱 Mobile-specific content is shown
          </div>
        )}
        {isTablet && (
          <div className="text-sm text-green-600 dark:text-green-400">
            📊 Tablet-optimized layout is active
          </div>
        )}
        {isDesktop && (
          <div className="text-sm text-purple-600 dark:text-purple-400">
            💻 Desktop experience is enabled
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Resize your window to see changes in real-time!
      </div>
    </div>
  );
}
