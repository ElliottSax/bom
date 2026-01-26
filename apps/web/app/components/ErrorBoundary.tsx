import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // TODO: Send to error reporting service (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-primary)]">
          <div className="max-w-md text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
              Something went wrong
            </h2>

            <p className="text-[var(--color-text-secondary)] mb-6">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-[var(--color-text-tertiary)] mb-2">
                  Error details (development only)
                </summary>
                <pre className="text-xs bg-[var(--color-bg-tertiary)] p-4 rounded-lg overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold rounded-xl hover:bg-[var(--color-border)] transition"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
