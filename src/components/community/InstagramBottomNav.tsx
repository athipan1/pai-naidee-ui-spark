import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/shared/lib/utils';

interface InstagramBottomNavProps {
  activeTab: 'home' | 'search' | 'add' | 'notifications' | 'profile';
  onTabChange: (tab: 'home' | 'search' | 'add' | 'notifications' | 'profile') => void;
  userAvatar?: string;
  className?: string;
}

export const InstagramBottomNav: React.FC<InstagramBottomNavProps> = ({
  activeTab,
  onTabChange,
  userAvatar,
  className
}) => {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 px-4 py-2 z-50",
      className
    )}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-12 w-12 p-0 hover:bg-transparent"
          onClick={() => onTabChange('home')}
        >
          <Home className={cn(
            "h-6 w-6",
            activeTab === 'home' ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
          )} />
        </Button>

        {/* Search */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-12 w-12 p-0 hover:bg-transparent"
          onClick={() => onTabChange('search')}
        >
          <Search className={cn(
            "h-6 w-6",
            activeTab === 'search' ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
          )} />
        </Button>

        {/* Add Post (center, larger) */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-12 w-12 p-0 hover:bg-transparent"
          onClick={() => onTabChange('add')}
        >
          <PlusSquare className={cn(
            "h-7 w-7",
            activeTab === 'add' ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
          )} />
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-12 w-12 p-0 hover:bg-transparent relative"
          onClick={() => onTabChange('notifications')}
        >
          <Heart className={cn(
            "h-6 w-6",
            activeTab === 'notifications' ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
          )} />
          {/* Notification dot */}
          <div className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
        </Button>

        {/* Profile */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-12 w-12 p-0 hover:bg-transparent"
          onClick={() => onTabChange('profile')}
        >
          {userAvatar ? (
            <div className={cn(
              "h-6 w-6 rounded-full border-2",
              activeTab === 'profile' 
                ? "border-gray-900 dark:border-white" 
                : "border-transparent"
            )}>
              <Avatar className="h-full w-full">
                <AvatarImage src={userAvatar} alt="Profile" />
                <AvatarFallback className="text-xs">U</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <User className={cn(
              "h-6 w-6",
              activeTab === 'profile' ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
            )} />
          )}
        </Button>
      </div>
    </div>
  );
};