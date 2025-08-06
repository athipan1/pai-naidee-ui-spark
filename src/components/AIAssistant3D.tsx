import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, MessageCircle, Trash2, Loader2, Lightbulb } from 'lucide-react';
import useSmartAI, { AIMessage } from '@/shared/hooks/useSmartAI';
import useVoiceInput from '@/shared/hooks/useVoiceInput';
import useAIAnimation from '@/shared/hooks/useAIAnimation';

// Lazy load Three.js components to prevent SSR issues
const ThreeJSScene = React.lazy(() => 
  import('./ThreeJSScene').catch(() => ({
    default: () => (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-16 h-16" />
          </div>
          <p>3D Avatar Loading...</p>
        </div>
      </div>
    )
  }))
);

// Chat message component
const ChatMessage: React.FC<{ message: AIMessage; isLast: boolean }> = ({ message, isLast: _isLast }) => {
  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg px-4 py-2`}>
        <p className="text-sm">{message.text}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString()}
          </span>
          {message.language && (
            <Badge variant="secondary" className="text-xs">
              {message.language.toUpperCase()}
            </Badge>
          )}
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
    statusColor,
    animationMultipliers
  } = useAIAnimation(status);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PaiNaiDee AI Assistant</h1>
            <p className="text-sm text-gray-600">Your 3D travel companion</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={status === 'idle' ? 'secondary' : 'default'}>
              {status === 'thinking' ? 'Processing...' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            {sessionId && (
              <Badge variant="outline" className="text-xs">
                Session: {sessionId.slice(-8)}
              </Badge>
            )}
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as 'th' | 'en' | 'auto')}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="auto">Auto Detect</option>
              <option value="th">ไทย</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 3D Avatar Section */}
        <div className="w-1/2 bg-gray-900 relative">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                <p>Loading 3D Avatar...</p>
              </div>
            </div>
          }>
            <ThreeJSScene 
              status={status}
              animationMultipliers={animationMultipliers}
              statusColor={statusColor}
            />
          </Suspense>
          
          {/* Status overlay */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg">
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
        </div>

        {/* Chat Section */}
        <div className="w-1/2 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with your AI assistant!</p>
                  <p className="text-sm mt-2">You can type, use voice input, or try suggested questions below</p>
                  
                  {/* Suggested Questions */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Suggested questions:</span>
                    </div>
                    <div className="grid gap-2">
                      {currentSuggestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedQuestion(question)}
                          className="text-left text-sm h-auto p-3 whitespace-normal"
                          disabled={isLoading || isListening}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    isLast={index === messages.length - 1}
                  />
                ))
              )}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-white p-4 space-y-3">
            {/* Voice feedback */}
            {isListening && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">Listening...</span>
                </div>
                {transcript && (
                  <p className="text-sm text-green-600 mt-1">&ldquo;{transcript}&rdquo;</p>
                )}
              </div>
            )}

            {/* Error display */}
            {(error || voiceError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">
                  {error?.message || voiceError || 'An error occurred'}
                </p>
              </div>
            )}

            {/* Input controls */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'th' ? 'พิมพ์ข้อความ...' : 'Type your message...'}
                  disabled={isLoading || isListening}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading || isListening}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {isVoiceSupported && (
                <Button
                  onClick={handleVoiceToggle}
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              
              <Button
                onClick={clearMessages}
                variant="outline"
                size="sm"
                disabled={messages.length === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant3D;