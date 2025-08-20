import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

/**
 * Enhanced ErrorBoundary component with better error handling and user experience
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    const { onError, enableErrorReporting = true } = this.props;
    
    if (!enableErrorReporting) return;

    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId,
      sessionId: this.props.sessionId
    };

    // Call custom error handler if provided
    if (onError) {
      onError(errorData);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // Send to error reporting service (e.g., Sentry, LogRocket, etc.)
    if (this.props.errorReportingService) {
      this.props.errorReportingService.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        },
        tags: {
          errorBoundary: true,
          errorId: this.state.errorId
        },
        extra: errorData
      });
    }
  };

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    });
  };

  handleGoHome = () => {
    const { onGoHome } = this.props;
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  handleReportBug = () => {
    const { onReportBug, bugReportUrl } = this.props;
    
    if (onReportBug) {
      onReportBug({
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        errorId: this.state.errorId
      });
    } else if (bugReportUrl) {
      const bugData = {
        errorId: this.state.errorId,
        message: this.state.error?.message,
        stack: this.state.error?.stack,
        timestamp: new Date().toISOString()
      };
      
      const url = `${bugReportUrl}?${new URLSearchParams(bugData).toString()}`;
      window.open(url, '_blank');
    }
  };

  render() {
    const { 
      hasError, 
      error, 
      errorInfo, 
      errorId, 
      retryCount 
    } = this.state;
    
    const { 
      children, 
      fallback, 
      showErrorDetails = process.env.NODE_ENV === 'development',
      maxRetries = 3,
      title = 'Something went wrong',
      message = 'An unexpected error occurred. Please try again.',
      showRetryButton = true,
      showHomeButton = true,
      showReportButton = true,
      className = ''
    } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo, this.handleRetry, this.handleReset);
      }

      const canRetry = retryCount < maxRetries;

      return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-50 px-4 ${className}`}>
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-red-500">
                <AlertTriangle className="h-full w-full" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <p className="text-center text-gray-600">
                {message}
              </p>
              
              {errorId && (
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Error ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{errorId}</code>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {showRetryButton && canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex items-center gap-2"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again ({maxRetries - retryCount} attempts left)
                  </Button>
                )}
                
                {showHomeButton && (
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                )}
                
                {showReportButton && (
                  <Button
                    onClick={this.handleReportBug}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Bug className="h-4 w-4" />
                    Report Bug
                  </Button>
                )}
              </div>

              {/* Error Details (Development Only) */}
              {showErrorDetails && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Error Details (Development)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-red-600">Error Message:</h4>
                      <pre className="mt-1 text-xs bg-red-50 border border-red-200 rounded p-3 overflow-auto">
                        {error.message}
                      </pre>
                    </div>
                    
                    {error.stack && (
                      <div>
                        <h4 className="text-sm font-medium text-red-600">Stack Trace:</h4>
                        <pre className="mt-1 text-xs bg-red-50 border border-red-200 rounded p-3 overflow-auto max-h-40">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <div>
                        <h4 className="text-sm font-medium text-red-600">Component Stack:</h4>
                        <pre className="mt-1 text-xs bg-red-50 border border-red-200 rounded p-3 overflow-auto max-h-40">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// PropTypes
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  onError: PropTypes.func,
  onGoHome: PropTypes.func,
  onReportBug: PropTypes.func,
  errorReportingService: PropTypes.object,
  bugReportUrl: PropTypes.string,
  userId: PropTypes.string,
  sessionId: PropTypes.string,
  enableErrorReporting: PropTypes.bool,
  showErrorDetails: PropTypes.bool,
  maxRetries: PropTypes.number,
  title: PropTypes.string,
  message: PropTypes.string,
  showRetryButton: PropTypes.bool,
  showHomeButton: PropTypes.bool,
  showReportButton: PropTypes.bool,
  className: PropTypes.string
};

/**
 * Higher-order component to wrap components with error boundary
 */
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundaryComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  
  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundaryComponent;
};

/**
 * Hook to manually trigger error boundary (for functional components)
 */
export const useErrorHandler = () => {
  return React.useCallback((error, errorInfo = {}) => {
    // Create a synthetic error that will be caught by error boundary
    const syntheticError = new Error(error.message || 'Manual error trigger');
    syntheticError.stack = error.stack || syntheticError.stack;
    
    // Throw the error to be caught by the nearest error boundary
    throw syntheticError;
  }, []);
};

export default ErrorBoundary;