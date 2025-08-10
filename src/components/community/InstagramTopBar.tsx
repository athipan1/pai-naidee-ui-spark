import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Camera } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface InstagramTopBarProps {
  onNotificationsClick?: () => void;
  onMessagesClick?: () => void;
  onCameraClick?: () => void;
  className?: string;
}

export const InstagramTopBar: React.FC<InstagramTopBarProps> = ({
  onNotificationsClick,
  onMessagesClick,
  onCameraClick,
  className
}) => {
  return (
    <div className={cn(
      "bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3",
      className
    )}>
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Logo / App Name */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white font-noto-thai">
            ไปไหนดี
          </h1>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          {onCameraClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-transparent"
              onClick={onCameraClick}
            >
              <Camera className="h-6 w-6 text-gray-900 dark:text-white" />
            </Button>
          )}
          
          {onNotificationsClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-transparent relative"
              onClick={onNotificationsClick}
            >
              <Heart className="h-6 w-6 text-gray-900 dark:text-white" />
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-black" />
            </Button>
          )}
          
          {onMessagesClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-transparent relative"
              onClick={onMessagesClick}
            >
              <MessageCircle className="h-6 w-6 text-gray-900 dark:text-white" />
              {/* Message count badge */}
              <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};