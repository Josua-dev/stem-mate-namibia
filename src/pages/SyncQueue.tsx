import React, { useState, useEffect } from 'react';
import { useConnection } from '../contexts/ConnectionContext';
import { getSyncQueue, updateSyncStatus, clearSyncedItems } from '../services/storageService';
import type { SyncQueueItem } from '../services/storageService';

export const SyncQueue: React.FC = () => {
  const { isOnline } = useConnection();
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string>('');
  const [summary, setSummary] = useState<string>('');

  // Load queue on mount and when online status changes
  useEffect(() => {
    setQueue(getSyncQueue());
  }, [isOnline]);

  const handleSync = async () => {
    if (!isOnline) {
      setError('Cannot sync while offline');
      return;
    }

    // Read from storage, not state: the mount-time auto-sync effect runs
    // before the queue state is populated, so state would be stale-empty.
    const pendingItems = getSyncQueue().filter(item => item.status === 'pending');
    if (pendingItems.length === 0) {
      setError('');
      return;
    }

    setSyncing(true);
    setError('');
    setSummary('');

    // Simulated sync process (no backend): each item resolves in ~1s, with a
    // small failure rate so the failed state and retry path stay demonstrable.
    let synced = 0;
    let failed = 0;
    for (const item of pendingItems) {
      try {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.1) {
              resolve(true);
            } else {
              reject(new Error('Network error'));
            }
          }, 1000);
        });

        updateSyncStatus(item.id, 'synced');
        synced++;
      } catch {
        updateSyncStatus(item.id, 'failed');
        failed++;
      }
    }

    // Synced items leave the queue once sent; failed items stay for retry.
    // Refresh from storage so the page reflects what remains.
    clearSyncedItems();
    setQueue(getSyncQueue());
    setSyncing(false);

    if (failed === 0) {
      setSummary(`✅ ${synced} ${synced === 1 ? 'plan' : 'plans'} synced successfully`);
    } else {
      setSummary(`⚠ ${synced} synced, ${failed} failed. Use Retry on the failed items below.`);
    }
  };

  // Auto-sync when coming online (declared after handleSync so the callback
  // never reads it during initialization)
  useEffect(() => {
    if (isOnline) {
      handleSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

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

  // Count by status
  const pendingCount = queue.filter(item => item.status === 'pending').length;
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
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-card p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-600">{failedCount}</p>
        </div>
      </div>

      {/* Sync result summary */}
      {summary && (
        <div
          className={`rounded-lg p-4 mb-4 ${failedCount > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}
          role="status"
        >
          <p className={failedCount > 0 ? 'text-yellow-800' : 'text-green-800'}>{summary}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4" role="alert">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Sync button */}
      <div className="mb-6">
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
                  <p className="text-xs text-gray-600">
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
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};