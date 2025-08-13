/**
 * Production-ready logger abstraction with timestamp format
 * Reduces console noise in production while maintaining error/warn visibility
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Base logging function with timestamp format
 */
function base(level: LogLevel, ...args: unknown[]): void {
  // Only show debug logs in development or when explicitly enabled
  if (level === 'debug' && import.meta.env.PROD && !import.meta.env.VITE_ENABLE_DEBUG) {
    return;
  }

  const ts = new Date().toISOString();
  const tag = `[${ts}][${level.toUpperCase()}]`;
  
  // Keep using console to ensure error/warn are visible in production
  (console as Record<string, (...args: unknown[]) => void>)[level === 'debug' ? 'log' : level](tag, ...args);
}

export const logger = {
  debug: (...args: unknown[]) => base('debug', ...args),
  info: (...args: unknown[]) => base('info', ...args),
  warn: (...args: unknown[]) => base('warn', ...args),
  error: (...args: unknown[]) => base('error', ...args),
};

// Make logger available globally for debugging
// @ts-expect-error - Adding logger to window for debugging purposes
window.__APP_LOGGER = logger;