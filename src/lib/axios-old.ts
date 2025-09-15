import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api';

// Get the API key from environment variables
const apiKey = import.meta.env.VITE_HF_API_KEY;

// Create an axios instance with improved configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add the Authorization header if the API key is available
if (apiKey && apiKey !== 'your_hf_api_key_here') {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
}

// Request interceptor for additional headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add timestamp to prevent caching issues
    config.metadata = { startTime: Date.now() };
    
    // Add ngrok headers if using ngrok
    if (config.baseURL?.includes('ngrok')) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with better error handling and retry logic
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time for debugging
    const responseTime = Date.now() - (response.config.metadata?.startTime || Date.now());
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${responseTime}ms`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const { config, response } = error;
    const originalRequest = config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

    // Initialize retry count
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    // Determine if we should retry
    const shouldRetry = (
      originalRequest._retryCount < API_CONFIG.RETRY_ATTEMPTS &&
      !originalRequest._retry &&
      (
        // Network errors
        error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        !response ||
        // Server errors (5xx)
        (response && response.status >= 500)
      )
    );

    if (shouldRetry) {
      originalRequest._retry = true;
      originalRequest._retryCount++;
      
      // Exponential backoff delay
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1);
      
      console.warn(`Retrying request (${originalRequest._retryCount}/${API_CONFIG.RETRY_ATTEMPTS}) after ${delay}ms:`, {
        url: originalRequest.url,
        method: originalRequest.method,
        error: error.message
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }

    // Enhanced error handling with user-friendly messages
    let userMessage = 'An unexpected error occurred';
    
    if (error.code === 'ERR_NETWORK') {
      userMessage = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      userMessage = 'Request timed out. Please try again.';
    } else if (!response) {
      userMessage = 'Server is not responding. Please try again later.';
    } else {
      // Handle specific HTTP status codes
      switch (response.status) {
        case 400:
          userMessage = response.data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          userMessage = 'Authentication failed. Please log in again.';
          // Clear auth token on 401
          localStorage.removeItem('auth_token');
          break;
        case 403:
          userMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          userMessage = 'The requested resource was not found.';
          break;
        case 429:
          userMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          userMessage = 'Server error. Our team has been notified.';
          break;
        case 502:
        case 503:
        case 504:
          userMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          userMessage = response.data?.message || error.message || userMessage;
      }
    }

    // Show toast notification for errors (only in production or when explicitly enabled)
    if (!import.meta.env.DEV || localStorage.getItem('show_api_errors') === 'true') {
      try {
        const { toast } = await import('@/shared/hooks/use-toast');
        toast({
          title: 'Error',
          description: userMessage,
          variant: 'destructive',
        });
      } catch (toastError) {
        console.warn('Failed to show error toast:', toastError);
      }
    }

    // Enhanced error object with additional context
    const enhancedError = {
      ...error,
      userMessage,
      isNetworkError: !response,
      isServerError: response && response.status >= 500,
      isClientError: response && response.status >= 400 && response.status < 500,
      retryCount: originalRequest._retryCount || 0,
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(enhancedError);
  }
);
      originalRequest._retry = originalRequest._retry || 0;

      if (originalRequest._retry < 2) { // Retry up to 2 times
        originalRequest._retry++;

        // Create a delay before retrying
        const delay = Math.pow(2, originalRequest._retry) * 300; // Exponential backoff
        return new Promise((resolve) => setTimeout(() => resolve(apiClient(originalRequest)), delay));
      }
    }

    let message = 'An unexpected error occurred. Please try again.';
    let title = 'Error';

    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      const { status, data } = error.response;
       title = `Error: ${status}`;
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      if (status === 401) {
        message = 'Token has expired or you are not authorized. Please log in again.';
        title = 'Unauthorized';
        // Here you might want to trigger a logout process
        // For example: auth.logout();
      } else if (status >= 500) {
        message = 'The server encountered an internal error. Please try again later.';
        title = 'Server Error';
      } else if (data && data.message) {
        // Use backend-provided error message if available
        message = data.message;
      }

    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
      message = 'Could not connect to the server. Please check your network connection.';
      title = 'Network Error';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      message = error.message;
    }

    // Show a user-friendly toast notification only after retries have failed
    toast({
      title: title,
      description: message,
      variant: 'destructive',
    });


    // Also include a user-friendly message in the error object
    const customError = {
      ...error,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
    };

    return Promise.reject(customError);
  }
);


// Define the interface for an Attraction
export interface Attraction {
  id: string;
  name: string;
  detail: string;
  coverimage: string;
  latitude: number;
  longitude: number;
}

// Define the interface for the list of attractions
export interface AttractionsResponse {
  attractions: Attraction[];
}

// Function to fetch all attractions
export const getAttractions = async (): Promise<AttractionsResponse> => {
  // REMOVED: '/api' prefix, as it's now part of the baseURL
  const response = await apiClient.get<AttractionsResponse>('/attractions');
  return response.data;
};

// Function to fetch a single attraction by its ID
export const getAttractionById = async (id: string): Promise<Attraction> => {
  // REMOVED: '/api' prefix
  const response = await apiClient.get<Attraction>(`/attractions/${id}`);
  return response.data;
};

// Function to create a new attraction
export const createAttraction = async (attractionData: Omit<Attraction, 'id'>): Promise<Attraction> => {
  // REMOVED: '/api' prefix
  const response = await apiClient.post<Attraction>('/attractions', attractionData);
  return response.data;
};

// ADDED: Function to check backend health
export const getHealth = async (): Promise<{ status: string }> => {
  const response = await apiClient.get<{ status: string }>('/health');
  return response.data;
};

export default apiClient;
