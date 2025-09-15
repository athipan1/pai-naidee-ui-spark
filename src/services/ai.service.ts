import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import { AIRequest, AIResponse } from '@/shared/hooks/useSmartAI';

// API call to the AI prediction endpoint
export const callAIAPI = async (request: AIRequest): Promise<AIResponse> => {
  const payload = {
    input: request.message
  };

  try {
    const { data } = await apiClient.post(API_ENDPOINTS.AI_PREDICT, payload);

    const responseText = data.response || data.output || data.generated_text || JSON.stringify(data);

    return {
      response: responseText,
      language: data.language || 'th', // Assume Thai as default
      session_id: data.session_id, // Pass session ID if present
    };
  } catch (error) {
    // If /predict fails, try /talk endpoint as fallback
    try {
      console.warn('AI_PREDICT endpoint failed, trying AI_TALK fallback');
      const { data } = await apiClient.post(API_ENDPOINTS.AI_TALK, payload);
      
      return {
        response: data.response || data.output || data.generated_text || JSON.stringify(data),
        language: data.language || 'th',
        session_id: data.session_id,
      };
    } catch (fallbackError) {
      // Re-throw the enhanced error with user-friendly message
      throw new Error((fallbackError as any)?.userMessage || 'AI service is currently unavailable');
    }
  }
};
