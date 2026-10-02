// Unit tests for the sync queue storage logic (STE MMate Namibia v1.0.0)
import { describe, it, expect, beforeEach } from 'vitest';
import {
  addToSyncQueue,
  getSyncQueue,
  updateSyncStatus,
  clearSyncedItems,
  removeFromSyncQueue,
} from '../services/storageService';

beforeEach(() => {
  localStorage.clear();
});

describe('addToSyncQueue', () => {
  it('queues a plan as pending', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');

    const queue = getSyncQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].planId).toBe('plan-1');
    expect(queue[0].planTitle).toBe('Water Cycle Session');
    expect(queue[0].status).toBe('pending');
    expect(queue[0].retryCount).toBe(0);
  });

  it('does not queue the same plan twice', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');
    addToSyncQueue('plan-1', 'Water Cycle Session');

    expect(getSyncQueue()).toHaveLength(1);
  });

  it('queues different plans separately', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');
    addToSyncQueue('plan-2', 'Circuit Building');

    expect(getSyncQueue()).toHaveLength(2);
  });
});

describe('updateSyncStatus', () => {
  it('marks an item synced and stamps the last attempt', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');
    const item = getSyncQueue()[0];

    updateSyncStatus(item.id, 'synced');

    const updated = getSyncQueue()[0];
    expect(updated.status).toBe('synced');
    expect(updated.lastAttempt).toBeTruthy();
  });

  it('marks an item failed and counts the retry', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');
    const item = getSyncQueue()[0];

    updateSyncStatus(item.id, 'failed');

    const updated = getSyncQueue()[0];
    expect(updated.status).toBe('failed');
    expect(updated.retryCount).toBe(1);
    expect(updated.lastAttempt).toBeTruthy();
  });

  it('accumulates retry counts across failures', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');
    const item = getSyncQueue()[0];

    updateSyncStatus(item.id, 'failed');
    updateSyncStatus(item.id, 'failed');

    expect(getSyncQueue()[0].retryCount).toBe(2);
  });

  it('ignores unknown sync ids', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');

    updateSyncStatus('no-such-id', 'synced');

    expect(getSyncQueue()[0].status).toBe('pending');
  });
});

describe('clearSyncedItems', () => {
  it('removes only synced items, keeping pending and failed ones', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');
    addToSyncQueue('plan-2', 'Circuit Building');
    addToSyncQueue('plan-3', 'Solar Oven Experiment');

    const queue = getSyncQueue();
    updateSyncStatus(queue[0].id, 'synced');
    updateSyncStatus(queue[1].id, 'failed');

    clearSyncedItems();

    const remaining = getSyncQueue();
    expect(remaining).toHaveLength(2);
    expect(remaining.map(item => item.planId).sort()).toEqual(['plan-2', 'plan-3']);
    expect(remaining.every(item => item.status !== 'synced')).toBe(true);
  });

  it('leaves the queue unchanged when nothing is synced', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');

    clearSyncedItems();

    expect(getSyncQueue()).toHaveLength(1);
  });
});

describe('removeFromSyncQueue', () => {
  it('removes every queue entry for a plan', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');
    addToSyncQueue('plan-2', 'Circuit Building');

    removeFromSyncQueue('plan-1');

    const remaining = getSyncQueue();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].planId).toBe('plan-2');
  });

  it('leaves other plans untouched when the plan is unknown', () => {
    addToSyncQueue('plan-1', 'Water Cycle Session');

    removeFromSyncQueue('no-such-plan');

    expect(getSyncQueue()).toHaveLength(1);
  });
});

describe('getSyncQueue', () => {
  it('returns an empty list when nothing is queued', () => {
    expect(getSyncQueue()).toEqual([]);
  });
});
