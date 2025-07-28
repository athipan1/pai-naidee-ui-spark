import { notificationService } from './notificationService';

export interface NetworkStatus {
  isOnline: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

class NetworkStatusService {
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Listen for visibility change to check connection when tab becomes visible
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Periodic connection check
    this.startPeriodicCheck();
  }

  private handleOnline() {
    if (!this.isOnline) {
      this.isOnline = true;
      this.reconnectAttempts = 0;
      this.clearReconnectInterval();
      
      notificationService.showNetworkStatus(true);
      this.notifyListeners();
    }
  }

  private handleOffline() {
    if (this.isOnline) {
      this.isOnline = false;
      notificationService.showNetworkStatus(false);
      this.notifyListeners();
      this.startReconnectAttempts();
    }
  }

  private handleVisibilityChange() {
    if (!document.hidden && !this.isOnline) {
      this.checkConnection();
    }
  }

  private async checkConnection(): Promise<boolean> {
    try {
      // Try to fetch a small resource to check actual connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      const isOnline = response.ok;
      
      if (isOnline !== this.isOnline) {
        if (isOnline) {
          this.handleOnline();
        } else {
          this.handleOffline();
        }
      }
      
      return isOnline;
    } catch {
      if (this.isOnline) {
        this.handleOffline();
      }
      return false;
    }
  }

  private startReconnectAttempts() {
    if (this.reconnectInterval) return;

    this.reconnectInterval = setInterval(async () => {
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts > this.maxReconnectAttempts) {
        this.clearReconnectInterval();
        notificationService.show('error', 'Unable to reconnect', {
          description: 'Please check your internet connection and refresh the page',
          duration: 10000,
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload()
          }
        });
        return;
      }

      const isConnected = await this.checkConnection();
      
      if (isConnected) {
        this.clearReconnectInterval();
      } else {
        notificationService.show('warning', `Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`, {
          duration: 3000
        });
      }
    }, 3000 + (this.reconnectAttempts * 2000)); // Exponential backoff
  }

  private clearReconnectInterval() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  private startPeriodicCheck() {
    // Check connection every 30 seconds when online
    setInterval(() => {
      if (this.isOnline) {
        this.checkConnection();
      }
    }, 30000);
  }

  private notifyListeners() {
    const status = this.getNetworkStatus();
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Get current network status
   */
  getNetworkStatus(): NetworkStatus {
    const connection = (navigator as unknown as {
      connection?: {
        type?: string;
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
      };
      mozConnection?: {
        type?: string;
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
      };
      webkitConnection?: {
        type?: string;
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
      };
    }).connection || (navigator as unknown as { mozConnection?: unknown }).mozConnection || (navigator as unknown as { webkitConnection?: unknown }).webkitConnection;
    
    return {
      isOnline: this.isOnline,
      connectionType: connection?.type,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt
    };
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Test connection quality
   */
  async testConnectionQuality(): Promise<{
    latency: number;
    bandwidth: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  }> {
    const start = performance.now();
    
    try {
      await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const latency = performance.now() - start;
      
      // Simple bandwidth estimation (this is very rough)
      const testStart = performance.now();
      const response = await fetch('/favicon.ico', { cache: 'no-cache' });
      const testEnd = performance.now();
      const size = parseInt(response.headers.get('content-length') || '1000');
      const bandwidth = (size * 8) / ((testEnd - testStart) / 1000) / 1024; // Kbps
      
      let quality: 'poor' | 'fair' | 'good' | 'excellent';
      if (latency < 100 && bandwidth > 1000) {
        quality = 'excellent';
      } else if (latency < 300 && bandwidth > 500) {
        quality = 'good';
      } else if (latency < 1000 && bandwidth > 100) {
        quality = 'fair';
      } else {
        quality = 'poor';
      }
      
      return { latency, bandwidth, quality };
    } catch {
      return { latency: -1, bandwidth: -1, quality: 'poor' };
    }
  }

  /**
   * Show network quality notification
   */
  async showNetworkQuality() {
    const quality = await this.testConnectionQuality();
    
    notificationService.show('info', `Connection Quality: ${quality.quality}`, {
      description: `Latency: ${quality.latency.toFixed(0)}ms, Bandwidth: ${quality.bandwidth.toFixed(0)} Kbps`,
      duration: 5000
    });
  }

  /**
   * Destroy the service
   */
  destroy() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    this.clearReconnectInterval();
    this.listeners.clear();
  }
}

export const networkStatusService = new NetworkStatusService();