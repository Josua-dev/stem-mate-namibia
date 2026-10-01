import { useState, useEffect } from 'react';
import type { SyncQueueItem } from '../services/storageService';
import { getSyncQueue } from '../services/storageService';

export const useSyncQueue = () => {
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const loadQueue = () => {
      const items = getSyncQueue();
      setQueue(items);
      setPendingCount(items.filter(item => item.status === 'pending').length);
    };

    loadQueue();

    // Listen for storage changes
    const handleStorageChange = () => loadQueue();
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { queue, pendingCount };
};