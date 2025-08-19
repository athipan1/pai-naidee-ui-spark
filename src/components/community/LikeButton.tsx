import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { motion } from 'framer-motion';

interface LikeButtonProps {
  /** Whether the post is currently liked */
  isLiked: boolean;
  /** Number of likes */
  likeCount: number;
  /** Callback when like button is clicked */
  onLike: () => void;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show count next to button */
  showCount?: boolean;
  /** Custom className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  likeCount,
  onLike,
  isLoading = false,
  size = 'md',
  showCount = true,
  className,
  disabled = false
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleClick = () => {
    if (!disabled && !isLoading) {
      onLike();
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "relative rounded-full p-0 hover:bg-red-50 dark:hover:bg-red-950/20",
          sizeClasses[size],
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleClick}
        disabled={disabled || isLoading}
        aria-label={isLiked ? "Unlike post" : "Like post"}
      >
        <motion.div
          initial={false}
          animate={{
            scale: isLiked ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.3,
            times: [0, 0.5, 1]
          }}
        >
          <Heart
            size={iconSizes[size]}
            className={cn(
              "transition-colors duration-200",
              isLiked 
                ? "fill-red-500 text-red-500" 
                : "text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
            )}
          />
        </motion.div>
        
        {/* Loading spinner overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </Button>

      {/* Like count */}
      {showCount && likeCount > 0 && (
        <motion.span
          initial={false}
          animate={{
            scale: isLiked ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "text-sm font-medium transition-colors",
            isLiked 
              ? "text-red-500" 
              : "text-gray-600 dark:text-gray-400"
          )}
        >
          {formatCount(likeCount)}
        </motion.span>
      )}
    </div>
  );
};

export default LikeButton;