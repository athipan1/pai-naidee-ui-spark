import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface InspirationRatingProps {
  postId: string;
  currentRating?: number; // User's current rating (1-5)
  averageRating: number; // Average inspiration score
  totalVotes: number; // Total number of votes
  onRate: (postId: string, rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showAverage?: boolean;
  showVoteCount?: boolean;
  interactive?: boolean;
  className?: string;
}

export const InspirationRating: React.FC<InspirationRatingProps> = ({
  postId,
  currentRating,
  averageRating,
  totalVotes,
  onRate,
  size = 'md',
  showAverage = true,
  showVoteCount = true,
  interactive = true,
  className
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleRate = async (rating: number) => {
    if (!interactive || isRating) return;
    
    setIsRating(true);
    try {
      await onRate(postId, rating);
    } finally {
      setIsRating(false);
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating || currentRating || 0;
  const averageRounded = Math.round(averageRating * 10) / 10;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Star Rating */}
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= displayRating;
          const isPartial = !isActive && star <= averageRating;
          
          return (
            <motion.div
              key={star}
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.95 } : {}}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-0 h-auto hover:bg-transparent",
                  !interactive && "cursor-default"
                )}
                disabled={!interactive || isRating}
                onMouseEnter={() => interactive && setHoverRating(star)}
                onMouseLeave={() => interactive && setHoverRating(null)}
                onClick={() => handleRate(star)}
              >
                <div className="relative">
                  <Star 
                    className={cn(
                      sizeClasses[size],
                      "transition-all duration-200",
                      isActive 
                        ? "fill-yellow-400 text-yellow-400" 
                        : isPartial 
                        ? "fill-yellow-200 text-yellow-200"
                        : "fill-transparent text-gray-300 hover:text-yellow-300"
                    )}
                  />
                  
                  {/* Subtle glow effect for active stars */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
                        filter: 'blur(4px)'
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Rating Info */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        {showAverage && (
          <motion.span
            key={averageRounded}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-medium"
          >
            {averageRounded}
          </motion.span>
        )}
        
        {showVoteCount && (
          <span className="text-xs">
            ({totalVotes.toLocaleString('th-TH')} {totalVotes === 1 ? 'คะแนน' : 'คะแนน'})
          </span>
        )}
      </div>

      {/* User's current rating indicator */}
      {currentRating && interactive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded-full"
        >
          คุณให้ {currentRating} ดาว
        </motion.div>
      )}

      {/* Loading indicator */}
      <AnimatePresence>
        {isRating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-1 text-xs text-muted-foreground"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border border-primary border-t-transparent rounded-full"
            />
            <span>กำลังบันทึก...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InspirationRating;