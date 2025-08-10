import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Info, Heart, Share, MapPin } from "lucide-react";

// Enhanced toast with icons and better styling
const createToast = (
  message: string,
  type: 'success' | 'error' | 'warning' | 'info',
  action?: () => void,
  actionLabel?: string
) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const Icon = icons[type];

  const toastOptions = {
    icon: <Icon className="h-4 w-4" />,
    action: action && actionLabel ? {
      label: actionLabel,
      onClick: action
    } : undefined,
    duration: type === 'error' ? 6000 : 4000,
  };

  switch (type) {
    case 'success':
      return toast.success(message, toastOptions);
    case 'error':
      return toast.error(message, toastOptions);
    case 'warning':
      return toast.warning(message, toastOptions);
    case 'info':
      return toast.info(message, toastOptions);
  }
};

// Specialized toast functions for common actions
export const showToast = {
  // Generic toasts
  success: (message: string, action?: () => void, actionLabel?: string) =>
    createToast(message, 'success', action, actionLabel),
  
  error: (message: string, action?: () => void, actionLabel?: string) =>
    createToast(message, 'error', action, actionLabel),
  
  warning: (message: string, action?: () => void, actionLabel?: string) =>
    createToast(message, 'warning', action, actionLabel),
  
  info: (message: string, action?: () => void, actionLabel?: string) =>
    createToast(message, 'info', action, actionLabel),

  // Specific action toasts
  addedToFavorites: (attractionName: string, onUndo?: () => void) => {
    toast.success(
      `Added "${attractionName}" to favorites`,
      {
        icon: <Heart className="h-4 w-4 fill-red-500 text-red-500" />,
        action: onUndo ? {
          label: "Undo",
          onClick: onUndo
        } : undefined,
        duration: 5000,
      }
    );
  },

  removedFromFavorites: (attractionName: string, onUndo?: () => void) => {
    toast.info(
      `Removed "${attractionName}" from favorites`,
      {
        icon: <Heart className="h-4 w-4" />,
        action: onUndo ? {
          label: "Undo",
          onClick: onUndo
        } : undefined,
        duration: 5000,
      }
    );
  },

  shared: (attractionName: string) => {
    toast.success(
      `Shared "${attractionName}"`,
      {
        icon: <Share className="h-4 w-4" />,
        duration: 3000,
      }
    );
  },

  navigationStarted: (destination: string) => {
    toast.info(
      `Opening navigation to ${destination}`,
      {
        icon: <MapPin className="h-4 w-4" />,
        duration: 3000,
      }
    );
  },

  searchCompleted: (resultCount: number, query: string) => {
    if (resultCount === 0) {
      toast.warning(
        `No results found for "${query}"`,
        {
          icon: <AlertCircle className="h-4 w-4" />,
          duration: 4000,
        }
      );
    } else {
      toast.success(
        `Found ${resultCount} result${resultCount !== 1 ? 's' : ''} for "${query}"`,
        {
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 3000,
        }
      );
    }
  },

  offline: () => {
    toast.error(
      "You're currently offline. Some features may not work.",
      {
        icon: <AlertCircle className="h-4 w-4" />,
        duration: 8000,
      }
    );
  },

  online: () => {
    toast.success(
      "You're back online!",
      {
        icon: <CheckCircle className="h-4 w-4" />,
        duration: 3000,
      }
    );
  },

  languageChanged: (language: string) => {
    toast.info(
      `Language changed to ${language}`,
      {
        icon: <Info className="h-4 w-4" />,
        duration: 2000,
      }
    );
  },

  networkError: (onRetry?: () => void) => {
    toast.error(
      "Network error. Please check your connection.",
      {
        icon: <XCircle className="h-4 w-4" />,
        action: onRetry ? {
          label: "Retry",
          onClick: onRetry
        } : undefined,
        duration: 8000,
      }
    );
  },

  dataUpdated: (type: string) => {
    toast.success(
      `${type} data updated successfully`,
      {
        icon: <CheckCircle className="h-4 w-4" />,
        duration: 3000,
      }
    );
  }
};

// Hook for using toasts with common patterns
export const useToast = () => {
  return { showToast };
};