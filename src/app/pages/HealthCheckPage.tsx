import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkBackendHealth } from '@/lib/backendVerifier';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import API_BASE from '@/config/api';

// Define the structure for the result state
interface CheckResult {
  success: boolean;
  status: number | string;
  data: unknown;
  message: string;
  checked_at: string;
}

const HealthCheckPage = () => {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async () => {
    setIsLoading(true);
    setResult(null);
    const testResult = await checkBackendHealth();
    setIsLoading(false);
    setResult({ ...testResult, checked_at: new Date().toISOString() });
  };

  return (
    <div className="container mx-auto p-4">
      <Header title="Backend Health Check" />
      <main className="mt-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Backend Connection Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              This page performs a live health check on the backend API to diagnose connection issues.
            </p>
            <div className="mb-4 p-2 bg-muted rounded-md">
              <span className="text-xs font-semibold">API Endpoint:</span>
              <code className="ml-2 text-xs">{`${API_BASE}/health`}</code>
            </div>
            <Button onClick={handleCheck} disabled={isLoading}>
              {isLoading ? <LoadingSpinner useSkeletonLoader={false} size="sm" /> : 'Run Health Check'}
            </Button>

            {result && (
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <h3 className="font-bold text-lg mb-2">
                  Test Result:
                  <span className={`ml-2 text-lg ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </h3>
                <pre className="text-sm whitespace-pre-wrap break-all bg-background p-3 rounded-md">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HealthCheckPage;
