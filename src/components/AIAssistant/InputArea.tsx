import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff, Paperclip, Image, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  onVoiceToggle: () => void;
  isListening: boolean;
  isVoiceSupported: boolean;
  isLoading: boolean;
  transcript?: string;
  language: 'th' | 'en' | 'auto';
}

const InputArea: React.FC<InputAreaProps> = ({
  inputText,
  setInputText,
  onSendMessage,
  onVoiceToggle,
  isListening,
  isVoiceSupported,
  isLoading,
  transcript,
  language
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const placeholder = language === 'th' 
    ? 'พิมพ์ข้อความหรือถามเกี่ยวกับการท่องเที่ยว...'
    : 'Type your message or ask about travel...';

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Handle file drop logic here
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      {/* Voice feedback */}
      {isListening && (
        <div className="mb-3 bg-travel-green-100 border border-travel-green-300 rounded-lg p-3 animate-fade-in">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse h-3 w-3 bg-travel-green-500 rounded-full"></div>
            <span className="text-sm text-travel-green-700">
              {language === 'th' ? 'กำลังฟัง...' : 'Listening...'}
            </span>
          </div>
          {transcript && (
            <p className="text-sm text-travel-green-600 mt-1 italic">"{transcript}"</p>
          )}
        </div>
      )}

      {/* Input area with drag-and-drop */}
      <div 
        className={`
          relative rounded-2xl border-2 transition-all duration-200
          ${dragOver 
            ? 'border-travel-blue-500 bg-travel-blue-50' 
            : 'border-travel-neutral-500/20 bg-white'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {dragOver && (
          <div className="absolute inset-0 bg-travel-blue-50/90 rounded-2xl flex items-center justify-center z-10">
            <div className="text-center">
              <Paperclip className="h-8 w-8 mx-auto text-travel-blue-500 mb-2" />
              <p className="text-sm text-travel-blue-700">
                {language === 'th' ? 'วางไฟล์ที่นี่' : 'Drop files here'}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 p-3">
          {/* Attachment button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFileSelect}
            disabled={isLoading || isListening}
            className="text-travel-neutral-500 hover:text-travel-blue-500 hover:bg-travel-blue-50 p-2"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Input field */}
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading || isListening}
            className="flex-1 border-0 bg-transparent focus:ring-0 focus:border-0 text-sm"
          />

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            {/* Image upload */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFileSelect}
              disabled={isLoading || isListening}
              className="text-travel-neutral-500 hover:text-travel-green-500 hover:bg-travel-green-50 p-2"
            >
              <Image className="h-4 w-4" />
            </Button>

            {/* Location */}
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading || isListening}
              className="text-travel-neutral-500 hover:text-orange-500 hover:bg-orange-50 p-2"
            >
              <MapPin className="h-4 w-4" />
            </Button>

            {/* Voice input */}
            {isVoiceSupported && (
              <Button
                onClick={onVoiceToggle}
                variant={isListening ? "destructive" : "ghost"}
                size="sm"
                disabled={isLoading}
                className={`p-2 transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'text-travel-neutral-500 hover:text-travel-blue-500 hover:bg-travel-blue-50'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}

            {/* Send button */}
            <Button
              onClick={onSendMessage}
              disabled={!inputText.trim() || isLoading || isListening}
              className="bg-travel-blue-500 hover:bg-travel-blue-300 text-white p-2 transition-all duration-200 hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,.pdf,.doc,.docx"
          onChange={(e) => {
            // Handle file selection logic here
            console.log('Files selected:', e.target.files);
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default InputArea;