// Supabase Status Component for displaying connectivity information
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  getSupabaseFullStatus, 
  generateSupabaseReport,
  type SupabaseStatus 
} from '@/services/supabase-connectivity.service';

const SupabaseStatusComponent: React.FC = () => {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabaseStatus = await getSupabaseFullStatus();
      setStatus(supabaseStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusIcon = (isConnected: boolean, hasError?: boolean) => {
    if (hasError) return <XCircle className="h-5 w-5 text-red-500" />;
    if (isConnected) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  const getTableStatusIcon = (isAccessible: boolean) => {
    return isAccessible 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2">Checking Supabase connectivity...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={checkStatus} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Backend Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Status */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.configurationStatus.hasUrl)}
                <span>URL: {status.configurationStatus.hasUrl ? 'Configured' : 'Not configured'}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.configurationStatus.hasAnonKey)}
                <span>API Key: {status.configurationStatus.hasAnonKey ? 'Configured' : 'Not configured'}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              URL Pattern: {status.configurationStatus.urlPattern}
            </div>
          </div>

          {/* Connection Status */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {getStatusIcon(status.connection.isConnected)}
              Connection Status
            </h3>
            {status.connection.isConnected ? (
              <div className="text-sm text-green-600">
                ✅ Successfully connected to Supabase
                {status.connection.details?.hasActiveSession && (
                  <div className="text-xs mt-1">
                    Active session: {status.connection.details.sessionUser}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-red-600">
                ❌ Connection failed: {status.connection.error}
              </div>
            )}
          </div>

          {/* Tables Status */}
          <div>
            <h3 className="font-semibold mb-2">Tables Access</h3>
            <div className="space-y-2">
              {status.tables.map((table) => (
                <div key={table.tableName} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getTableStatusIcon(table.isAccessible)}
                    <span className="font-medium">{table.tableName}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {table.isAccessible ? (
                      <span className="text-green-600">
                        {table.recordCount} records
                      </span>
                    ) : (
                      <span className="text-red-600">
                        Inaccessible
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Data */}
          {status.tables.some(table => table.isAccessible && table.sampleData && table.sampleData.length > 0) && (
            <div>
              <h3 className="font-semibold mb-2">Sample Data</h3>
              {status.tables
                .filter(table => table.isAccessible && table.sampleData && table.sampleData.length > 0)
                .map(table => (
                  <div key={table.tableName} className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      {table.tableName} table:
                    </h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(table.sampleData?.[0], null, 2)}
                    </pre>
                  </div>
                ))
              }
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={checkStatus} 
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button 
              onClick={() => setShowReport(!showReport)} 
              variant="outline"
              size="sm"
            >
              {showReport ? 'Hide' : 'Show'} Detailed Report
            </Button>
          </div>

          {/* Detailed Report */}
          {showReport && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Detailed Report</AlertTitle>
              <AlertDescription asChild>
                <pre className="mt-2 text-xs whitespace-pre-wrap">
                  {generateSupabaseReport(status)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseStatusComponent;