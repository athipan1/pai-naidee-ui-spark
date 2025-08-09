import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import useSmartAI from '@/shared/hooks/useSmartAI';
import useVoiceInput from '@/shared/hooks/useVoiceInput';
import useAIAnimation from '@/shared/hooks/useAIAnimation';

// New component imports
import ChatInterface from './AIAssistant/ChatInterface';
import InputArea from './AIAssistant/InputArea';
import LanguageSwitcher from './AIAssistant/LanguageSwitcher';
import LoadingBar from './UI/LoadingBar';
import NavigationModel from './CSS3DAvatar';

// Chat message component - keeping for backward compatibility but will be replaced
const ChatMessage: React.FC<{ message: any; isLast: boolean }> = ({ message, isLast }) => {
  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${message.sender === 'user' ? 'bg-travel-blue-500 text-white' : 'bg-white border border-travel-neutral-500/20 text-travel-neutral-800'} rounded-lg px-4 py-2 shadow-sm`}>
        <p className="text-sm">{message.text}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const AIAssistant3D: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<'th' | 'en' | 'auto'>('auto');
  
  const { 
    messages, 
    status, 
    sessionId,
    isLoading, 
    error, 
    sendMessage, 
    clearMessages,
    startListening: startAIListening,
    stopListening: stopAIListening
  } = useSmartAI();

  const {
    isListening,
    transcript,
    error: voiceError,
    isSupported: isVoiceSupported,
    startListening: startVoiceListening,
    stopListening: stopVoiceListening,
    changeLanguage
  } = useVoiceInput({
    language: language === 'th' ? 'th-TH' : 'en-US',
    continuous: false,
    interimResults: true
  });

  const {
    statusColor
  } = useAIAnimation(status);

  // Handle voice input result
  useEffect(() => {
    if (transcript && !isListening) {
      setInputText(transcript);
    }
  }, [transcript, isListening]);

  // Update voice recognition language when language changes
  useEffect(() => {
    const voiceLanguage = language === 'th' ? 'th-TH' : language === 'en' ? 'en-US' : 'th-TH';
    changeLanguage(voiceLanguage);
  }, [language, changeLanguage]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      sendMessage(inputText, language);
      setInputText('');
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopVoiceListening();
      stopAIListening();
    } else {
      startAIListening();
      startVoiceListening((result) => {
        if (result.isFinal && result.transcript.trim()) {
          sendMessage(result.transcript, language);
        }
      });
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
    sendMessage(question, language);
  };

  const handleQuickAction = (action: string, query: string) => {
    sendMessage(query, language);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-travel-blue-50 via-white to-travel-green-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-travel-neutral-500/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-travel-neutral-800 font-poppins">
                PaiNaiDee AI Assistant
              </h1>
              <p className="text-sm text-travel-neutral-500">
                Your intelligent travel companion powered by AI
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Loading bar */}
              <div className="hidden sm:block w-20">
                <LoadingBar isVisible={isLoading} />
              </div>
              
              {/* Language switcher */}
              <LanguageSwitcher 
                language={language} 
                onLanguageChange={setLanguage} 
              />
              
              {/* Session info */}
              {sessionId && (
                <div className="hidden md:block text-xs text-travel-neutral-500 bg-travel-neutral-50 px-2 py-1 rounded">
                  Session: {sessionId.slice(-8)}
                </div>
              )}
              
              {/* Clear button */}
              <Button
                onClick={clearMessages}
                variant="outline"
                size="sm"
                disabled={messages.length === 0}
                className="text-travel-neutral-500 border-travel-neutral-500/20 hover:bg-travel-neutral-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Clear</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile loading bar */}
      <div className="sm:hidden px-4">
        <LoadingBar isVisible={isLoading} />
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
          
          {/* 3D Model Section */}
          <div className="order-2 lg:order-1">
            <div className="h-full min-h-[300px] lg:min-h-[500px]">
              <NavigationModel 
                status={status}
                statusColor={statusColor}
                messages={messages}
              />
            </div>
          </div>

          {/* Chat Section */}
          <div className="order-1 lg:order-2 flex flex-col">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-travel-neutral-500/10 h-full flex flex-col">
              
              {/* Chat Interface */}
              <div className="flex-1">
                <ChatInterface
                  messages={messages}
                  isLoading={isLoading}
                  language={language}
                  onSuggestedQuestion={handleSuggestedQuestion}
                  onQuickAction={handleQuickAction}
                  disabled={isLoading || isListening}
                />
              </div>

              {/* Error display */}
              {(error || voiceError) && (
                <div className="mx-4 mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">
                    {error?.message || voiceError || 'An error occurred'}
                  </p>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-travel-neutral-500/10">
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
        </div>
      </div>
    </div>
  );
};

export default AIAssistant3D;