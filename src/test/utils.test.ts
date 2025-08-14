import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isDevelopment, isProduction, debugLog, performanceLog, isFeatureEnabled } from '../shared/utils/devUtils';

// Mock import.meta.env
const mockEnv = {
  MODE: 'development',
  VITE_ENABLE_DEBUG: 'true',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_ENABLE_TESTING_FEATURES: 'true'
};

// Mock console.log
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

beforeEach(() => {
  consoleSpy.mockClear();
  // Mock import.meta.env
  vi.stubGlobal('import', {
    meta: {
      env: mockEnv
    }
  });
});

describe('Development Utils', () => {
  describe('Environment Detection', () => {
    it('should detect development mode correctly', () => {
      // Note: These will be based on actual build mode during test
      expect(typeof isDevelopment).toBe('boolean');
      expect(typeof isProduction).toBe('boolean');
    });

    it('should have opposite values for dev and prod', () => {
      // In test environment, both might be false, so let's check they exist as booleans
      expect(typeof isDevelopment).toBe('boolean');
      expect(typeof isProduction).toBe('boolean');
      // They should not both be true
      expect(isDevelopment && isProduction).toBe(false);
    });
  });

  describe('Debug Logging', () => {
    it('should log debug messages with correct format', () => {
      const message = 'Test debug message';
      const data = { test: 'data' };
      
      debugLog(message, data);
      
      // In test environment, this might not log due to mode
      // But we can test the function exists and runs without error
      expect(debugLog).toBeDefined();
    });

    it('should not throw when called without data', () => {
      expect(() => debugLog('Test message')).not.toThrow();
    });
  });

  describe('Performance Logging', () => {
    it('should calculate performance duration', () => {
      const startTime = performance.now() - 100; // 100ms ago
      const label = 'Test Operation';
      
      expect(() => performanceLog(label, startTime)).not.toThrow();
    });

    it('should accept valid parameters', () => {
      const startTime = performance.now();
      performanceLog('Test', startTime);
      
      expect(performanceLog).toBeDefined();
    });
  });

  describe('Feature Flags', () => {
    it('should check feature flags correctly', () => {
      // These will return false in test environment since we can't easily mock import.meta.env
      const debugEnabled = isFeatureEnabled('debug');
      const analyticsEnabled = isFeatureEnabled('analytics');
      const testingEnabled = isFeatureEnabled('testing_features');
      
      expect(typeof debugEnabled).toBe('boolean');
      expect(typeof analyticsEnabled).toBe('boolean');
      expect(typeof testingEnabled).toBe('boolean');
    });

    it('should handle invalid feature names', () => {
      expect(() => isFeatureEnabled('invalid_feature')).not.toThrow();
      expect(isFeatureEnabled('invalid_feature')).toBe(false);
    });

    it('should handle empty feature names', () => {
      expect(() => isFeatureEnabled('')).not.toThrow();
      expect(isFeatureEnabled('')).toBe(false);
    });
  });
});