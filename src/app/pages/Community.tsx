import React from 'react';
import { CommunityFeed } from './CommunityFeed';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';

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
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
      
      <main className="container mx-auto px-4 py-6">
        <CommunityFeed currentLanguage={currentLanguage} />
      </main>

      <BottomNavigation currentLanguage={currentLanguage} />
    </div>
  );
};

export default Community;