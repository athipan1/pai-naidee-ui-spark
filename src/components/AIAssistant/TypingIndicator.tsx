import React from 'react';

interface TypingIndicatorProps {
  isVisible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="bg-white border border-travel-neutral-500/20 rounded-2xl px-4 py-3 shadow-sm relative">
        {/* Message tail */}
        <div className="absolute left-0 top-4 -translate-x-1 w-0 h-0 border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent" />
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-travel-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-travel-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-travel-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-travel-neutral-500">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;