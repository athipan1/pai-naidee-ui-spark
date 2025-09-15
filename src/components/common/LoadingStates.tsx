import React from 'react';
import { Loader2, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/shared/lib/utils';

// Loading Spinner Component
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn(sizeClasses[size], 'animate-spin text-primary')} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
};

// Skeleton Loading Components
export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('animate-pulse rounded-md bg-muted', className)} />
);

export const AttractionCardSkeleton: React.FC = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </CardContent>
  </Card>
);

export const PostCardSkeleton: React.FC = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
    </CardHeader>
    <Skeleton className="h-64 w-full" />
    <CardContent className="p-4 space-y-3">
      <div className="flex gap-4">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-6" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </CardContent>
  </Card>
);

// Error State Components
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  variant?: 'network' | 'server' | 'not-found' | 'generic';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  onGoHome,
  className,
  variant = 'generic'
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'network':
        return <WifiOff className="w-12 h-12 text-muted-foreground" />;
      case 'server':
        return <AlertCircle className="w-12 h-12 text-destructive" />;
      case 'not-found':
        return <AlertCircle className="w-12 h-12 text-muted-foreground" />;
      default:
        return <AlertCircle className="w-12 h-12 text-muted-foreground" />;
    }
  };

  const getDefaultTitle = () => {
    switch (variant) {
      case 'network':
        return 'Connection Problem';
      case 'server':
        return 'Server Error';
      case 'not-found':
        return 'Not Found';
      default:
        return 'Something went wrong';
    }
  };

  return (
    <Card className={cn('border-0 shadow-none', className)}>
      <CardContent className="flex flex-col items-center text-center p-8">
        {getIcon()}
        <h3 className="mt-4 text-lg font-semibold">{title || getDefaultTitle()}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">{message}</p>
        
        <div className="flex gap-3 mt-6">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome} variant="default">
              Go Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Network Status Indicator
export interface NetworkStatusProps {
  isOnline: boolean;
  isConnecting?: boolean;
  onRetry?: () => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOnline,
  isConnecting,
  onRetry
}) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="border-destructive bg-destructive/10">
        <CardContent className="flex items-center gap-3 p-3">
          {isConnecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isConnecting ? 'Reconnecting...' : 'No internet connection'}
          </span>
          {!isConnecting && onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Loading Overlay for full-screen loading
export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  progress
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="p-6">
        <CardContent className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <p className="text-sm font-medium">{message}</p>
            {progress !== undefined && (
              <div className="mt-2 w-48 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Empty State Component
export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className
}) => (
  <Card className={cn('border-0 shadow-none', className)}>
    <CardContent className="flex flex-col items-center text-center p-8">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground max-w-md">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </CardContent>
  </Card>
);