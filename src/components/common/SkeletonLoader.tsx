import { cn } from "@/shared/lib/utils";

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
    />
  );
};

interface AttractionCardSkeletonProps {
  className?: string;
}

const AttractionCardSkeleton = ({ className }: AttractionCardSkeletonProps) => {
  return (
    <div 
      className={cn(
        "rounded-lg border bg-card shadow-sm overflow-hidden",
        className
      )}
      role="status"
      aria-label="Loading attraction information"
    >
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Rating and location */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        
        {/* Tags */}
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2 pt-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      
      <span className="sr-only">Loading attraction details...</span>
    </div>
  );
};

interface ListSkeletonProps {
  count?: number;
  className?: string;
}

const AttractionListSkeleton = ({ count = 3, className }: ListSkeletonProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <AttractionCardSkeleton key={index} />
      ))}
    </div>
  );
};

interface SearchSkeletonProps {
  className?: string;
}

const SearchResultsSkeleton = ({ className }: SearchSkeletonProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search results header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* Search results list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <AttractionCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

interface TrendingSkeletonProps {
  className?: string;
}

const TrendingSkeleton = ({ className }: TrendingSkeletonProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Section header */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-32" />
      </div>
      
      {/* Trending items */}
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: 2 }).map((_, index) => (
          <div 
            key={index}
            className="flex-shrink-0 w-80 rounded-lg border bg-card shadow-sm overflow-hidden"
          >
            <Skeleton className="h-32 w-full rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export {
  Skeleton,
  AttractionCardSkeleton,
  AttractionListSkeleton,
  SearchResultsSkeleton,
  TrendingSkeleton
};