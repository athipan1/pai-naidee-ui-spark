import { useState, useMemo } from "react";
import { ImageOff } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  onLoad?: () => void;
  onError?: () => void;
}

// Helper function to determine if URL is a local asset for Vite dev server
const isLocalAsset = (src: string): boolean => {
  return src.startsWith('/src/') || src.startsWith('./') || src.startsWith('../');
};

// Helper function to convert local asset paths to proper URLs in development
const normalizeImageUrl = (src: string): string => {
  if (import.meta.env.DEV && isLocalAsset(src)) {
    // In development with Vite, local paths need to be relative to the root.
    // e.g. /src/shared/assets/image.jpg -> /shared/assets/image.jpg
    return src.replace('/src/', '/');
  }
  return src;
};


export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  decoding = "async",
  onLoad,
  onError,
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Normalize the URL only once
  const finalSrc = useMemo(() => normalizeImageUrl(src), [src]);

  const handleImageLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    console.warn(`Failed to load image: ${finalSrc}`);
    setImageState('error');
    onError?.();
  };

  // If the src is invalid or the image fails to load, show the error state.
  if (imageState === 'error' || !finalSrc) {
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
      {/* Loading placeholder skeleton */}
      {imageState === 'loading' && (
        <div 
          className={`${className} bg-muted animate-pulse`}
          style={{ width, height }}
        />
      )}
      
      {/* The actual image, hidden until loaded */}
      <img
        src={finalSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
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