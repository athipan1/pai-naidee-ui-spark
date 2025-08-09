interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  useSkeletonLoader?: boolean;
  skeletonType?: 'card' | 'list' | 'text';
  skeletonCount?: number;
}

const LoadingSpinner = ({ 
  size = 'md', 
  text, 
  className = '', 
  useSkeletonLoader = false,
  skeletonType = 'card',
  skeletonCount = 3
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-4'
  };

  // Show skeleton loader instead of spinner for better UX
  if (useSkeletonLoader) {
    const { AttractionListSkeleton, AttractionCardSkeleton } = require('./SkeletonLoader');
    
    if (skeletonType === 'list') {
      return <AttractionListSkeleton count={skeletonCount} className={className} />;
    }
    
    if (skeletonType === 'card') {
      return <AttractionCardSkeleton className={className} />;
    }
    
    // Text skeleton fallback
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center min-h-screen ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div 
        className={`animate-spin rounded-full border-primary ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      {text && (
        <p className="mt-4 text-muted-foreground text-sm animate-pulse">
          {text}
        </p>
      )}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

export default LoadingSpinner;
