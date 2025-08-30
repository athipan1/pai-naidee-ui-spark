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

function logAndReject(endpoint: string) {
    console.error("❌ API endpoint ไม่ถูกต้อง:", endpoint);
    return Promise.reject(new Error(`Endpoint ${endpoint} not found.`));
}

/**
 * Get the status of all backend services
 */
export async function getServiceStatus(): Promise<ServiceStatus[]> {
  return logAndReject('/dashboard/services/status');
}

/**
 * Start a backend process
 */
export async function startBackendProcess(processId: string): Promise<{ success: boolean; message: string }> {
  return logAndReject(`/dashboard/processes/${processId}/start`);
}

/**
 * Stop a backend process
 */
export async function stopBackendProcess(processId: string): Promise<{ success: boolean; message: string }> {
  return logAndReject(`/dashboard/processes/${processId}/stop`);
}

/**
 * Restart a backend process
 */
export async function restartBackendProcess(processId: string): Promise<{ success: boolean; message: string }> {
  return logAndReject(`/dashboard/processes/${processId}/restart`);
}

/**
 * Get list of running processes
 */
export async function getRunningProcesses(): Promise<unknown[]> {
    return logAndReject('/dashboard/processes');
}

/**
 * Get system logs with optional filtering
 */
export async function getSystemLogs(
  level?: string,
  source?: string,
  limit: number = 100
): Promise<LogEntry[]> {
  return logAndReject(`/dashboard/logs`);
}

/**
 * Get system metrics and performance data
 */
export async function getSystemMetrics(): Promise<SystemMetricsResponse> {
  return logAndReject('/dashboard/metrics');
}

/**
 * Trigger a system maintenance task
 */
export async function triggerMaintenanceTask(taskType: string): Promise<{ success: boolean; message: string; taskId: string }> {
  return logAndReject('/dashboard/maintenance');
}

/**
 * Get application health check
 */
export async function getApplicationHealth(): Promise<{ status: string; components: Record<string, string> }> {
  return logAndReject('/dashboard/health');
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
  return logAndReject('/dashboard/logs/export');
}