import { Attraction, AttractionDetail } from '@/shared/types/attraction';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json'
};

// Helper to extract a meaningful error message from an API error
const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

const getAttractions = async (): Promise<Attraction[]> => {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/getAttractions`, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { attractions } = await response.json();
    return attractions;
  } catch (error) {
    console.error('Error fetching attractions:', error);
    throw new Error(`Failed to fetch attractions. ${getApiErrorMessage(error)}`);
  }
};

const addAttraction = async (attraction: Omit<Attraction, 'id' | 'created_at'>): Promise<Attraction> => {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/addAttraction`, {
      method: 'POST',
      headers,
      body: JSON.stringify(attraction),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { attraction: newAttraction } = await response.json();
    return newAttraction;
  } catch (error) {
    console.error('Error adding attraction:', error);
    throw new Error(`Failed to add attraction. ${getApiErrorMessage(error)}`);
  }
};

const updateAttraction = async (id: string, updates: Partial<Omit<Attraction, 'id' | 'created_at'>>): Promise<Attraction> => {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/updateAttraction`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, ...updates }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { attraction: updatedAttraction } = await response.json();
      return updatedAttraction;
    } catch (error) {
      console.error('Error updating attraction:', error);
      throw new Error(`Failed to update attraction. ${getApiErrorMessage(error)}`);
    }
  };

  const deleteAttraction = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/deleteAttraction`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting attraction:', error);
      throw new Error(`Failed to delete attraction. ${getApiErrorMessage(error)}`);
    }
  };

  const getAttractionDetail = async (id: string): Promise<AttractionDetail> => {
    // This function can be implemented by filtering the result of getAttractions
    // or by creating a new edge function getAttractionById
    console.log("Fetching all attractions to find detail for id:", id);
    try {
        const attractions = await getAttractions();
        const attraction = attractions.find(attr => attr.id === id);
        if (!attraction) {
            throw new Error(`Attraction with id ${id} not found`);
        }
        // The AttractionDetail type might be more complex, this is a simplification
        return attraction as AttractionDetail;
    } catch (error) {
      console.error(`Error fetching attraction detail for id ${id}:`, error);
      throw new Error(`Failed to fetch attraction details. ${getApiErrorMessage(error)}`);
    }
  };

export const attractionService = {
  getAttractions,
  addAttraction,
  updateAttraction,
  deleteAttraction,
  getAttractionDetail
};