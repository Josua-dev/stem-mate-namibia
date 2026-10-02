import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkipLink } from './components/SkipLink';
import { RouteFocusManager } from './components/RouteFocusManager';

// Lazy load pages for performance
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(mod => ({ default: mod.Dashboard })));
const Activities = React.lazy(() => import('./pages/Activities').then(mod => ({ default: mod.Activities })));
const Plans = React.lazy(() => import('./pages/Plans').then(mod => ({ default: mod.Plans })));
const SyncQueue = React.lazy(() => import('./pages/SyncQueue').then(mod => ({ default: mod.SyncQueue })));
const Kits = React.lazy(() => import('./pages/Kits').then(mod => ({ default: mod.Kits })));
const Settings = React.lazy(() => import('./pages/Settings').then(mod => ({ default: mod.Settings })));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600" aria-hidden="true"></div>
    <span className="sr-only">Loading page...</span>
  </div>
);

const App: React.FC = () => {
  return (
    <ConnectionProvider>
      <SettingsProvider>
        <div className="min-h-screen bg-gray-50">
          <SkipLink />
          <RouteFocusManager />
          <AppShell>
            <main id="main-content" className="flex-1" tabIndex={-1}>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/activities" element={<Activities />} />
                    <Route path="/plans" element={<Plans />} />
                    <Route path="/sync" element={<SyncQueue />} />
                    <Route path="/kits" element={<Kits />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
          </AppShell>
        </div>
      </SettingsProvider>
    </ConnectionProvider>
  );
};

export default App;