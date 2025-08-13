// Test setup for Vitest
import { vi } from 'vitest';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';

// Global test utilities
global.mockConsole = () => {
  const originalConsole = global.console;
  const mockConsole = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    log: vi.fn()
  };
  
  global.console = mockConsole as typeof console;
  
  return {
    restore: () => {
      global.console = originalConsole;
    },
    mock: mockConsole
  };
};

// Mock localStorage if needed
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
}