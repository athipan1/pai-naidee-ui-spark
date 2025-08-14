// Accessibility utilities and improvements for the PaiNaiDee application

import { useEffect, useRef } from 'react';

// Screen reader announcements utility
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.classList.add('sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management hook
export const useFocusManagement = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };

  return { saveFocus, restoreFocus, trapFocus };
};

// Skip link component for keyboard navigation
export const SkipLink = ({ href = "#main-content", children = "Skip to main content" }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded focus:z-50 focus:outline-none focus:ring-2 focus:ring-ring"
    style={{ zIndex: 9999 }}
  >
    {children}
  </a>
);

// Accessible landmark component
export const Landmark = ({ 
  as: Component = 'div', 
  role, 
  ariaLabel, 
  ariaLabelledBy,
  children, 
  ...props 
}: {
  as?: keyof JSX.IntrinsicElements;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <Component
    role={role}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
    {...props}
  >
    {children}
  </Component>
);

// Enhanced button with better accessibility
export const AccessibleButton = ({
  children,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  isLoading = false,
  loadingText = "Loading...",
  disabled = false,
  onClick,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  [key: string]: any;
}) => (
  <button
    aria-label={ariaLabel}
    aria-pressed={ariaPressed}
    aria-expanded={ariaExpanded}
    aria-disabled={disabled || isLoading}
    disabled={disabled || isLoading}
    onClick={onClick}
    className={`${className} focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
    {...props}
  >
    {isLoading ? (
      <>
        <span className="sr-only">{loadingText}</span>
        <span aria-hidden="true">{children}</span>
      </>
    ) : (
      children
    )}
  </button>
);

// Color contrast utility functions
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simple contrast ratio calculation
  // In a real app, you'd use a proper color contrast library
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    // This is a placeholder - use a proper color library in production
    return 0.5;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);

  return (brightest + 0.05) / (darkest + 0.05);
};

export const meetsWCAGStandard = (contrastRatio: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
  const threshold = level === 'AAA' ? 7 : 4.5;
  return contrastRatio >= threshold;
};

// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const;

export const isActionKey = (key: string): boolean => {
  return key === KEYBOARD_KEYS.ENTER || key === KEYBOARD_KEYS.SPACE;
};

export const isArrowKey = (key: string): boolean => {
  const arrowKeys: string[] = [
    KEYBOARD_KEYS.ARROW_UP,
    KEYBOARD_KEYS.ARROW_DOWN,
    KEYBOARD_KEYS.ARROW_LEFT,
    KEYBOARD_KEYS.ARROW_RIGHT,
  ];
  return arrowKeys.includes(key);
};

// Accessible form components
export const AccessibleInput = ({
  label,
  error,
  required = false,
  description,
  ...props
}: {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  [key: string]: any;
}) => {
  const id = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <input
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={[errorId, descriptionId].filter(Boolean).join(' ') || undefined}
        aria-required={required}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-destructive' : ''
        }`}
        {...props}
      />
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Live region component for dynamic content announcements
export const LiveRegion = ({ 
  children, 
  level = 'polite',
  atomic = true,
  relevant = 'additions text'
}: {
  children: React.ReactNode;
  level?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: 'text' | 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text additions' | 'text removals';
}) => (
  <div
    aria-live={level}
    aria-atomic={atomic}
    aria-relevant={relevant}
    className="sr-only"
  >
    {children}
  </div>
);

// Hook for managing ARIA announcements
export const useAriaAnnouncements = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  };

  const announceSuccess = (message: string) => {
    announce(`Success: ${message}`, 'polite');
  };

  const announceError = (message: string) => {
    announce(`Error: ${message}`, 'assertive');
  };

  const announceNavigation = (pageName: string) => {
    announce(`Navigated to ${pageName}`, 'polite');
  };

  return {
    announce,
    announceSuccess,
    announceError,
    announceNavigation,
  };
};

// Responsive text sizing for better readability
export const useResponsiveTextSize = () => {
  useEffect(() => {
    const updateTextSize = () => {
      const root = document.documentElement;
      const width = window.innerWidth;
      
      // Adjust base font size based on viewport
      if (width < 640) {
        root.style.fontSize = '14px'; // Mobile
      } else if (width < 1024) {
        root.style.fontSize = '15px'; // Tablet
      } else {
        root.style.fontSize = '16px'; // Desktop
      }
    };

    updateTextSize();
    window.addEventListener('resize', updateTextSize);
    
    return () => window.removeEventListener('resize', updateTextSize);
  }, []);
};

// Reduced motion preferences
export const useReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  useEffect(() => {
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0s');
    }
  }, [prefersReducedMotion]);

  return prefersReducedMotion;
};