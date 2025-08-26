import apiClient from '@/lib/axios';
import { AIRequest, AIResponse } from '@/shared/hooks/useSmartAI';

// API call to the new endpoint
export const callAIAPI = async (request: AIRequest): Promise<AIResponse> => {
  const payload = {
    input: request.message
  };

  const { data } = await apiClient.post('/api/predict', payload);

  const responseText = data.response || data.output || data.generated_text || JSON.stringify(data);

  return {
    response: responseText,
    language: data.language || 'th', // Assume Thai
    session_id: data.session_id, // Pass it if present
  };
};
