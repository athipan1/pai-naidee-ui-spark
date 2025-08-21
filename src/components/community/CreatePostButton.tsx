import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, PenTool, Heart } from 'lucide-react';
import { CreatePost } from './CreatePost';
import { CreatePostData } from '@/shared/types/community';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface CreatePostButtonProps {
  onCreatePost?: (postData: CreatePostData) => void;
  currentLanguage?: 'th' | 'en';
  className?: string;
  variant?: 'default' | 'compact';
}

export const CreatePostButton: React.FC<CreatePostButtonProps> = ({
  onCreatePost,
  currentLanguage = 'th',
  className,
  variant = 'default'
}) => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePost = async (postData: CreatePostData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onCreatePost) {
        onCreatePost(postData);
      }
      
      toast.success(
        currentLanguage === 'th' 
          ? 'แบ่งปันเรื่องราวสำเร็จแล้ว!' 
          : 'Story shared successfully!'
      );
      
      setShowCreatePost(false);
    } catch (error) {
      toast.error(
        currentLanguage === 'th' 
          ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' 
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = (draftData: CreatePostData) => {
    toast.success(
      currentLanguage === 'th' 
        ? 'บันทึกแบบร่างแล้ว' 
        : 'Draft saved'
    );
  };

  if (variant === 'compact') {
    return (
      <>
        <Button
          onClick={() => setShowCreatePost(true)}
          size="sm"
          className={cn(
            "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600",
            "text-white shadow-lg hover:shadow-xl transition-all duration-300",
            "border-0 h-9 px-3",
            className
          )}
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">
            {currentLanguage === 'th' ? 'โพสต์' : 'Post'}
          </span>
        </Button>

        <CreatePost
          open={showCreatePost}
          onOpenChange={setShowCreatePost}
          onSubmit={handleCreatePost}
          isSubmitting={isSubmitting}
          currentLanguage={currentLanguage}
          onSaveDraft={handleSaveDraft}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={className}
      >
        <Button
          onClick={() => setShowCreatePost(true)}
          className={cn(
            "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600",
            "text-white shadow-lg hover:shadow-xl transition-all duration-300",
            "border-0 rounded-full h-12 px-6 font-medium",
            "flex items-center space-x-2"
          )}
        >
          <motion.div
            animate={{ rotate: showCreatePost ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Plus className="h-5 w-5" />
          </motion.div>
          <span className="flex items-center space-x-1">
            <PenTool className="h-4 w-4" />
            <span>
              {currentLanguage === 'th' ? 'แบ่งปันเรื่องราว' : 'Share Story'}
            </span>
          </span>
        </Button>

        {/* Floating hearts animation on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          whileHover={{
            scale: 1.1
          }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0, y: 0 }}
              whileHover={{
                opacity: [0, 1, 0],
                y: [0, -20, -40],
                x: [0, Math.random() * 20 - 10]
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity
              }}
              style={{
                left: `${20 + i * 30}%`,
                top: '50%'
              }}
            >
              <Heart className="h-3 w-3 text-pink-300 fill-current" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <CreatePost
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onSubmit={handleCreatePost}
        isSubmitting={isSubmitting}
        currentLanguage={currentLanguage}
        onSaveDraft={handleSaveDraft}
      />
    </>
  );
};

export default CreatePostButton;