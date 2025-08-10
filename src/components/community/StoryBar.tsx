import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Story {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  preview: string;
  timestamp: Date;
  viewed: boolean;
}

interface StoryBarProps {
  stories: Story[];
  onStoryClick: (storyId: string) => void;
  onAddStory?: () => void;
  className?: string;
}

export const StoryBar: React.FC<StoryBarProps> = ({
  stories,
  onStoryClick,
  onAddStory,
  className
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollLeft > 0);
  };

  return (
    <div className={cn(
      "bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800",
      className
    )}>
      <div 
        className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Add Story Button */}
        {onAddStory && (
          <div className="flex-shrink-0 flex flex-col items-center space-y-1">
            <Button
              onClick={onAddStory}
              className="relative h-16 w-16 rounded-full p-0 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600"
            >
              <Plus className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </Button>
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-16 text-center">
              Your story
            </span>
          </div>
        )}

        {/* Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 flex flex-col items-center space-y-1">
            <button
              onClick={() => onStoryClick(story.id)}
              className="relative focus:outline-none"
            >
              {/* Story Ring */}
              <div className={cn(
                "h-16 w-16 rounded-full p-0.5 bg-gradient-to-tr",
                story.viewed 
                  ? "from-gray-300 to-gray-300 dark:from-gray-600 dark:to-gray-600" 
                  : "from-yellow-400 via-red-500 to-purple-500"
              )}>
                <div className="h-full w-full rounded-full bg-white dark:bg-black p-0.5">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={story.user.avatar} alt={story.user.username} />
                    <AvatarFallback className="text-xs">
                      {story.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              {/* Story preview overlay */}
              <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 hover:opacity-100 transition-opacity">
                <img 
                  src={story.preview} 
                  alt="Story preview"
                  className="w-full h-full object-cover rounded-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full" />
              </div>
            </button>
            
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-16 text-center">
              {story.user.username}
            </span>
          </div>
        ))}
      </div>
      
      {/* Fade gradient for long lists */}
      {isScrolled && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-black to-transparent pointer-events-none" />
      )}
    </div>
  );
};

// Sample stories data for development
export const mockStories: Story[] = [
  {
    id: '1',
    user: {
      id: '1',
      username: 'wanderlust_thai',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150'
    },
    preview: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    viewed: false
  },
  {
    id: '2',
    user: {
      id: '2',
      username: 'solo_explorer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    preview: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    viewed: true
  },
  {
    id: '3',
    user: {
      id: '3',
      username: 'foodie_travel',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    },
    preview: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    viewed: false
  },
  {
    id: '4',
    user: {
      id: '4',
      username: 'beach_lover',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    },
    preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    viewed: true
  },
  {
    id: '5',
    user: {
      id: '5',
      username: 'mountain_hiker',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    viewed: false
  }
];