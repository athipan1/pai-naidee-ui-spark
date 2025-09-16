import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkBackendHealth, checkSearchEndpoint } from '@/lib/backendVerifier';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import API_BASE, { API_ENDPOINTS } from '@/config/api';

// Define the structure for the result state
interface CheckResult {
  success: boolean;
  status: number | string;
  data: unknown;
  message: string;
  checked_at: string;
}

const HealthCheckPage = () => {
  const [healthResult, setHealthResult] = useState<CheckResult | null>(null);
  const [searchResult, setSearchResult] = useState<CheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async () => {
    setIsLoading(true);
    setHealthResult(null);
    setSearchResult(null);

    const [health, search] = await Promise.all([
      checkBackendHealth(),
      checkSearchEndpoint(),
    ]);

    setIsLoading(false);
    setHealthResult({ ...health, checked_at: new Date().toISOString() });
    setSearchResult({ ...search, checked_at: new Date().toISOString() });
  };

  const ResultCard = ({ title, endpoint, result }: { title: string, endpoint: string, result: CheckResult | null }) => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-2 bg-muted rounded-md">
          <span className="text-xs font-semibold">API Endpoint:</span>
          <code className="ml-2 text-xs">{endpoint}</code>
        </div>
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
  );

  return (
    <div className="container mx-auto p-4">
      <Header title="Backend Health & API Check" />
      <main className="mt-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>API Connection Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              This page performs live checks on critical backend API endpoints to diagnose connection and functionality issues.
            </p>
            <Button onClick={handleCheck} disabled={isLoading}>
              {isLoading ? <LoadingSpinner useSkeletonLoader={false} size="sm" /> : 'Run All Checks'}
            </Button>
          </CardContent>
        </Card>

        {(isLoading || healthResult || searchResult) && (
          <div className="mt-4">
            {isLoading && !healthResult && <LoadingSpinner useSkeletonLoader={true} />}
            {healthResult && (
              <ResultCard
                title="Backend Health Check"
                endpoint={`${API_BASE}${API_ENDPOINTS.HEALTH}`}
                result={healthResult}
              />
            )}
            {searchResult && (
              <ResultCard
                title="API Search Endpoint Check"
                endpoint={`${API_BASE}${API_ENDPOINTS.SEARCH}?q=เชียงใหม่`}
                result={searchResult}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HealthCheckPage;
