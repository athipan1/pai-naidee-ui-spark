import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIAssistantTriggerProps {
  onClick: () => void;
  language?: 'th' | 'en';
}

const AIAssistantTrigger: React.FC<AIAssistantTriggerProps> = ({
  onClick,
  language = 'en'
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        size="lg"
        className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label={language === 'th' ? 'เปิดผู้ช่วย AI' : 'Open AI Assistant'}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      {/* Tooltip for first-time users */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-lg text-xs shadow-lg border animate-fade-in whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300">
        {language === 'th' ? 'คลิกเพื่อสอบถาม AI' : 'Click to ask AI'}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-background/90"></div>
      </div>
    </div>
  );
};

export default AIAssistantTrigger;