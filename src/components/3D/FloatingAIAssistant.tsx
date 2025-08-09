import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Volume2, VolumeX } from 'lucide-react';
import useSmartAI from '@/shared/hooks/useSmartAI';
import useVoiceInput from '@/shared/hooks/useVoiceInput';
import ChatInterface from '../AIAssistant/ChatInterface';
import InputArea from '../AIAssistant/InputArea';

interface FloatingAIAssistantProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  alwaysVisible?: boolean;
}

const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  position = 'bottom-right',
  size = 'small',
  alwaysVisible = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [language] = useState<'th' | 'en' | 'auto'>('auto');

  const { 
    messages, 
    status, 
    isLoading, 
    sendMessage,
    clearMessages
  } = useSmartAI();

  const {
    isListening,
    transcript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening
  } = useVoiceInput({
    language: 'th-TH',
    continuous: false,
    interimResults: true
  });

  // Handle voice input result
  useEffect(() => {
    if (transcript && !isListening) {
      setInputText(transcript);
    }
  }, [transcript, isListening]);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-5 right-5',
    'bottom-left': 'bottom-5 left-5',
    'top-right': 'top-5 right-5',
    'top-left': 'top-5 left-5'
  };

  // Size configurations
  const sizeConfig = {
    small: { 
      avatar: 'w-12 h-12', 
      face: 'w-8 h-8',
      chat: 'w-80 h-96'
    },
    medium: { 
      avatar: 'w-16 h-16', 
      face: 'w-10 h-10',
      chat: 'w-96 h-[28rem]'
    },
    large: { 
      avatar: 'w-20 h-20', 
      face: 'w-12 h-12',
      chat: 'w-[24rem] h-[32rem]'
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      sendMessage(inputText, language);
      setInputText('');
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((result) => {
        if (result.isFinal && result.transcript.trim()) {
          sendMessage(result.transcript, language);
        }
      });
    }
  };

  const handleQuickGreeting = () => {
    sendMessage('สวัสดีครับ มีอะไรให้ช่วยเหลือไหมครับ', 'th');
    setIsExpanded(true);
  };

  const config = sizeConfig[size];

  // Auto-expand when there are messages
  useEffect(() => {
    if (messages.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [messages.length, isExpanded]);

  return (
    <div className={`fixed ${positionClasses[position]} z-50 transition-all duration-300`}>
      {/* Chat Window */}
      {isExpanded && (
        <div 
          className={`${config.chat} bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border mb-4 flex flex-col animate-scale-in`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className={`${config.face} bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center`}>
                <div className="text-white text-sm">🤖</div>
              </div>
              <div>
                <h3 className="font-semibold text-sm">PaiNaiDee AI</h3>
                <p className="text-xs text-muted-foreground capitalize">{status}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 p-0"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ChatInterface
                messages={messages}
                isLoading={isLoading}
                language={language}
                onSuggestedQuestion={(question) => {
                  setInputText(question);
                  sendMessage(question, language);
                }}
                onQuickAction={(action, query) => sendMessage(query, language)}
                disabled={isLoading || isListening}
              />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border">
              <InputArea
                inputText={inputText}
                setInputText={setInputText}
                onSendMessage={handleSendMessage}
                onVoiceToggle={handleVoiceToggle}
                isListening={isListening}
                isVoiceSupported={isVoiceSupported}
                isLoading={isLoading}
                transcript={transcript}
                language={language}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Avatar */}
      <div 
        className={`${config.avatar} bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full shadow-lg border border-primary/30 backdrop-blur-sm cursor-pointer hover:scale-110 transition-all duration-200 relative`}
        onClick={() => isExpanded ? handleQuickGreeting() : setIsExpanded(true)}
      >
        {/* Avatar Face */}
        <div className="w-full h-full flex items-center justify-center relative">
          <div 
            className={`${config.face} rounded-full transition-all duration-300 flex items-center justify-center ${
              status === 'listening' ? 'animate-pulse bg-green-400' :
              status === 'thinking' ? 'animate-spin bg-yellow-400' :
              status === 'talking' ? 'animate-bounce bg-blue-400' :
              'bg-primary'
            }`}
          >
            {/* Simple emoji face */}
            <div className="text-white text-lg">
              {status === 'listening' ? '👂' :
               status === 'thinking' ? '🤔' :
               status === 'talking' ? '🗣️' : '🤖'}
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
            status === 'idle' ? 'bg-gray-400' :
            status === 'listening' ? 'bg-green-500 animate-pulse' :
            status === 'thinking' ? 'bg-yellow-500' :
            status === 'talking' ? 'bg-blue-500' : 'bg-red-500'
          }`}></div>
          
          {/* Message Count Badge */}
          {messages.length > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
              {messages.length > 9 ? '9+' : messages.length}
            </div>
          )}
          
          {/* Chat Icon for collapsed state */}
          {!isExpanded && (
            <div className="absolute -bottom-1 -left-1 bg-background border border-border rounded-full p-1">
              <MessageCircle className="h-3 w-3 text-primary" />
            </div>
          )}
        </div>

        {/* Quick Action Tooltip */}
        {!isExpanded && status === 'idle' && alwaysVisible && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-lg text-xs shadow-lg border animate-fade-in whitespace-nowrap">
            คลิกเพื่อสอบถาม AI
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingAIAssistant;