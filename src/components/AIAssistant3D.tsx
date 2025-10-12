import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import useSmartAI from '@/shared/hooks/useSmartAI';
import useVoiceInput from '@/shared/hooks/useVoiceInput';
import useAIAnimation from '@/shared/hooks/useAIAnimation';

// New component imports
import ChatInterface from './AIAssistant/ChatInterface';
import InputArea from './AIAssistant/InputArea';
import LoadingBar from './UI/LoadingBar';
// import NavigationModel from './CSS3DAvatar';
// import EnhancedAIAssistant from './3D/EnhancedAIAssistant';
import AIAssistantAdmin from './3D/admin/AIAssistantAdmin';
import { defaultConfig } from './3D/config/AIAssistantConfig';

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

interface AIAssistant3DProps {
  language: 'th' | 'en' | 'auto';
}

const AIAssistant3D: React.FC<AIAssistant3DProps> = ({ language }) => {
  const [inputText, setInputText] = useState('');
  const [useEnhanced3D, setUseEnhanced3D] = useState(false);
  const [assistantConfig, setAssistantConfig] = useState(defaultConfig);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-travel-blue-50 via-white to-travel-green-100 relative">
      {/* Compact 3D AI Assistant - small floating helper */}
      {useEnhanced3D && (
        <div 
          className={`fixed transition-all duration-300 z-50 ${
            messages.length > 0 ? 'bottom-20 right-5' : 'bottom-5 right-5'
          }`}
        >
          {/* Main assistant avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full shadow-lg border border-primary/30 backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform duration-200">
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Avatar face */}
              <div 
                className={`w-10 h-10 rounded-full transition-all duration-300 ${
                  status === 'listening' ? 'animate-pulse bg-green-400' :
                  status === 'thinking' ? 'animate-spin bg-yellow-400' :
                  status === 'talking' ? 'animate-bounce bg-blue-400' :
                  'bg-primary'
                }`}
              >
                {/* Eyes */}
                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full"></div>
                {/* Mouth */}
                <div className={`absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-white rounded transition-all duration-200 ${
                  status === 'talking' ? 'animate-ping' : ''
                }`}></div>
              </div>
              
              {/* Status indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                status === 'idle' ? 'bg-gray-400' :
                status === 'listening' ? 'bg-green-500 animate-pulse' :
                status === 'thinking' ? 'bg-yellow-500' :
                status === 'talking' ? 'bg-blue-500' : 'bg-red-500'
              }`}></div>
              
              {/* Message count badge */}
              {messages.length > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {messages.length > 9 ? '9+' : messages.length}
                </div>
              )}
            </div>
          </div>
          
          {/* Quick action tooltip */}
          {status === 'idle' && (
            <div className="absolute bottom-full right-0 mb-2 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-lg text-xs shadow-lg border animate-fade-in">
              คลิกเพื่อถาม
            </div>
          )}
        </div>
      )}

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
              {/* Enhanced 3D Toggle */}
              <Button
                onClick={() => setUseEnhanced3D(!useEnhanced3D)}
                variant={useEnhanced3D ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                3D Assistant
              </Button>
              
              {/* Admin Panel Toggle */}
              <Button
                onClick={() => setShowAdminPanel(true)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Settings
              </Button>
              
              {/* Loading bar */}
              <div className="hidden sm:block w-20">
                <LoadingBar isVisible={isLoading} />
              </div>
              
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
      
      {/* Admin Panel */}
      {showAdminPanel && (
        <AIAssistantAdmin
          config={assistantConfig}
          onConfigChange={setAssistantConfig}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* Mobile loading bar */}
      <div className="sm:hidden px-4">
        <LoadingBar isVisible={isLoading} />
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
          
          {/* 3D Model Section - Only show if enhanced 3D is disabled */}
          {!useEnhanced3D && (
            <div className="order-2 lg:order-1">
              <div className="h-full min-h-[300px] lg:min-h-[500px]">
                {/* Temporarily using CSS Avatar instead of Three.js due to compatibility issues */}
                <div className="w-full h-full bg-gradient-to-br from-travel-blue-50 to-travel-green-100 rounded-lg overflow-hidden relative flex items-center justify-center">
                  <div className="relative">
                    <div 
                      className={`w-32 h-32 rounded-full border-4 transition-all duration-300 ${
                        status === 'listening' ? 'animate-pulse' :
                        status === 'thinking' ? 'animate-spin' :
                        status === 'talking' ? 'animate-bounce' : ''
                      }`}
                      style={{ 
                        backgroundColor: statusColor,
                        borderColor: statusColor,
                        boxShadow: `0 0 30px ${statusColor}40`
                      }}
                    >
                      {/* Eyes */}
                      <div className="absolute top-8 left-6 w-4 h-4 bg-white rounded-full">
                        <div className="absolute top-1 left-1 w-2 h-2 bg-black rounded-full"></div>
                      </div>
                      <div className="absolute top-8 right-6 w-4 h-4 bg-white rounded-full">
                        <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full"></div>
                      </div>
                      
                      {/* Mouth */}
                      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-red-400 rounded-full transition-all duration-200 ${
                        status === 'talking' ? 'animate-ping' : ''
                      }`}></div>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="px-4 py-2 rounded-full text-white font-semibold text-sm"
                        style={{ backgroundColor: statusColor }}
                      >
                        {status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status overlay */}
                  <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          status === 'idle' ? 'bg-blue-500' :
                          status === 'listening' ? 'bg-green-500 animate-pulse' :
                          status === 'thinking' ? 'bg-yellow-500 animate-spin' :
                          status === 'talking' ? 'bg-purple-500 animate-bounce' :
                          'bg-red-500'
                        }`}
                      />
                      <span className="text-sm capitalize">{status}</span>
                    </div>
                  </div>
                  
                  {/* Message count indicator */}
                  {messages.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-travel-blue-500 text-white px-3 py-2 rounded-full text-sm">
                      {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chat Section */}
          <div className={`order-1 ${useEnhanced3D ? 'lg:col-span-2' : 'lg:order-2'} flex flex-col`}>
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