import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Camera, 
  Video, 
  FileText, 
  MapPin,
  X 
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import InstagramStylePostCreator from './InstagramStylePostCreator';

interface FloatingPostButtonProps {
  onCreatePost: () => void;
  onPhotoPost?: () => void;
  onVideoPost?: () => void;
  onStoryPost?: () => void;
  onLocationPost?: () => void;
  className?: string;
}

export const FloatingPostButton: React.FC<FloatingPostButtonProps> = ({
  onCreatePost,
  onPhotoPost,
  onVideoPost,
  onStoryPost,
  onLocationPost,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInstagramCreator, setShowInstagramCreator] = useState(false);

  const quickActions = [
    {
      icon: <Camera className="h-4 w-4" />,
      label: 'ถ่ายรูป',
      action: () => {
        setShowInstagramCreator(true);
        setIsExpanded(false);
      },
      color: 'bg-blue-500 hover:bg-blue-600',
      delay: 0.1
    },
    {
      icon: <Video className="h-4 w-4" />,
      label: 'วิดีโอ',
      action: () => {
        setShowInstagramCreator(true);
        setIsExpanded(false);
      },
      color: 'bg-purple-500 hover:bg-purple-600',
      delay: 0.15
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'เขียนเรื่องราว',
      action: () => {
        setShowInstagramCreator(true);
        setIsExpanded(false);
      },
      color: 'bg-green-500 hover:bg-green-600',
      delay: 0.2
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      label: 'แท็กสถานที่',
      action: () => {
        setShowInstagramCreator(true);
        setIsExpanded(false);
      },
      color: 'bg-orange-500 hover:bg-orange-600',
      delay: 0.25
    }
  ];

  const handleAction = (action: () => void) => {
    action();
    setIsExpanded(false);
  };

  const handleMainButtonClick = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      // Direct action: open Instagram-style creator
      setShowInstagramCreator(true);
    }
  };

  const handlePostSubmit = (postData: any) => {
    // Handle the post submission
    console.log('Post data:', postData);
    onCreatePost();
    setShowInstagramCreator(false);
  };

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <div className="relative">
        {/* Quick Action Buttons */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: action.delay }}
                  className="flex items-center space-x-3"
                >
                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: action.delay + 0.05 }}
                    className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border text-sm font-medium whitespace-nowrap"
                  >
                    {action.label}
                  </motion.div>
                  
                  {/* Action Button */}
                  <Button
                    size="sm"
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg text-white transition-all duration-200",
                      action.color,
                      "hover:scale-110 active:scale-95"
                    )}
                    onClick={() => handleAction(action.action)}
                  >
                    {action.icon}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            rotate: isExpanded ? 45 : 0,
            scale: isExpanded ? 1.1 : 1
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
              "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
              "text-white border-2 border-white/20",
              isExpanded && "shadow-xl"
            )}
            onClick={() => {
              if (isExpanded) {
                setIsExpanded(false);
              } else {
                handleMainButtonClick();
              }
            }}
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.15 }}
                >
                  <Plus className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        {/* Pulsing Ring Animation */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-orange-400"
          animate={!isExpanded ? {
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.3, 0.7]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Background Overlay */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
              onClick={() => setIsExpanded(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip for main button when collapsed */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 right-0 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          สร้างโพสต์ใหม่
        </motion.div>
      )}

      {/* Instagram Style Post Creator */}
      <InstagramStylePostCreator
        open={showInstagramCreator}
        onOpenChange={setShowInstagramCreator}
        onSubmit={handlePostSubmit}
        currentLanguage="th"
      />
    </div>
  );
};

export default FloatingPostButton;