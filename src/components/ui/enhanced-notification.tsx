import { useState, useEffect } from "react";
import { cn } from "@/shared/utils/cn";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export interface NotificationProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  onClose?: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Notification = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Entrance animation
    setIsVisible(true);

    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800", 
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };

  const iconStyles = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500", 
    info: "text-blue-500"
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5",
        "transform transition-all duration-300 ease-out",
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100" 
          : "translate-x-full opacity-0",
        isLeaving && "animate-slide-right"
      )}
    >
      <div className={cn("p-4 border-l-4", styles[type])}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", iconStyles[type])} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {message && (
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            )}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200"
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationContainer = ({ 
  notifications = [],
  onClose 
}: {
  notifications: NotificationProps[];
  onClose: (id: string) => void;
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };
};