// Tests for Supabase connectivity verification

import { describe, it, expect } from 'vitest';
import { 
  verifySupabaseConnection, 
  testTableAccess, 
  checkSupabaseConfiguration,
  getSupabaseFullStatus,
  generateSupabaseReport
} from '@/services/supabase-connectivity.service';

describe('Supabase Connectivity Tests', () => {
  it('should export all required functions', async () => {
    expect(verifySupabaseConnection).toBeDefined();
    expect(testTableAccess).toBeDefined();
    expect(checkSupabaseConfiguration).toBeDefined();
    expect(getSupabaseFullStatus).toBeDefined();
    expect(generateSupabaseReport).toBeDefined();
    
    expect(typeof verifySupabaseConnection).toBe('function');
    expect(typeof testTableAccess).toBe('function');
    expect(typeof checkSupabaseConfiguration).toBe('function');
    expect(typeof getSupabaseFullStatus).toBe('function');
    expect(typeof generateSupabaseReport).toBe('function');
  });

  it('should check configuration status', () => {
    const config = checkSupabaseConfiguration();
    
    expect(config).toHaveProperty('hasUrl');
    expect(config).toHaveProperty('hasAnonKey');
    expect(config).toHaveProperty('urlPattern');
    
    expect(typeof config.hasUrl).toBe('boolean');
    expect(typeof config.hasAnonKey).toBe('boolean');
    expect(typeof config.urlPattern).toBe('string');
  });

  it('should attempt connection verification', async () => {
    const result = await verifySupabaseConnection();
    
    expect(result).toHaveProperty('isConnected');
    expect(typeof result.isConnected).toBe('boolean');
    
    // If connection fails, should have error message
    if (!result.isConnected) {
      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
    }
  }, 10000); // 10 second timeout for network operations

  it('should test table access for places table', async () => {
    const result = await testTableAccess('places', 3);
    
    expect(result).toHaveProperty('tableName', 'places');
    expect(result).toHaveProperty('isAccessible');
    expect(typeof result.isAccessible).toBe('boolean');
    
    if (result.isAccessible) {
      expect(result).toHaveProperty('recordCount');
      expect(result).toHaveProperty('sampleData');
      expect(Array.isArray(result.sampleData)).toBe(true);
    } else {
      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
    }
  }, 10000);

  it('should generate comprehensive status report', async () => {
    const status = await getSupabaseFullStatus();
    
    expect(status).toHaveProperty('connection');
    expect(status).toHaveProperty('tables');
    expect(status).toHaveProperty('configurationStatus');
    
    expect(Array.isArray(status.tables)).toBe(true);
    expect(status.tables.length).toBeGreaterThan(0);
    
    // Test report generation
    const report = generateSupabaseReport(status);
    expect(typeof report).toBe('string');
    expect(report.length).toBeGreaterThan(0);
    expect(report).toContain('SUPABASE CONNECTIVITY REPORT');
    
    // Log the report for manual inspection
    console.log('\n' + report);
  }, 15000);
});