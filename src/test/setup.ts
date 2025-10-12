// Test setup for Vitest
import { vi, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);


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

// Mock localStorage since we are in a JSDOM environment
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Polyfill for PointerEvent
if (!global.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type, params) {
      super(type, params);
    }
  }
  global.PointerEvent = PointerEvent as any;
}

// JSDOM doesn't implement hasPointerCapture
if (global.Element && !global.Element.prototype.hasPointerCapture) {
  global.Element.prototype.hasPointerCapture = function(pointerId) {
    // A basic mock. You might need to expand this if your components
    // rely on more complex pointer capture behavior.
    return false;
  };
}

// JSDOM doesn't implement scrollIntoView
if (global.window.HTMLElement.prototype.scrollIntoView === undefined) {
  global.window.HTMLElement.prototype.scrollIntoView = function() {};
}