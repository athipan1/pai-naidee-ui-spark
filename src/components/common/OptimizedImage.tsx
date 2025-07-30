import { useState } from "react";
import { ImageOff } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: string | number;
  height?: string | number;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

// Helper function to determine if URL is a local asset or external
const isLocalAsset = (src: string): boolean => {
  return src.startsWith('/src/') || src.startsWith('./') || src.startsWith('../');
};

// Helper function to convert local asset paths to proper URLs in development
const normalizeImageUrl = (src: string): string => {
  if (isLocalAsset(src)) {
    // In development with Vite, convert local paths to proper import paths
    if (src.startsWith('/src/')) {
      // Remove '/src/' prefix for Vite to handle properly
      return src.replace('/src/', '/');
    }
  }
  return src;
};

// Default fallback images for different scenarios
const getDefaultFallback = (alt: string): string => {
  // Use a default image based on the alt text context
  if (alt.toLowerCase().includes('beach') || alt.toLowerCase().includes('sea')) {
    return '/placeholder-beach.jpg';
  } else if (alt.toLowerCase().includes('temple') || alt.toLowerCase().includes('culture')) {
    return '/placeholder-temple.jpg';
  } else if (alt.toLowerCase().includes('mountain') || alt.toLowerCase().includes('nature')) {
    return '/placeholder-mountain.jpg';
  } else if (alt.toLowerCase().includes('food') || alt.toLowerCase().includes('market')) {
    return '/placeholder-food.jpg';
  }
  return '/placeholder-attraction.jpg';
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  fallbackSrc,
  width,
  height,
  loading = "lazy",
  onLoad,
  onError,
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(normalizeImageUrl(src));

  const handleImageLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log(`Trying fallback image: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
      return;
    }
    
    // If no custom fallback or fallback also failed, try default
    const defaultFallback = getDefaultFallback(alt);
    if (currentSrc !== defaultFallback) {
      console.log(`Trying default fallback: ${defaultFallback}`);
      setCurrentSrc(defaultFallback);
      return;
    }
    
    // All fallbacks failed
    setImageState('error');
    onError?.();
  };

  if (imageState === 'error') {
    return (
      <div 
        className={`${className} bg-muted flex items-center justify-center text-muted-foreground`}
        style={{ width, height }}
      >
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <ImageOff className="w-8 h-8 mb-2" />
          <span className="text-sm">Image not available</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Loading placeholder */}
      {imageState === 'loading' && (
        <div 
          className={`${className} bg-muted animate-pulse`}
          style={{ width, height }}
        />
      )}
      
      {/* Actual image */}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        className={`${className} ${imageState === 'loaded' ? 'block' : 'hidden'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        width={width}
        height={height}
      />
    </>
  );
};

export default OptimizedImage;