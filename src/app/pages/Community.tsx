import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TravelCommunityFeed } from '@/components/community/TravelCommunityFeed';
import { InstagramStyleFeed } from '@/components/community/InstagramStyleFeed';
import Header from '@/components/common/Header';
import BottomNavigation from '@/components/common/BottomNavigation';
import { BackButton } from '@/components/attraction/BackButton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3, Users } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('traditional');

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
        <div className="mb-6 flex items-center justify-between">
          <BackButton onClick={handleBack} />
          
          {/* Quick access to Instagram feed */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/community/instagram')}
            className="flex items-center space-x-2"
          >
            <Grid3X3 className="h-4 w-4" />
            <span>Instagram Style</span>
          </Button>
        </div>

        {/* Enhanced Community Feed with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="traditional" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Traditional Feed</span>
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center space-x-2">
              <Grid3X3 className="h-4 w-4" />
              <span>Instagram Style</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="traditional" className="space-y-6">
            <TravelCommunityFeed currentLanguage={currentLanguage} />
          </TabsContent>

          <TabsContent value="instagram" className="space-y-6">
            <InstagramStyleFeed 
              initialFilter={{ type: 'all', sortBy: 'latest' }}
              authToken="demo-token"
            />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation currentLanguage={currentLanguage} />
    </div>
  );
};

export default Community;