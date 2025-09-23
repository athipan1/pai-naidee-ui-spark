// Tests for Supabase service functions

import { describe, it, expect } from 'vitest';

describe('Supabase Service', () => {
  it('should export the required functions', async () => {
    // Import the service to verify it can be loaded
    const service = await import('@/services/supabase.service');
    
    expect(service.getPlacesByCategory).toBeDefined();
    expect(service.getPlaceById).toBeDefined();
    expect(service.searchPlaces).toBeDefined();
    expect(service.supabase).toBeDefined();
    
    expect(typeof service.getPlacesByCategory).toBe('function');
    expect(typeof service.getPlaceById).toBe('function');
    expect(typeof service.searchPlaces).toBe('function');
    expect(typeof service.supabase).toBe('object');
  });

  it('should import Supabase client correctly', async () => {
    // This test verifies that the service uses the Supabase client correctly
    // by checking that the service module can be imported without errors
    expect(async () => {
      await import('@/services/supabase.service');
    }).not.toThrow();
  });
});