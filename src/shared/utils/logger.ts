// Structured logger for search system

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Type for log data - can be primitives, objects, or arrays
export type LogData = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  component: string;
  message: string;
  data?: LogData;
  error?: Error;
}

/**
 * Structured logger with prefix support
 */
class SearchLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  constructor(private enableConsole: boolean = true) {}

  info(component: string, message: string, data?: LogData): void {
    this.log('info', component, message, data);
  }

  warn(component: string, message: string, data?: LogData): void {
    this.log('warn', component, message, data);
  }

  error(component: string, message: string, error?: Error, data?: LogData): void {
    this.log('error', component, message, data, error);
  }

  debug(component: string, message: string, data?: LogData): void {
    if (process.env.NODE_ENV === 'development' || process.env.VITE_ENABLE_DEBUG === 'true') {
      this.log('debug', component, message, data);
    }
  }

  private log(level: LogLevel, component: string, message: string, data?: LogData, error?: Error): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      component,
      message,
      data,
      error
    };

    // Add to internal log store
    this.logs.push(entry);
    
    // Maintain rolling window
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    if (this.enableConsole) {
      const prefix = `[search:${component}]`;
      const _timestamp = new Date(entry.timestamp).toISOString();
      
      switch (level) {
        case 'info':
          console.info(`${prefix} ${message}`, data ? data : '');
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`, data ? data : '');
          break;
        case 'error':
          console.error(`${prefix} ${message}`, error || data || '');
          break;
        case 'debug':
          console.debug(`${prefix} ${message}`, data ? data : '');
          break;
      }
    }
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(level?: LogLevel, component?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (component) {
      filteredLogs = filteredLogs.filter(log => log.component === component);
    }

    return filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Export logs for external analysis
   */
  exportLogs(): LogEntry[] {
    return [...this.logs];
  }
}

// Global logger instance
const logger = new SearchLogger();

// Export convenient logging functions
export const log = {
  info: (component: string, message: string, data?: LogData) => logger.info(component, message, data),
  warn: (component: string, message: string, data?: LogData) => logger.warn(component, message, data),
  error: (component: string, message: string, error?: Error, data?: LogData) => logger.error(component, message, error, data),
  debug: (component: string, message: string, data?: LogData) => logger.debug(component, message, data),
  
  // Component-specific loggers
  semantic: {
    info: (message: string, data?: LogData) => logger.info('semantic', message, data),
    warn: (message: string, data?: LogData) => logger.warn('semantic', message, data),
    error: (message: string, error?: Error, data?: LogData) => logger.error('semantic', message, error, data),
    debug: (message: string, data?: LogData) => logger.debug('semantic', message, data)
  },
  
  ranking: {
    info: (message: string, data?: LogData) => logger.info('ranking', message, data),
    warn: (message: string, data?: LogData) => logger.warn('ranking', message, data),
    error: (message: string, error?: Error, data?: LogData) => logger.error('ranking', message, error, data),
    debug: (message: string, data?: LogData) => logger.debug('ranking', message, data)
  },
  
  filters: {
    info: (message: string, data?: LogData) => logger.info('filters', message, data),
    warn: (message: string, data?: LogData) => logger.warn('filters', message, data),
    error: (message: string, error?: Error, data?: LogData) => logger.error('filters', message, error, data),
    debug: (message: string, data?: LogData) => logger.debug('filters', message, data)
  },
  
  metrics: {
    info: (message: string, data?: LogData) => logger.info('metrics', message, data),
    warn: (message: string, data?: LogData) => logger.warn('metrics', message, data),
    error: (message: string, error?: Error, data?: LogData) => logger.error('metrics', message, error, data),
    debug: (message: string, data?: LogData) => logger.debug('metrics', message, data)
  }
};

// Export logger utilities
export function getRecentLogs(level?: LogLevel, component?: string): LogEntry[] {
  return logger.getRecentLogs(level, component);
}

export function clearLogs(): void {
  logger.clear();
}

export function exportLogs(): LogEntry[] {
  return logger.exportLogs();
}