import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TravelCommunityFeed } from '@/components/community/TravelCommunityFeed';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { BackButton } from '@/components/attraction/BackButton';

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <BackButton onClick={handleBack} />
        </div>
        <TravelCommunityFeed currentLanguage={currentLanguage} />
      </main>

      <BottomNavigation currentLanguage={currentLanguage} />
    </div>
  );
};

export default Community;