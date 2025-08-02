import React from 'react';
import AIAssistant3D from '@/components/AIAssistant3D';

interface AIAssistantPageProps {
  currentLanguage: 'th' | 'en';
  onBack: () => void;
}

const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ currentLanguage: _currentLanguage, onBack: _onBack }) => {
  return (
    <div className="min-h-screen">
      <AIAssistant3D />
    </div>
  );
};

export default AIAssistantPage;