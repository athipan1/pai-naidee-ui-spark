import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AIMessage } from '@/shared/hooks/useSmartAI';

interface MessageBubbleProps {
  message: AIMessage;
  isLast: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}
      style={{ animationDelay: isLast ? '0.1s' : '0s' }}
    >
      <div 
        className={`
          max-w-[85%] sm:max-w-[75%] md:max-w-[70%] 
          ${isUser 
            ? 'bg-gradient-to-r from-travel-blue-500 to-travel-blue-300 text-white' 
            : 'bg-white border border-travel-neutral-500/20 text-travel-neutral-800 shadow-sm'
          } 
          rounded-2xl px-4 py-3 relative
          transition-all duration-200 hover:shadow-md
        `}
      >
        {/* Message tail */}
        <div 
          className={`
            absolute top-4 w-0 h-0
            ${isUser 
              ? 'right-0 translate-x-1 border-l-8 border-l-travel-blue-500 border-t-4 border-t-transparent border-b-4 border-b-transparent' 
              : 'left-0 -translate-x-1 border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent'
            }
          `}
        />
        
        <p className="text-sm leading-relaxed">{message.text}</p>
        
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className={`text-xs ${isUser ? 'text-blue-100' : 'text-travel-neutral-500'}`}>
            {message.timestamp.toLocaleTimeString()}
          </span>
          {message.language && (
            <Badge 
              variant="secondary" 
              className={`text-xs ${isUser ? 'bg-white/20 text-white' : 'bg-travel-green-100 text-travel-green-500'}`}
            >
              {message.language.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;