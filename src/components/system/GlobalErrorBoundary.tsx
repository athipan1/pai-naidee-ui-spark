import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

/**
 * Global Error Boundary for system-level error handling
 * Provides consistent error reporting and recovery options
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId } = this.state;
    
    // Log error using our logger abstraction
    logger.error('Global error boundary caught an error:', {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRetry = () => {
    logger.info('User attempting to retry after error');
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined 
    });
  };

  private goHome = () => {
    logger.info('User navigating home after error');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="w-full max-w-md mx-auto text-center space-y-6">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We&apos;re sorry for the inconvenience. Please try refreshing the page.
              </p>
            </div>

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
              <button 
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button 
                onClick={this.goHome}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Development error details */}
            {isDevelopment && error && (
              <div className="mt-6 p-4 bg-muted rounded-lg text-left">
                <h3 className="font-semibold mb-2 text-destructive text-sm">Error Details (Development Only)</h3>
                <pre className="text-xs text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </div>
            )}

            {/* Help text */}
            <div className="text-sm text-muted-foreground">
              <p>
                If this problem persists, please contact support with the error ID above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}