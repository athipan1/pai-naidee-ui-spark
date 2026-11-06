// Tests for Supabase connectivity verification

import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { 
  verifySupabaseConnection, 
  testTableAccess, 
  checkSupabaseConfiguration,
  getSupabaseFullStatus,
  generateSupabaseReport
} from '@/services/supabase-connectivity.service';

vi.mock('@/services/supabase.service', () => ({
  getSupabaseClient: () => ({
    auth: { getSession: async () => ({ data: { session: null }, error: null }) },
    from: () => ({
      select: () => ({ limit: async () => ({ data: [{ id: 'fixture' }], error: null, count: 1 }) }),
    }),
  }),
}));

beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://fixture.example.test');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'local-test-fixture');
});
afterEach(() => vi.unstubAllEnvs());

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
    expect(result.isConnected).toBe(true);
  });

  it('should test table access for places table', async () => {
    const result = await testTableAccess('places', 3);
    
    expect(result).toHaveProperty('tableName', 'places');
    expect(result).toHaveProperty('isAccessible');
    expect(result.isAccessible).toBe(true);
    expect(result.recordCount).toBe(1);
    expect(result.sampleData).toEqual([{ id: 'fixture' }]);
  });

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

  });
});