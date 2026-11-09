import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: string | number;
  height?: string | number;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
  unavailableLabel?: string;
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
const getDefaultFallback = (): string => '/placeholder-attraction.svg';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  fallbackSrc,
  width,
  height,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  sizes,
  unavailableLabel = "รูปภาพไม่พร้อมใช้งาน · รอ Admin ตรวจสอบ",
  onLoad,
  onError,
}) => {
  const [failed, setFailed] = useState(false);
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(normalizeImageUrl(src || fallbackSrc || getDefaultFallback()));

  useEffect(() => {
    setCurrentSrc(normalizeImageUrl(src || fallbackSrc || getDefaultFallback()));
    setImageState('loading');
    setFailed(false);
  }, [src, fallbackSrc]);

  const handleImageLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    setFailed(true);
    onError?.();
    if (fallbackSrc && currentSrc !== normalizeImageUrl(fallbackSrc)) {
      setCurrentSrc(normalizeImageUrl(fallbackSrc));
      return;
    }
    
    // If no custom fallback or fallback also failed, try default
    const defaultFallback = getDefaultFallback();
    if (currentSrc !== defaultFallback) {
      setCurrentSrc(defaultFallback);
      return;
    }
    
    // All fallbacks failed
    setImageState('error');
  };

  return (
    <div className={`relative ${className}`}>
      {(failed || !src || src.startsWith('/placeholder-')) && <span role="status" className="absolute bottom-1 left-1 z-10 rounded bg-background/90 px-2 text-xs">{unavailableLabel}</span>}
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-muted animate-pulse" aria-hidden="true" />
      )}
      {imageState === 'error' ? (
        <div role="img" aria-label={alt} className="flex h-full min-h-24 w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">Image unavailable</span>
        </div>
      ) : (
        // The img must not be display:none: browsers will defer a hidden lazy image indefinitely.
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          sizes={sizes}
          className={`${className} ${imageState === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
