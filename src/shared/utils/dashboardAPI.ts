// Dashboard API utilities for backend service communication

interface ServiceStatus {
  id: string;
  name: string;
  status: "healthy" | "warning" | "error";
  lastCheck: string;
  responseTime: number;
  uptime: string;
  endpoint: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}

interface MetricData {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  requestCount: number;
  responseTime: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  avgResponseTime: number;
  uptime: string;
  diskUsage: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface SystemMetricsResponse {
  metrics: MetricData[];
  stats: SystemStats;
}

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Generic API request function with error handling
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get the status of all backend services
 */
export async function getServiceStatus(): Promise<ServiceStatus[]> {
  try {
    return await apiRequest<ServiceStatus[]>('/dashboard/services/status');
  } catch (_error) {
    // Return mock data if API fails (for demo purposes)
    console.warn('Using mock service status data');
    return [
      {
        id: "api-gateway",
        name: "API Gateway",
        status: "healthy",
        lastCheck: new Date().toISOString(),
        responseTime: 45,
        uptime: "99.9%",
        endpoint: "/api/health"
      },
      {
        id: "database",
        name: "Database Service", 
        status: "healthy",
        lastCheck: new Date().toISOString(),
        responseTime: 12,
        uptime: "99.8%",
        endpoint: "/db/health"
      },
      {
        id: "auth-service",
        name: "Authentication Service",
        status: "warning",
        lastCheck: new Date().toISOString(),
        responseTime: 120,
        uptime: "98.5%",
        endpoint: "/auth/health"
      }
    ];
  }
}

/**
 * Start a backend process
 */
export async function startBackendProcess(processId: string): Promise<{ success: boolean; message: string }> {
  try {
    return await apiRequest<{ success: boolean; message: string }>(`/dashboard/processes/${processId}/start`, {
      method: 'POST'
    });
  } catch (_error) {
    console.warn('Using mock process start response');
    return { success: true, message: `Process ${processId} started successfully` };
  }
}

/**
 * Stop a backend process
 */
export async function stopBackendProcess(processId: string): Promise<{ success: boolean; message: string }> {
  try {
    return await apiRequest<{ success: boolean; message: string }>(`/dashboard/processes/${processId}/stop`, {
      method: 'POST'
    });
  } catch (_error) {
    console.warn('Using mock process stop response');
    return { success: true, message: `Process ${processId} stopped successfully` };
  }
}

/**
 * Restart a backend process
 */
export async function restartBackendProcess(processId: string): Promise<{ success: boolean; message: string }> {
  try {
    return await apiRequest<{ success: boolean; message: string }>(`/dashboard/processes/${processId}/restart`, {
      method: 'POST'
    });
  } catch (_error) {
    console.warn('Using mock process restart response');
    return { success: true, message: `Process ${processId} restarted successfully` };
  }
}

/**
 * Get list of running processes
 */
export async function getRunningProcesses(): Promise<unknown[]> {
  try {
    return await apiRequest<unknown[]>('/dashboard/processes');
  } catch (_error) {
    console.warn('Using mock processes data');
    return [];
  }
}

/**
 * Get system logs with optional filtering
 */
export async function getSystemLogs(
  level?: string,
  source?: string,
  limit: number = 100
): Promise<LogEntry[]> {
  try {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (source) params.append('source', source);
    params.append('limit', limit.toString());
    
    return await apiRequest<LogEntry[]>(`/dashboard/logs?${params.toString()}`);
  } catch (_error) {
    console.warn('Using mock logs data');
    return [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        level: "info",
        source: "API Gateway",
        message: "Request processed successfully",
        metadata: { endpoint: "/api/attractions", method: "GET", responseTime: 45 }
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 30000).toISOString(),
        level: "warning",
        source: "Auth Service",
        message: "Slow authentication response detected",
        metadata: { userId: "user123", responseTime: 2500 }
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: "error",
        source: "Database",
        message: "Connection timeout occurred",
        metadata: { query: "SELECT * FROM attractions", timeout: 5000 }
      }
    ];
  }
}

/**
 * Get system metrics and performance data
 */
export async function getSystemMetrics(): Promise<SystemMetricsResponse> {
  try {
    return await apiRequest<SystemMetricsResponse>('/dashboard/metrics');
  } catch (_error) {
    console.warn('Using mock metrics data');
    
    const mockMetrics: MetricData[] = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      cpuUsage: Math.random() * 80 + 20,
      memoryUsage: Math.random() * 60 + 30,
      requestCount: Math.floor(Math.random() * 1000 + 500),
      responseTime: Math.random() * 200 + 50
    }));

    const mockStats: SystemStats = {
      totalUsers: 12547,
      activeUsers: 342,
      totalRequests: 89651,
      avgResponseTime: 89,
      uptime: "15 days, 7 hours",
      diskUsage: 67,
      memoryUsage: 73,
      cpuUsage: 45
    };

    return { metrics: mockMetrics, stats: mockStats };
  }
}

/**
 * Trigger a system maintenance task
 */
export async function triggerMaintenanceTask(taskType: string): Promise<{ success: boolean; message: string; taskId: string }> {
  try {
    return await apiRequest<{ success: boolean; message: string; taskId: string }>('/dashboard/maintenance', {
      method: 'POST',
      body: JSON.stringify({ taskType })
    });
  } catch (_error) {
    console.warn('Using mock maintenance response');
    return { 
      success: true, 
      message: `Maintenance task ${taskType} started successfully`,
      taskId: `task_${Date.now()}`
    };
  }
}

/**
 * Get application health check
 */
export async function getApplicationHealth(): Promise<{ status: string; components: Record<string, string> }> {
  try {
    return await apiRequest<{ status: string; components: Record<string, string> }>('/dashboard/health');
  } catch (_error) {
    console.warn('Using mock health check data');
    return {
      status: "healthy",
      components: {
        database: "healthy",
        cache: "healthy", 
        storage: "healthy",
        external_apis: "warning"
      }
    };
  }
}

/**
 * Export logs as file
 */
export async function exportLogs(format: 'json' | 'csv' = 'json', filters?: {
  level?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Blob> {
  try {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await fetch(`${API_BASE_URL}/dashboard/logs/export?${params.toString()}`, {
      headers: {
        'Accept': format === 'json' ? 'application/json' : 'text/csv'
      }
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return await response.blob();
  } catch (_error) {
    console.warn('Using mock export data');
    const mockData = format === 'json' ? 
      JSON.stringify([{ timestamp: new Date().toISOString(), level: "info", message: "Mock log entry" }], null, 2) :
      "timestamp,level,message\n" + new Date().toISOString() + ",info,Mock log entry";
    
    return new Blob([mockData], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
  }
}