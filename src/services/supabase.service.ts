/**
 * Supabase client configuration for PaiNaiDee app
 * Connects React app with Supabase backend (adapted for web environment)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { processLock } from '@/lib/processLock';

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

// Allow tests to run without configuration
const isTestEnvironment = process.env.NODE_ENV === 'test' || typeof process.env.VITEST !== 'undefined';

if (!supabaseUrl || !supabaseKey) {
  if (!isTestEnvironment) {
    throw new Error('Missing Supabase environment variables. Please check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY');
  }
  // Use dummy values for testing
  console.warn('⚠️ Supabase not configured - using test values');
}

// Create Supabase client with auth configuration
export const supabase = createClient(
  supabaseUrl || 'https://test.supabase.co', 
  supabaseKey || 'test-anon-key', 
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock
    }
  }
);

/**
 * Example function to get places data from Supabase
 * Fetches data from the 'places' table
 * 
 * @returns Promise with places data
 */
export async function getPlaces() {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching places:', error);
    throw new Error(`Failed to fetch places: ${error.message || 'Unknown error'}`);
  }
}

// Additional helper functions for the PaiNaiDee app

/**
 * Get places by category
 * @param category - Category to filter places by
 */
export async function getPlacesByCategory(category: string) {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('category', category);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching places by category:', error);
    throw new Error(`Failed to fetch places by category: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get place by ID
 * @param id - Place ID to fetch
 */
export async function getPlaceById(id: string) {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching place by ID:', error);
    throw new Error(`Failed to fetch place: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Search places by name or description
 * @param searchTerm - Term to search for
 */
export async function searchPlaces(searchTerm: string) {
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error searching places:', error);
    throw new Error(`Failed to search places: ${error.message || 'Unknown error'}`);
  }
}

export default supabase;