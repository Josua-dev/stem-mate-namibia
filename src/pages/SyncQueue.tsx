import React, { useState, useEffect } from 'react';
import { useConnection } from '../contexts/ConnectionContext';
import { getSyncQueue, updateSyncStatus, removeFromSyncQueue, clearSyncedItems } from '../services/storageService';
import type { SyncQueueItem } from '../services/storageService';

export const SyncQueue: React.FC = () => {
  const { isOnline } = useConnection();
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string>('');

  // Load queue on mount and when online status changes
  useEffect(() => {
    setQueue(getSyncQueue());
  }, []);

  useEffect(() => {
    // Auto-sync when coming online
    if (isOnline) {
      handleSync();
    }
  }, [isOnline]);

  const handleSync = async () => {
    if (!isOnline) {
      setError('Cannot sync while offline');
      return;
    }

    const pendingItems = queue.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) {
      setError('');
      return;
    }

    setSyncing(true);
    setError('');

    // Simulate sync process
    for (const item of pendingItems) {
      try {
        // Simulate network request
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate 90% success rate for demo
            const success = Math.random() > 0.1;
            if (success) {
              resolve(true);
            } else {
              reject(new Error('Network error'));
            }
          }, 1000);
        });

        updateSyncStatus(item.id, 'synced');
        setQueue(prev => prev.map(qi =>
          qi.id === item.id
            ? { ...qi, status: 'synced', lastAttempt: new Date().toISOString() }
            : qi
        ));
      } catch (err) {
        updateSyncStatus(item.id, 'failed');
        setQueue(prev => prev.map(qi =>
          qi.id === item.id
            ? { ...qi, status: 'failed', retryCount: qi.retryCount + 1, lastAttempt: new Date().toISOString() }
            : qi
        ));
      }
    }

    setSyncing(false);
    setError('');
  };

  const handleRetry = (syncId: string) => {
    if (!isOnline) {
      setError('Cannot retry while offline');
      return;
    }

    updateSyncStatus(syncId, 'pending');
    setQueue(prev => prev.map(item =>
      item.id === syncId
        ? { ...item, status: 'pending' }
        : item
    ));
  };

  const handleClearSynced = () => {
    clearSyncedItems();
    setQueue(prev => prev.filter(item => item.status !== 'synced'));
  };

  const handleDelete = (id: string) => {
    removeFromSyncQueue(id);
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  // Count by status
  const pendingCount = queue.filter(item => item.status === 'pending').length;
  const syncedCount = queue.filter(item => item.status === 'synced').length;
  const failedCount = queue.filter(item => item.status === 'failed').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sync Queue</h1>
        <p className="text-gray-600">
          Plans pending sync will be sent when connected
        </p>
      </header>

      {/* Connection status */}
      <div className="mb-6" aria-live="polite">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
          isOnline ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span aria-hidden="true">{isOnline ? '🟢' : '🔴'}</span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        {!isOnline && (
          <p className="text-sm text-gray-500 mt-2">
            ⚠ Sync disabled while offline. Queued plans will sync automatically when connected.
          </p>
        )}
      </div>

      {/* Sync summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-card p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Synced</p>
          <p className="text-2xl font-bold text-green-600">{syncedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-600">{failedCount}</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4" role="alert">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Sync button */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={handleSync}
          disabled={!isOnline || syncing || pendingCount === 0}
          className={`
            rounded-md px-4 py-3 text-sm font-medium text-white min-h-[44px]
            ${isOnline && !syncing && pendingCount > 0
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
        {syncedCount > 0 && (
          <button
            onClick={handleClearSynced}
            className="rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
          >
            Clear Synced ({syncedCount})
          </button>
        )}
      </div>

      {/* Sync queue list */}
      {queue.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-card border border-gray-100">
          <p className="text-gray-500 text-lg mb-2">Sync queue is empty</p>
          <p className="text-gray-400 text-sm">
            {isOnline
              ? 'All plans are synced ✓'
              : 'Plans will appear here when offline'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {queue.map(item => (
            <li key={item.id} className="bg-white rounded-lg shadow-card border border-gray-100 p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{item.planTitle}</h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(item.createdAt).toLocaleString()}
                </p>
                {item.lastAttempt && (
                  <p className="text-xs text-gray-400">
                    Last attempt: {new Date(item.lastAttempt).toLocaleString()}
                    {item.retryCount > 0 && ` • Retries: ${item.retryCount}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`
                  text-xs font-medium px-2 py-1 rounded-full
                  ${item.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                  ${item.status === 'synced' ? 'bg-green-100 text-green-700' : ''}
                  ${item.status === 'failed' ? 'bg-red-100 text-red-700' : ''}
                `}>
                  {item.status === 'pending' && '⚠ Pending'}
                  {item.status === 'synced' && '✅ Synced'}
                  {item.status === 'failed' && '❌ Failed'}
                </span>
                <div className="flex gap-2">
                  {item.status === 'failed' && (
                    <button
                      onClick={() => handleRetry(item.id)}
                      disabled={!isOnline}
                      className="rounded-md bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium hover:bg-blue-200 min-h-[44px]"
                    >
                      Retry
                    </button>
                  )}
                  {(item.status === 'synced') && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-md bg-gray-100 text-gray-700 px-3 py-1 text-sm font-medium hover:bg-gray-200 min-h-[44px]"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};