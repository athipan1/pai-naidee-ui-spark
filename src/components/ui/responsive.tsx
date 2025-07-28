import { cn } from "@/shared/utils/cn";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

export const ResponsiveContainer = ({ 
  children, 
  className,
  maxWidth = "xl",
  padding = "md"
}: ResponsiveContainerProps) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  };

  const paddingClasses = {
    none: "",
    sm: "px-2 sm:px-4",
    md: "px-4 sm:px-6",
    lg: "px-6 sm:px-8"
  };

  return (
    <div className={cn(
      "w-full mx-auto",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
}

export const ResponsiveGrid = ({ 
  children, 
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = "md"
}: ResponsiveGridProps) => {
  const gridClasses = {
    [`grid-cols-${cols.default}`]: cols.default,
    [`sm:grid-cols-${cols.sm}`]: cols.sm,
    [`md:grid-cols-${cols.md}`]: cols.md,
    [`lg:grid-cols-${cols.lg}`]: cols.lg,
    [`xl:grid-cols-${cols.xl}`]: cols.xl,
  };

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6"
  };

  return (
    <div className={cn(
      "grid",
      gapClasses[gap],
      Object.entries(gridClasses).map(([key, value]) => value ? key : "").filter(Boolean).join(" "),
      className
    )}>
      {children}
    </div>
  );
};

interface BreakpointVisibilityProps {
  children: ReactNode;
  showOn?: ("xs" | "sm" | "md" | "lg" | "xl")[];
  hideOn?: ("xs" | "sm" | "md" | "lg" | "xl")[];
}

export const BreakpointVisibility = ({ 
  children, 
  showOn = [],
  hideOn = []
}: BreakpointVisibilityProps) => {
  const visibilityClasses = [
    ...showOn.map(bp => {
      switch(bp) {
        case "xs": return "block";
        case "sm": return "sm:block";
        case "md": return "md:block";
        case "lg": return "lg:block";
        case "xl": return "xl:block";
        default: return "";
      }
    }),
    ...hideOn.map(bp => {
      switch(bp) {
        case "xs": return "hidden";
        case "sm": return "sm:hidden";
        case "md": return "md:hidden";
        case "lg": return "lg:hidden";
        case "xl": return "xl:hidden";
        default: return "";
      }
    })
  ].filter(Boolean);

  return (
    <div className={cn(visibilityClasses.join(" "))}>
      {children}
    </div>
  );
};

// Hook for responsive values
export const useResponsiveValue = <T,>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}) => {
  // This would ideally use a media query hook in a real implementation
  // For now, returning the default value
  return values.default;
};

// Mobile-first responsive text sizes
export const ResponsiveText = ({ 
  children, 
  size = "base",
  className 
}: { 
  children: ReactNode;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}) => {
  const sizeClasses = {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl",
    "2xl": "text-2xl sm:text-3xl",
    "3xl": "text-3xl sm:text-4xl"
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      {children}
    </div>
  );
};