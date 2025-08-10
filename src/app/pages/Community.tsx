import React from 'react';
import { InstagramCommunityFeed } from '@/components/community/InstagramCommunityFeed';

interface CommunityProps {
  currentLanguage: 'th' | 'en';
  onLanguageChange: (language: 'th' | 'en') => void;
  onBack?: () => void;
}

const Community: React.FC<CommunityProps> = ({ 
  currentLanguage, 
  onLanguageChange,
  onBack
}) => {
  return (
    <InstagramCommunityFeed 
      currentLanguage={currentLanguage}
      onLanguageChange={onLanguageChange}
      onBack={onBack}
    />
  );
};

export default Community;