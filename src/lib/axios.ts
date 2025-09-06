import axios from 'axios';
import API_BASE from '@/config/api';
import { toast } from '@/shared/hooks/use-toast';
import error404Monitor from '@/lib/error404Monitor';

// Get the API key from environment variables
const apiKey = import.meta.env.VITE_HF_API_KEY;

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add the Authorization header if the API key is available
if (apiKey && apiKey !== 'your_hf_api_key_here') {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
}

// ADDED: Global error handling interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // Retry logic for network errors or 5xx server errors
    if (response && response.status >= 500 || error.code === 'ECONNABORTED' || !response) {
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
      
      // Enhanced logging with more context
      const errorContext = {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        timestamp: new Date().toISOString(),
      };
      
      console.error('API Error Response:', errorContext);

      if (status === 401) {
        message = 'Token has expired or you are not authorized. Please log in again.';
        title = 'Unauthorized';
        // Here you might want to trigger a logout process
        // For example: auth.logout();
      } else if (status === 404) {
        // Enhanced 404 handling
        const endpoint = error.config?.url || 'unknown endpoint';
        message = `The requested resource was not found. This might be a temporary issue or the endpoint may have changed.`;
        title = 'Resource Not Found';
        
        // Track API 404 error
        error404Monitor.trackAPI404(endpoint, error.config?.method?.toUpperCase() || 'UNKNOWN', {
          baseURL: error.config?.baseURL,
          params: error.config?.params,
          data: error.config?.data,
        });
        
        // Log specific 404 details for debugging
        console.error('404 API Error Details:', {
          endpoint,
          method: error.config?.method?.toUpperCase(),
          fullUrl: error.config?.baseURL + endpoint,
          params: error.config?.params,
          data: error.config?.data,
        });
        
        // Don't show toast for 404s in some cases (like optional data fetching)
        const suppressToast = error.config?.headers?.['x-suppress-404-toast'] === 'true';
        if (suppressToast) {
          return Promise.reject(error);
        }
      } else if (status >= 500) {
        message = 'The server encountered an internal error. Please try again later.';
        title = 'Server Error';
      } else if (status === 400) {
        // Enhanced 400 handling for bad requests
        if (data && data.message) {
          message = `Bad Request: ${data.message}`;
        } else {
          message = 'The request was invalid. Please check your input and try again.';
        }
        title = 'Invalid Request';
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
