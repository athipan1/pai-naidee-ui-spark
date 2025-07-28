import { toast } from 'sonner';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

class NotificationService {
  private syncFailures: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;

  /**
   * Show a notification with the specified type and options
   */
  show(type: NotificationType, message: string, options?: NotificationOptions) {
    const { title, description, duration = 5000, action } = options || {};
    
    const notificationData = {
      description: description || message,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    };

    switch (type) {
      case 'success':
        return toast.success(title || 'Success', notificationData);
      case 'error':
        return toast.error(title || 'Error', notificationData);
      case 'warning':
        return toast.warning(title || 'Warning', notificationData);
      case 'info':
        return toast.info(title || 'Info', notificationData);
      default:
        return toast(title || message, notificationData);
    }
  }

  /**
   * Show sync failure notification with retry option
   */
  showSyncFailure(operation: string, error: string, retryFn?: () => void) {
    const failureKey = `${operation}_${error}`;
    const currentFailures = this.syncFailures.get(failureKey) || 0;
    
    this.syncFailures.set(failureKey, currentFailures + 1);

    const canRetry = retryFn && currentFailures < this.MAX_RETRIES;
    
    this.show('error', `Sync failed: ${operation}`, {
      title: 'Sync Failure',
      description: `${error}${canRetry ? ` (Attempt ${currentFailures + 1}/${this.MAX_RETRIES})` : ''}`,
      duration: canRetry ? 10000 : 5000,
      action: canRetry ? {
        label: 'Retry',
        onClick: () => {
          retryFn();
        }
      } : undefined,
    });
  }

  /**
   * Show upload progress notification
   */
  showUploadProgress(filename: string, progress: number) {
    if (progress === 100) {
      this.show('success', `Upload completed: ${filename}`);
    } else {
      this.show('info', `Uploading ${filename}`, {
        description: `${progress}% complete`,
        duration: 1000,
      });
    }
  }

  /**
   * Show network status change
   */
  showNetworkStatus(isOnline: boolean) {
    if (isOnline) {
      this.show('success', 'Connection restored', {
        description: 'You are back online',
        duration: 3000,
      });
    } else {
      this.show('warning', 'Connection lost', {
        description: 'You are currently offline. Changes will be synced when connection is restored.',
        duration: 8000,
      });
    }
  }

  /**
   * Clear sync failures for a specific operation
   */
  clearSyncFailures(operation?: string) {
    if (operation) {
      const keysToDelete = Array.from(this.syncFailures.keys()).filter(key => 
        key.startsWith(operation)
      );
      keysToDelete.forEach(key => this.syncFailures.delete(key));
    } else {
      this.syncFailures.clear();
    }
  }

  /**
   * Show data validation error
   */
  showValidationError(field: string, error: string) {
    this.show('error', `Validation Error: ${field}`, {
      description: error,
      duration: 5000,
    });
  }

  /**
   * Show success with undo option
   */
  showSuccessWithUndo(message: string, undoFn: () => void) {
    this.show('success', message, {
      duration: 8000,
      action: {
        label: 'Undo',
        onClick: undoFn,
      },
    });
  }

  /**
   * Show loading state
   */
  showLoading(message: string) {
    return toast.loading(message);
  }

  /**
   * Dismiss a specific notification
   */
  dismiss(toastId: string | number) {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll() {
    toast.dismiss();
  }
}

export const notificationService = new NotificationService();