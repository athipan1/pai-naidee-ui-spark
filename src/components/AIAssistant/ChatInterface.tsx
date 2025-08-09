import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';
import { AIMessage } from '@/shared/hooks/useSmartAI';

interface ChatInterfaceProps {
  messages: AIMessage[];
  isLoading: boolean;
  language: 'th' | 'en' | 'auto';
  onSuggestedQuestion: (question: string) => void;
  onQuickAction: (action: string, query: string) => void;
  disabled?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  language,
  onSuggestedQuestion,
  onQuickAction,
  disabled = false
}) => {
  // Suggested questions for better UX
  const suggestedQuestions = {
    th: [
      'แนะนำสถานที่ท่องเที่ยวในภาคเหนือ',
      'อาหารท้องถิ่นแนะนำในกรุงเทพ', 
      'วางแผนการเดินทาง 3 วัน 2 คืน',
      'ค่าใช้จ่ายเที่ยวไทยสำหรับต่างชาติ'
    ],
    en: [
      'Recommend places to visit in Northern Thailand',
      'Local food recommendations in Bangkok',
      'Plan a 3-day 2-night trip',
      'Travel budget for tourists in Thailand'
    ]
  };

  const currentSuggestions = language === 'th' ? suggestedQuestions.th : suggestedQuestions.en;

  return (
    <div className="flex flex-col h-full">
      {/* Quick Actions - only show when no messages */}
      {messages.length === 0 && (
        <div className="p-4 border-b border-travel-neutral-500/10">
          <QuickActions
            onActionClick={onQuickAction}
            language={language}
            disabled={disabled}
          />
        </div>
      )}

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-travel-neutral-500 mt-8 space-y-6">
              <div className="space-y-4">
                <MessageCircle className="h-16 w-16 mx-auto opacity-50 text-travel-blue-300" />
                <div>
                  <h3 className="text-lg font-medium text-travel-neutral-800 mb-2">
                    {language === 'th' 
                      ? 'เริ่มสนทนากับผู้ช่วย AI ของคุณ!' 
                      : 'Start a conversation with your AI assistant!'
                    }
                  </h3>
                  <p className="text-sm">
                    {language === 'th'
                      ? 'คุณสามารถพิมพ์ข้อความ ใช้เสียง หรือเลือกคำถามแนะนำข้างล่าง'
                      : 'You can type, use voice input, or try suggested questions below'
                    }
                  </p>
                </div>
              </div>
              
              {/* Suggested Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-travel-neutral-700">
                    {language === 'th' ? 'คำถามแนะนำ:' : 'Suggested questions:'}
                  </span>
                </div>
                <div className="grid gap-3 max-w-md mx-auto">
                  {currentSuggestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => onSuggestedQuestion(question)}
                      disabled={disabled}
                      className="text-left text-sm h-auto p-4 whitespace-normal border-travel-neutral-500/20 hover:border-travel-blue-300 hover:bg-travel-blue-50 transition-all duration-200"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isLast={index === messages.length - 1}
              />
            ))
          )}
          
          {/* Typing indicator */}
          <TypingIndicator isVisible={isLoading} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatInterface;