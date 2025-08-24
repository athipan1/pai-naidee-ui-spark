import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  const response = await apiClient.get<AttractionsResponse>('/api/attractions');
  return response.data;
};

// Function to fetch a single attraction by its ID
export const getAttractionById = async (id: string): Promise<Attraction> => {
  const response = await apiClient.get<Attraction>(`/api/attractions/${id}`);
  return response.data;
};

// Function to create a new attraction
export const createAttraction = async (attractionData: Omit<Attraction, 'id'>): Promise<Attraction> => {
  const response = await apiClient.post<Attraction>('/api/attractions', attractionData);
  return response.data;
};

export default apiClient;
