import React from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Catches rendering and lazy-load errors anywhere below it and shows
 * recovery guidance instead of a blank screen. Class component is required —
 * function components cannot be error boundaries.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, message: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4 sm:p-6 lg:p-8" role="alert">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-2">
              An unexpected error occurred while showing this page.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Your saved activities, plans and requests are safe on this device.
              Try again first. If the problem continues, refresh the page.
            </p>
            <button
              onClick={this.handleReset}
              className="rounded-md bg-blue-700 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
