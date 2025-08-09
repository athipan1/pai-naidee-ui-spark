import React from 'react';
import AIAssistant3D from '@/components/AIAssistant3D';
import FloatingAIAssistant from '@/components/3D/FloatingAIAssistant';
import { BackButton } from '@/components/attraction/BackButton';

interface AIAssistantPageProps {
  currentLanguage: 'th' | 'en';
  onBack: () => void;
}

const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ currentLanguage: _currentLanguage, onBack }) => {
  return (
    <div className="min-h-screen relative">
      {/* Back Button */}
      <BackButton 
        onClick={onBack}
        variant="floating"
        className="z-50"
      />
      
      <AIAssistant3D />
      {/* Add floating assistant that follows user */}
      <FloatingAIAssistant 
        position="bottom-right" 
        size="small" 
        alwaysVisible={true} 
      />
    </div>
  );
};

export default AIAssistantPage;