import type { ReactNode } from 'react';
import React, { useState } from 'react';

export const ErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  // We'll handle errors through React's error handling patterns
  // This component provides a structure for error boundaries

  if (hasError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h2>
        <p className="text-gray-700 mb-6">
          An unexpected error occurred. Please try again or refresh the page.
        </p>
        <button
          onClick={() => setHasError(false)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return children;
};