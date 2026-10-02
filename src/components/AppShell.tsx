import React from 'react';
import { useLocation } from 'react-router-dom';
import { useConnection } from '../contexts/ConnectionContext';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isOnline } = useConnection();
  const location = useLocation();

  // Sidebar starts open on desktop, closed on small screens, and closes on
  // navigation so a phone is not left with a cramped content column.
  const [sidebarOpen, setSidebarOpen] = React.useState(
    () => window.matchMedia('(min-width: 768px)').matches
  );

  React.useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            aria-label={sidebarOpen ? 'Hide navigation menu' : 'Show navigation menu'}
            className="flex items-center justify-center w-11 h-11 mr-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span aria-hidden="true">{sidebarOpen ? '✕' : '☰'}</span>
          </button>
          <p className="font-bold text-gray-900">STEMMate Namibia</p>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
            isOnline
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
          aria-live="polite"
        >
          <span aria-hidden="true">{isOnline ? '🟢' : '🔴'}</span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </header>

      {/* Sidebar + main content */}
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} />
        {children}
      </div>

      {/* Footer with version label */}
      <footer className="border-t border-gray-200 py-4 text-center">
        <p className="text-sm text-gray-600">
          STEMMate Namibia <span className="font-medium">v1.0.0</span> — offline-first planning for Namibian STEM education
        </p>
      </footer>
    </div>
  );
};
