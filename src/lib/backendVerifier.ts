import apiClient from '@/lib/axios';
import { AxiosError } from 'axios';

interface TestResult {
  success: boolean;
  status: number | string;
  data: unknown;
  message: string;
}

/**
 * A simple verifier that checks if the backend is reachable and returns a boolean.
 * This is suitable for simple status indicators.
 */
export const verifyBackendUrl = async (): Promise<boolean> => {
  try {
    const result = await testHuggingFaceConnection();
    return result.success;
  } catch {
    return false;
  }
};

export const testHuggingFaceConnection = async (): Promise<TestResult> => {
  console.log('🚀 Starting Hugging Face backend connection test...');

  try {
    // We test the /attractions endpoint as requested.
    const response = await apiClient.get('/attractions', {
      // Adding a timeout to handle network issues gracefully
      timeout: 10000, // 10 seconds
    });

    console.log('✅ Connection Test Successful!', {
      status: response.status,
      data: response.data,
    });

    return {
      success: true,
      status: response.status,
      data: response.data,
      message: 'Connection to Hugging Face backend was successful.',
    };
  } catch (error) {
    const err = error as AxiosError;
    console.error('❌ Connection Test Failed!', err);

    if (err.code === 'ERR_CORS_MISMATCH' || err.message.toLowerCase().includes('cors')) {
        return {
            success: false,
            status: 'CORS Error',
            data: null,
            message: 'CORS Error: The request was blocked due to a CORS mismatch. Ensure the backend server allows requests from this origin.',
        };
    }

    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = err.response;
      let message = `Error: Server responded with status ${status}.`;

      if (status === 401) {
        message = 'Unauthorized (401): The provided HF_API_KEY is likely invalid or missing.';
      } else if (status === 404) {
        message = 'Not Found (404): The endpoint /api/attractions was not found on the server.';
      } else {
        message = `Server Error (${status}): ${JSON.stringify(data)}`;
      }

      return { success: false, status, data, message };

    } else if (err.request) {
      // The request was made but no response was received
      return {
        success: false,
        status: 'Network Error',
        data: null,
        message: 'Network Error: No response received from the server. Check the backend URL and your internet connection.',
      };
    }
    else {
      // Something happened in setting up the request that triggered an Error
      return {
        success: false,
        status: 'Request Setup Error',
        data: null,
        message: `An unexpected error occurred: ${err.message}`,
      };
    }
  }
};
