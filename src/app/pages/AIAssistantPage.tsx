import React from 'react';
import AIAssistant3D from '@/components/AIAssistant3D';
import FloatingAIAssistant from '@/components/3D/FloatingAIAssistant';
import { BackButton } from '@/components/attraction/BackButton';

interface AIAssistantPageProps {
  currentLanguage: 'th' | 'en';
  onBack: () => void;
}

const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ currentLanguage, onBack }) => {
  return (
    <div className="min-h-screen relative">
      {/* Back Button */}
      <BackButton
        onClick={onBack}
        variant="floating"
        className="z-50"
      />

      <AIAssistant3D language={currentLanguage} />
      {/* Add floating assistant that follows user */}
      <FloatingAIAssistant
        position="bottom-right"
        size="small"
        alwaysVisible={true}
        language={currentLanguage}
      />
    </div>
  );
};

export default AIAssistantPage;