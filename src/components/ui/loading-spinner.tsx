import { cn } from "@/shared/utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "primary" | "secondary" | "muted";
}

export const LoadingSpinner = ({ 
  size = "md", 
  className,
  variant = "primary" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const variantClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    muted: "text-muted-foreground"
  };

  return (
    <div className={cn(
      "animate-spin rounded-full border-2 border-current border-t-transparent",
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const LoadingDots = ({ 
  size = "md",
  className,
  variant = "primary"
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  };

  const variantClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary", 
    muted: "bg-muted-foreground"
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-bounce",
            sizeClasses[size],
            variantClasses[variant]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.6s"
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const LoadingPulse = ({ 
  className,
  children 
}: { 
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className={cn("animate-pulse", className)}>
      {children}
    </div>
  );
};

export const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn("card-travel p-4 space-y-3", className)}>
      <div className="loading-shimmer h-48 rounded-xl" />
      <div className="space-y-2">
        <div className="loading-shimmer h-4 rounded w-3/4" />
        <div className="loading-shimmer h-3 rounded w-1/2" />
      </div>
      <div className="flex space-x-2">
        <div className="loading-shimmer h-6 rounded-full w-16" />
        <div className="loading-shimmer h-6 rounded-full w-20" />
      </div>
    </div>
  );
};