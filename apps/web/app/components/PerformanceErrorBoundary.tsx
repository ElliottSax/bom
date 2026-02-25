/**
 * Enhanced Error Boundary with Performance Monitoring
 * Catches React errors and provides graceful fallback UI
 */

'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class PerformanceErrorBoundary extends Component<Props, State> {
  private mountTime: number = 0;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  componentDidMount() {
    this.mountTime = performance.now();
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, componentName } = this.props;

    // Log error with performance context
    const errorTime = performance.now() - this.mountTime;
    console.error(
      `[ErrorBoundary${componentName ? ` - ${componentName}` : ''}] Error caught after ${errorTime.toFixed(2)}ms:`,
      error,
      errorInfo
    );

    this.setState({ errorInfo });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Log to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      try {
        // Dynamically import Sentry to avoid errors if not installed
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
              performance: {
                errorTime: `${errorTime.toFixed(2)}ms`,
                componentName: componentName || 'Unknown',
              },
            },
          });
        }).catch(() => {
          // Sentry not available, already logged to console
        });
      } catch (e) {
        // Sentry not available, already logged to console
      }
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, componentName } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[var(--color-bg-secondary)] rounded-xl p-6 border border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  Something went wrong
                </h3>
                {componentName && (
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    in {componentName}
                  </p>
                )}
              </div>
            </div>

            {error && process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-mono text-red-800 dark:text-red-200 mb-2">
                  {error.toString()}
                </p>
                {errorInfo && (
                  <details className="text-xs font-mono text-red-700 dark:text-red-300">
                    <summary className="cursor-pointer hover:underline">
                      Component Stack
                    </summary>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg text-sm font-medium hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <PerformanceErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </PerformanceErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
