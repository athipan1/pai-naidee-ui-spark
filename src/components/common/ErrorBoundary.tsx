import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call the error callback if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // In a real app, you might want to log this to an error reporting service
    // this.logErrorToService(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined 
    });
  };

  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    // Create error report
    const errorReport = {
      id: errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In a real app, send this to your error reporting service
    console.log('Error Report:', errorReport);
    
    // For now, just copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error details copied to clipboard');
      })
      .catch(() => {
        alert('Failed to copy error details');
      });
  };

  private goHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId } = this.state;
      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl text-destructive">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-base">
                We're sorry for the inconvenience. An unexpected error occurred while loading this page.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error ID for support */}
              {errorId && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Error ID: <code className="bg-muted px-2 py-1 rounded text-xs">{errorId}</code>
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.goHome}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>

                {isDevelopment && (
                  <Button 
                    variant="outline"
                    onClick={this.handleReportError}
                    className="flex items-center gap-2"
                  >
                    <Bug className="w-4 h-4" />
                    Copy Error Details
                  </Button>
                )}
              </div>

              {/* Development error details */}
              {isDevelopment && this.props.showDetails && error && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2 text-destructive">Error Details (Development Only)</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Message:</strong>
                      <pre className="mt-1 p-2 bg-background rounded border text-xs overflow-auto">
                        {error.message}
                      </pre>
                    </div>
                    
                    {error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 p-2 bg-background rounded border text-xs overflow-auto max-h-32">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 p-2 bg-background rounded border text-xs overflow-auto max-h-32">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Help text */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  If this problem persists, please contact our support team with the error ID above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
    
    // In a real app, report to error service
    // errorReportingService.report(error, errorInfo);
  };

  return { handleError };
};

// Simple error fallback component
export const ErrorFallback = ({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void; 
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
    <p className="text-muted-foreground mb-4">{error.message}</p>
    <Button onClick={resetError}>Try again</Button>
  </div>
);

export default ErrorBoundary;