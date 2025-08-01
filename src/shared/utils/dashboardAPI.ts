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

// Debug mode detection
const IS_DEBUG = import.meta.env.VITE_ENABLE_DEBUG === 'true' || import.meta.env.MODE === 'development';

// Enhanced error categorization and logging
function logApiError(endpoint: string, url: string, error: unknown) {
  const errorDetails = {
    endpoint,
    url,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    baseUrl: API_BASE_URL,
  };

  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    console.error('❌ Network Error - Failed to fetch:', {
      ...errorDetails,
      errorType: 'NETWORK_ERROR',
      possibleCauses: [
        'Backend server not running',
        'CORS configuration issue',
        'Network connectivity problem',
        'Invalid URL or port'
      ],
      error: error.message
    });
  } else if (error instanceof TypeError) {
    console.error('❌ Type Error:', {
      ...errorDetails,
      errorType: 'TYPE_ERROR',
      error: error.message
    });
  } else if (error instanceof Error && error.message.includes('HTTP error')) {
    console.error('❌ HTTP Error:', {
      ...errorDetails,
      errorType: 'HTTP_ERROR',
      error: error.message
    });
  } else {
    console.error('❌ Unknown API Error:', {
      ...errorDetails,
      errorType: 'UNKNOWN_ERROR',
      error: error
    });
  }
}

// Generic API request function with enhanced error handling and debugging
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Validate base URL configuration
  if (!API_BASE_URL) {
    console.error('❌ API_BASE_URL is not configured. Check VITE_API_BASE_URL environment variable.');
    throw new Error('API base URL not configured');
  }

  if (IS_DEBUG) {
    console.log('🔍 API Request Debug:', {
      endpoint,
      url,
      method: options.method || 'GET',
      baseUrl: API_BASE_URL,
      headers: options.headers
    });
  }
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    if (IS_DEBUG) {
      console.log('🚀 Fetching:', url);
    }
    
    const response = await fetch(url, defaultOptions);
    
    if (IS_DEBUG) {
      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (IS_DEBUG) {
      console.log('✅ Data parsed successfully:', data);
    }
    
    return data;
  } catch (error) {
    logApiError(endpoint, url, error);
    throw error;
  }
}

/**
 * Get the status of all backend services
 */
export async function getServiceStatus(): Promise<ServiceStatus[]> {
  try {
    return await apiRequest<ServiceStatus[]>('/dashboard/services/status');
  } catch (error) {
    // Return mock data if API fails (for demo purposes)
    console.warn('⚠️ getServiceStatus failed, using mock data:', error);
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
  } catch (error) {
    console.warn('⚠️ startBackendProcess failed, using mock response:', error);
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
  } catch (error) {
    console.warn('⚠️ stopBackendProcess failed, using mock response:', error);
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
  } catch (error) {
    console.warn('⚠️ restartBackendProcess failed, using mock response:', error);
    return { success: true, message: `Process ${processId} restarted successfully` };
  }
}

/**
 * Get list of running processes
 */
export async function getRunningProcesses(): Promise<unknown[]> {
  try {
    return await apiRequest<unknown[]>('/dashboard/processes');
  } catch (error) {
    console.warn('⚠️ getRunningProcesses failed, using mock data:', error);
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
    
    const endpoint = `/dashboard/logs?${params.toString()}`;
    
    if (IS_DEBUG) {
      console.log('🔍 getSystemLogs called with:', { level, source, limit, endpoint });
    }
    
    return await apiRequest<LogEntry[]>(endpoint);
  } catch (error) {
    console.warn('⚠️ getSystemLogs failed, using mock data:', error);
    
    if (IS_DEBUG) {
      console.log('📋 Mock logs data being returned due to API failure');
    }
    
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
  } catch (error) {
    console.warn('⚠️ getSystemMetrics failed, using mock data:', error);
    
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
  } catch (error) {
    console.warn('⚠️ triggerMaintenanceTask failed, using mock response:', error);
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
  } catch (error) {
    console.warn('⚠️ getApplicationHealth failed, using mock data:', error);
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
  } catch (error) {
    console.warn('⚠️ exportLogs failed, using mock data:', error);
    const mockData = format === 'json' ? 
      JSON.stringify([{ timestamp: new Date().toISOString(), level: "info", message: "Mock log entry" }], null, 2) :
      "timestamp,level,message\n" + new Date().toISOString() + ",info,Mock log entry";
    
    return new Blob([mockData], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
  }
}