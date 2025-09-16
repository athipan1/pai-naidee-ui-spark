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

// ADDED: New health check function as requested by the user.
export const checkBackendHealth = async (): Promise<TestResult> => {
  console.log('🚀 Running backend health check...');
  try {
    const response = await apiClient.get('/health', { timeout: 10000 });

    if (response.data && response.data.status === 'ok' && response.data.message === 'Backend is running') {
      console.log('✅ Health Check Successful!', response.data);
      return {
        success: true,
        status: response.status,
        data: response.data,
        message: 'Backend is running and reachable.',
      };
    } else {
      console.warn('⚠️ Health check returned unexpected data:', response.data);
      return {
        success: false,
        status: response.status,
        data: response.data,
        message: `Backend is reachable, but returned an unexpected status: ${JSON.stringify(response.data)}`,
      };
    }
  } catch (error) {
    const err = error as AxiosError;
    console.error('❌ Health Check Failed!', err);

    const errorMessage = (err.message || '').toLowerCase();
    if (err.code === 'ERR_CORS_MISMATCH' || errorMessage.includes('cors')) {
      return {
        success: false,
        status: 'CORS Error',
        data: null,
        message: 'CORS Error: The request was blocked. Ensure the backend allows requests from this origin.',
      };
    }

    if (err.response) {
      const { status, data } = err.response;
      return {
        success: false,
        status,
        data,
        message: `Backend Down: Server responded with status ${status}.`,
      };
    } else if (err.request) {
      return {
        success: false,
        status: 'Network Error',
        data: null,
        message: 'Network Error: Could not connect to the server. The backend might be down or the URL is incorrect.',
      };
    } else {
      return {
        success: false,
        status: 'Request Setup Error',
        data: null,
        message: `An unexpected error occurred: ${err.message}`,
      };
    }
  }
};

export const checkSearchEndpoint = async (): Promise<TestResult> => {
  console.log('🚀 Running search endpoint check...');
  const searchQuery = 'เชียงใหม่';
  try {
    const response = await apiClient.get(`/search?q=${searchQuery}`, { timeout: 10000 });

    if (response.data) {
      console.log('✅ Search Endpoint Successful!', response.data);
      return {
        success: true,
        status: response.status,
        data: response.data,
        message: 'Search endpoint is working correctly.',
      };
    } else {
      console.warn('⚠️ Search endpoint returned unexpected data:', response.data);
      return {
        success: false,
        status: response.status,
        data: response.data,
        message: `Search endpoint is reachable, but returned an unexpected response: ${JSON.stringify(response.data)}`,
      };
    }
  } catch (error) {
    const err = error as AxiosError;
    console.error('❌ Search Endpoint Failed!', err);

    const errorMessage = (err.message || '').toLowerCase();
    if (err.code === 'ERR_CORS_MISMATCH' || errorMessage.includes('cors')) {
      return {
        success: false,
        status: 'CORS Error',
        data: null,
        message: 'CORS Error: The request was blocked. Ensure the backend allows requests from this origin.',
      };
    }

    if (err.response) {
      const { status, data } = err.response;
      return {
        success: false,
        status,
        data,
        message: `Search Endpoint Down: Server responded with status ${status}.`,
      };
    } else if (err.request) {
      return {
        success: false,
        status: 'Network Error',
        data: null,
        message: 'Network Error: Could not connect to the server. The backend might be down or the URL is incorrect.',
      };
    } else {
      return {
        success: false,
        status: 'Request Setup Error',
        data: null,
        message: `An unexpected error occurred: ${err.message}`,
      };
    }
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
