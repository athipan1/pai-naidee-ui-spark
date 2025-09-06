// 404 Error monitoring and tracking utility
export interface Error404Event {
  type: '404_route' | '404_api' | '404_asset';
  path: string;
  referrer?: string;
  userAgent?: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Error404Monitor {
  private events: Error404Event[] = [];
  private maxEvents = 100; // Keep last 100 events in memory

  /**
   * Track a 404 error event
   */
  track(event: Omit<Error404Event, 'timestamp'>): void {
    const fullEvent: Error404Event = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Add to local storage
    this.events.push(fullEvent);
    
    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('404 Error tracked:', fullEvent);
    }

    // Send to analytics if available
    this.sendToAnalytics(fullEvent);

    // Store in localStorage for debugging
    this.persistToStorage();
  }

  /**
   * Track route 404 errors
   */
  trackRoute404(path: string, context?: Record<string, any>): void {
    this.track({
      type: '404_route',
      path,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      context,
    });
  }

  /**
   * Track API 404 errors
   */
  trackAPI404(endpoint: string, method: string, context?: Record<string, any>): void {
    this.track({
      type: '404_api',
      path: endpoint,
      referrer: window.location.href,
      userAgent: navigator.userAgent,
      context: {
        method,
        ...context,
      },
    });
  }

  /**
   * Track asset 404 errors (images, etc.)
   */
  trackAsset404(src: string, context?: Record<string, any>): void {
    this.track({
      type: '404_asset',
      path: src,
      referrer: window.location.href,
      userAgent: navigator.userAgent,
      context,
    });
  }

  /**
   * Get all tracked events
   */
  getEvents(): Error404Event[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: Error404Event['type']): Error404Event[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Get error summary statistics
   */
  getSummary() {
    const total = this.events.length;
    const byType = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonPaths = this.events
      .reduce((acc, event) => {
        acc[event.path] = (acc[event.path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      total,
      byType,
      mostCommonPaths: Object.entries(mostCommonPaths)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
    };
  }

  /**
   * Clear all tracked events
   */
  clear(): void {
    this.events = [];
    localStorage.removeItem('error404Events');
  }

  /**
   * Send event to analytics service
   */
  private sendToAnalytics(event: Error404Event): void {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'error_404', {
        event_category: '404_Error',
        event_label: event.path,
        custom_map: {
          error_type: event.type,
          path: event.path,
          referrer: event.referrer,
        },
      });
    }

    // Custom analytics endpoint (if available)
    if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(error => {
        console.warn('Failed to send 404 event to analytics:', error);
      });
    }
  }

  /**
   * Persist events to localStorage
   */
  private persistToStorage(): void {
    try {
      localStorage.setItem('error404Events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to persist 404 events to localStorage:', error);
    }
  }

  /**
   * Load events from localStorage
   */
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('error404Events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load 404 events from localStorage:', error);
    }
  }
}

// Create singleton instance
const error404Monitor = new Error404Monitor();

// Load existing events on initialization
if (typeof window !== 'undefined') {
  error404Monitor.loadFromStorage();
}

// Export singleton instance and class for testing
export { Error404Monitor };
export default error404Monitor;

// Global error handler for assets
if (typeof window !== 'undefined') {
  // Track image 404s
  document.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      error404Monitor.trackAsset404(img.src, {
        alt: img.alt,
        parent: img.parentElement?.tagName,
      });
    }
  }, true);

  // Expose monitor to window for debugging
  (window as any).__error404Monitor = error404Monitor;
}