import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle, Wifi } from 'lucide-react';
import { API_ENDPOINTS, API_CONFIG } from '@/config/api';
import { useApiHealth, useNetworkStatus } from '@/shared/hooks/useApiCall';
import { LoadingSpinner, ErrorState } from '@/components/common/LoadingStates';
import apiClient, { apiUtils } from '@/lib/axios';

interface EndpointTest {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  status: 'pending' | 'success' | 'error';
  responseTime?: number;
  error?: string;
  data?: any;
}

export const ApiTestingPage: React.FC = () => {
  const [tests, setTests] = useState<EndpointTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { isOnline } = useNetworkStatus();
  const { isHealthy, lastCheck, checkHealth } = useApiHealth();

  const endpoints: Omit<EndpointTest, 'status'>[] = [
    { name: 'Health Check', endpoint: API_ENDPOINTS.HEALTH, method: 'GET' },
    { name: 'Attractions', endpoint: API_ENDPOINTS.ATTRACTIONS, method: 'GET' },
    { name: 'Search', endpoint: `${API_ENDPOINTS.SEARCH}?q=temple&limit=5`, method: 'GET' },
    { name: 'AI Predict', endpoint: API_ENDPOINTS.AI_PREDICT, method: 'POST' },
    { name: 'Explore Videos', endpoint: `${API_ENDPOINTS.EXPLORE_VIDEOS}?page=1&limit=5`, method: 'GET' },
  ];

  useEffect(() => {
    setTests(endpoints.map(endpoint => ({ ...endpoint, status: 'pending' as const })));
  }, []);

  const testEndpoint = async (test: EndpointTest): Promise<EndpointTest> => {
    const startTime = Date.now();
    
    try {
      let response;
      if (test.method === 'GET') {
        response = await apiClient.get(test.endpoint);
      } else {
        // POST with sample data
        const sampleData = test.endpoint.includes('predict') 
          ? { input: 'test message' }
          : { test: true };
        response = await apiClient.post(test.endpoint, sampleData);
      }

      const responseTime = Date.now() - startTime;
      
      return {
        ...test,
        status: 'success',
        responseTime,
        data: response.data
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        ...test,
        status: 'error',
        responseTime,
        error: error.userMessage || error.message || 'Unknown error'
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < endpoints.length; i++) {
      const currentTest = endpoints[i];
      
      // Update to show current test is running
      setTests(prev => prev.map((test, index) => 
        index === i 
          ? { ...test, status: 'pending' as const }
          : test
      ));

      const result = await testEndpoint({ ...currentTest, status: 'pending' });
      
      setTests(prev => prev.map((test, index) => 
        index === i ? result : test
      ));

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: EndpointTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: EndpointTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="text-green-700 bg-green-100">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Not tested</Badge>;
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Testing Dashboard</h1>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning || !isOnline}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <LoadingSpinner size="sm" />
              Testing...
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Network Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700">Online</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">Offline</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">API Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isHealthy === null ? (
                <>
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span>Checking...</span>
                </>
              ) : isHealthy ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700">Healthy</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">Unhealthy</span>
                </>
              )}
            </div>
            {lastCheck && (
              <p className="text-xs text-muted-foreground mt-1">
                Last check: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Success:</span>
                <span className="text-green-600 font-medium">{successCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Errors:</span>
                <span className="text-red-600 font-medium">{errorCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Base URL:</strong>
              <p className="font-mono text-xs mt-1 p-2 bg-muted rounded">
                {API_CONFIG.BASE_URL}
              </p>
            </div>
            <div>
              <strong>Timeout:</strong>
              <p className="font-mono text-xs mt-1 p-2 bg-muted rounded">
                {API_CONFIG.TIMEOUT}ms
              </p>
            </div>
            <div>
              <strong>Retry Attempts:</strong>
              <p className="font-mono text-xs mt-1 p-2 bg-muted rounded">
                {API_CONFIG.RETRY_ATTEMPTS}
              </p>
            </div>
            <div>
              <strong>Cache Time:</strong>
              <p className="font-mono text-xs mt-1 p-2 bg-muted rounded">
                {API_CONFIG.CACHE_TIME / 1000}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    <p className="text-sm text-muted-foreground font-mono">
                      {test.method} {test.endpoint}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="space-y-1">
                    {getStatusBadge(test.status)}
                    {test.responseTime && (
                      <p className="text-xs text-muted-foreground">
                        {test.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Details */}
      {tests.some(t => t.error) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Error Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests
                .filter(t => t.error)
                .map((test, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                    <h5 className="font-medium text-red-800">{test.name}</h5>
                    <p className="text-sm text-red-600 mt-1">{test.error}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};