import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

export interface AIMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  language?: 'th' | 'en' | 'auto';
}

export interface AIResponse {
  response: string;
  session_id?: string;
  language?: string;
  confidence?: number;
  intent?: string;
}

export interface AIRequest {
  message: string;
  session_id?: string;
  language?: 'th' | 'en' | 'auto';
}

export type AIStatus = 'idle' | 'listening' | 'thinking' | 'talking' | 'error';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useSmartAI = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [status, setStatus] = useState<AIStatus>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('ai_session_id');
    const savedMessages = localStorage.getItem('ai_messages');
    
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.warn('Failed to load saved messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('ai_session_id', sessionId);
    }
  }, [sessionId]);

  // API call to /api/talk endpoint
  const callAIAPI = async (request: AIRequest): Promise<AIResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/talk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('API call failed, using fallback response:', error);
      
      // Fallback to mock response when API is not available
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const responses = {
        th: [
          'สวัสดีครับ! ยินดีต้อนรับสู่ PaiNaiDee ครับ',
          'ขอบคุณที่ใช้บริการของเราครับ มีอะไรให้ช่วยเหลือไหมครับ?',
          'ผมพร้อมช่วยแนะนำสถานที่ท่องเที่ยวในประเทศไทยให้ครับ',
          'หากต้องการข้อมูลเกี่ยวกับการท่องเที่ยว กรุณาสอบถามได้เลยครับ'
        ],
        en: [
          'Hello! Welcome to PaiNaiDee, your travel companion!',
          'Thank you for using our service. How can I help you today?',
          'I\'m ready to recommend amazing places to visit in Thailand',
          'Feel free to ask me anything about travel destinations!'
        ]
      };

      const isThaiInput = /[\u0E00-\u0E7F]/.test(request.message);
      const responseLanguage = request.language === 'auto' ? (isThaiInput ? 'th' : 'en') : (request.language || 'en');
      const responseOptions = responses[responseLanguage as keyof typeof responses] || responses.en;
      const randomResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];

      return {
        response: randomResponse,
        session_id: sessionId || `session_${Date.now()}`,
        language: responseLanguage,
        confidence: 0.85 + Math.random() * 0.15,
        intent: 'greeting'
      };
    }
  };

  const mutation = useMutation({
    mutationFn: callAIAPI,
    onMutate: () => {
      setStatus('thinking');
    },
    onSuccess: (response: AIResponse) => {
      // Update session ID if provided
      if (response.session_id && response.session_id !== sessionId) {
        setSessionId(response.session_id);
      }

      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        text: response.response,
        sender: 'ai',
        timestamp: new Date(),
        language: response.language as 'th' | 'en'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setStatus('talking');
      
      // Use Speech Synthesis to speak the response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.response);
        utterance.lang = response.language === 'th' ? 'th-TH' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
          setStatus('idle');
        };
        
        speechSynthesis.speak(utterance);
      } else {
        // Fallback: simulate talking duration based on message length
        const talkingDuration = Math.max(2000, response.response.length * 50);
        setTimeout(() => {
          setStatus('idle');
        }, talkingDuration);
      }
    },
    onError: (error) => {
      console.error('AI API Error:', error);
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

    // Send to AI with session ID
    mutation.mutate({
      message: text.trim(),
      session_id: sessionId || undefined,
      language: language
    });
  }, [mutation, sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStatus('idle');
    // Clear session data
    setSessionId(null);
    localStorage.removeItem('ai_session_id');
    localStorage.removeItem('ai_messages');
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
    sessionId,
    isLoading: mutation.isPending,
    error: mutation.error,
    sendMessage,
    clearMessages,
    startListening,
    stopListening
  };
};

export default useSmartAI;