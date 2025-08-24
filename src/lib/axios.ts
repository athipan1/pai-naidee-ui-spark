import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
  // CORRECT: Use VITE_API_BASE_URL which is defined in .env files
  // NOTE: In development, this will be 'http://localhost:5000/api' via vite proxy.
  // In production, this should be the full URL of the deployed backend.
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ADDED: Global error handling interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }

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
