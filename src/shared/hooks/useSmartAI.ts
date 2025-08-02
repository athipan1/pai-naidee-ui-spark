import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

export interface AIMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  language?: 'th' | 'en' | 'auto';
}

export interface AIResponse {
  message: string;
  language: string;
  confidence?: number;
  intent?: string;
  source: string;
}

export interface AIRequest {
  message: string;
  lang: 'th' | 'en' | 'auto';
  source: '3d-assistant';
}

export type AIStatus = 'idle' | 'listening' | 'thinking' | 'talking' | 'error';

const useSmartAI = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [status, setStatus] = useState<AIStatus>('idle');

  // Mock API call - replace with actual endpoint when backend is available
  const callAIAPI = async (request: AIRequest): Promise<AIResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock response based on input
    const responses = {
      th: [
        'สวัสดีครับ! ยินดีต้อนรับสู่ PaiNaiDee',
        'ขอบคุณที่ใช้บริการของเราครับ',
        'มีอะไรให้ช่วยเหลือไหมครับ?',
        'ผมพร้อมช่วยแนะนำสถานที่ท่องเที่ยวให้ครับ'
      ],
      en: [
        'Hello! Welcome to PaiNaiDee',
        'Thank you for using our service',
        'How can I help you today?',
        'I\'m ready to recommend amazing places to visit'
      ]
    };

    const isThaiInput = /[\u0E00-\u0E7F]/.test(request.message);
    const responseLanguage = request.lang === 'auto' ? (isThaiInput ? 'th' : 'en') : request.lang;
    const responseOptions = responses[responseLanguage];
    const randomResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];

    return {
      message: randomResponse,
      language: responseLanguage,
      confidence: 0.85 + Math.random() * 0.15,
      intent: 'greeting',
      source: '3d-assistant'
    };
  };

  const mutation = useMutation({
    mutationFn: callAIAPI,
    onMutate: () => {
      setStatus('thinking');
    },
    onSuccess: (response: AIResponse) => {
      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        language: response.language as 'th' | 'en'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setStatus('talking');
      
      // Simulate talking duration based on message length
      const talkingDuration = Math.max(2000, response.message.length * 50);
      setTimeout(() => {
        setStatus('idle');
      }, talkingDuration);
    },
    onError: () => {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  });

  const sendMessage = useCallback((text: string, language: 'th' | 'en' | 'auto' = 'auto') => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      language
    };

    setMessages(prev => [...prev, userMessage]);

    // Send to AI
    mutation.mutate({
      message: text.trim(),
      lang: language,
      source: '3d-assistant'
    });
  }, [mutation]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStatus('idle');
  }, []);

  const startListening = useCallback(() => {
    setStatus('listening');
  }, []);

  const stopListening = useCallback(() => {
    setStatus('idle');
  }, []);

  return {
    messages,
    status,
    isLoading: mutation.isPending,
    error: mutation.error,
    sendMessage,
    clearMessages,
    startListening,
    stopListening
  };
};

export default useSmartAI;