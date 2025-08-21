import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedTravelCommunityFeed } from '@/components/community/UnifiedTravelCommunityFeed';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { BackButton } from '@/components/attraction/BackButton';
import { CreatePostButton } from '@/components/community/CreatePostButton';
import { CreatePostData } from '@/shared/types/community';

interface CommunityProps {
  currentLanguage: 'th' | 'en';
  onLanguageChange: (language: 'th' | 'en') => void;
  onBack?: () => void;
}

const Community: React.FC<CommunityProps> = ({ 
  currentLanguage, 
  onLanguageChange,
  onBack: _onBack 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleCreatePost = (postData: CreatePostData) => {
    console.log('New post created:', postData);
    // In a real app, this would call an API to create the post
    // and then refresh the feed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
      
      <main className="relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-4 w-32 h-32 bg-gradient-to-br from-amber-100/20 to-orange-100/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-8 w-24 h-24 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/2 w-28 h-28 bg-gradient-to-br from-rose-100/20 to-pink-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="mb-4 px-4 pt-6 flex items-center justify-between">
            <BackButton onClick={handleBack} />
            
            {/* Create Post Button - positioned at top right */}
            <CreatePostButton
              onCreatePost={handleCreatePost}
              currentLanguage={currentLanguage}
              variant="compact"
              className="relative"
            />
          </div>

          {/* Unified Community Feed */}
          <UnifiedTravelCommunityFeed currentLanguage={currentLanguage} />
        </div>
      </main>

      <BottomNavigation currentLanguage={currentLanguage} />
    </div>
  );
};

export default Community;