import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testHuggingFaceConnection } from '@/lib/backendVerifier';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Define the structure for the result state
interface CheckResult {
  status: string;
  backend?: string;
  checked_at?: string;
  message?: string;
  error?: unknown;
}

const HealthCheckPage = () => {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async () => {
    setIsLoading(true);
    setResult(null);
    const testResult = await testHuggingFaceConnection();
    setIsLoading(false);

    if (testResult.success) {
      setResult({
        status: 'ok',
        backend: 'connected',
        checked_at: new Date().toISOString(),
        message: `Successfully connected and fetched ${ (testResult.data as any)?.attractions?.length || 0} attractions.`,
      });
    } else {
      setResult({
        status: 'error',
        backend: 'disconnected',
        checked_at: new Date().toISOString(),
        message: testResult.message,
        error: testResult.data,
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Header title="Backend Health Check" />
      <main className="mt-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Hugging Face Backend Connection Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Click the button below to run a live test against the Hugging Face backend API.
              This will verify the connection, authentication, and basic endpoint functionality.
            </p>
            <Button onClick={handleCheck} disabled={isLoading}>
              {isLoading ? <LoadingSpinner useSkeletonLoader={false} size="sm" /> : 'Run Connection Test'}
            </Button>

            {result && (
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <h3 className="font-bold text-lg mb-2">Test Result:</h3>
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
