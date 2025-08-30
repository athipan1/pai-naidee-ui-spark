import { describe, it, expect } from 'vitest';
import {
  getServiceStatus,
  startBackendProcess,
  stopBackendProcess,
  restartBackendProcess,
  getRunningProcesses,
  getSystemLogs,
  getSystemMetrics,
  triggerMaintenanceTask,
  getApplicationHealth,
  exportLogs,
} from '../shared/utils/dashboardAPI';

describe('Dashboard API Invalidation', () => {
  it('should reject getServiceStatus as endpoint is invalid', async () => {
    await expect(getServiceStatus()).rejects.toThrow('Endpoint /dashboard/services/status not found.');
  });

  it('should reject startBackendProcess as endpoint is invalid', async () => {
    await expect(startBackendProcess('test')).rejects.toThrow('Endpoint /dashboard/processes/test/start not found.');
  });

  it('should reject stopBackendProcess as endpoint is invalid', async () => {
    await expect(stopBackendProcess('test')).rejects.toThrow('Endpoint /dashboard/processes/test/stop not found.');
  });

  it('should reject restartBackendProcess as endpoint is invalid', async () => {
    await expect(restartBackendProcess('test')).rejects.toThrow('Endpoint /dashboard/processes/test/restart not found.');
  });

  it('should reject getRunningProcesses as endpoint is invalid', async () => {
    await expect(getRunningProcesses()).rejects.toThrow('Endpoint /dashboard/processes not found.');
  });

  it('should reject getSystemLogs as endpoint is invalid', async () => {
    await expect(getSystemLogs()).rejects.toThrow('Endpoint /dashboard/logs not found.');
  });

  it('should reject getSystemMetrics as endpoint is invalid', async () => {
    await expect(getSystemMetrics()).rejects.toThrow('Endpoint /dashboard/metrics not found.');
  });

  it('should reject triggerMaintenanceTask as endpoint is invalid', async () => {
    await expect(triggerMaintenanceTask('test')).rejects.toThrow('Endpoint /dashboard/maintenance not found.');
  });

  it('should reject getApplicationHealth as endpoint is invalid', async () => {
    await expect(getApplicationHealth()).rejects.toThrow('Endpoint /dashboard/health not found.');
  });

  it('should reject exportLogs as endpoint is invalid', async () => {
    await expect(exportLogs()).rejects.toThrow('Endpoint /dashboard/logs/export not found.');
  });
});