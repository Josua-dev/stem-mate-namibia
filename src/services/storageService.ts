// STEMMate Namibia - Storage Service
// Handles localStorage and IndexedDB operations for offline-first functionality
// Version: v1.0.0

import type {
  Activity, SavedActivity, SessionPlan, PlanStep, KitRequest, SyncQueueItem, Settings, RecentActivity
} from '../types';

// Export types for use in other files
export type { Activity, SavedActivity, SessionPlan, PlanStep, KitRequest, SyncQueueItem, Settings, RecentActivity };

// Storage keys
const STORAGE_KEYS = {
  ACTIVITIES: 'stemmate_activities',
  SAVED_ACTIVITIES: 'stemmate_saved_activities',
  PLANS: 'stemmate_plans',
  KIT_REQUESTS: 'stemmate_kit_requests',
  SYNC_QUEUE: 'stemmate_sync_queue',
  SETTINGS: 'stemmate_settings',
  RECENT_ACTIVITY: 'stemmate_recent_activity',
  VERSION: 'stemmate_version'
};

// Current app version
const CURRENT_VERSION = 'v1.0.0';

// Sync status type
type SyncStatus = 'pending' | 'synced' | 'failed';

// Initialize storage with default data if needed
export function initializeStorage() {
  // Check if this is a fresh install or version upgrade
  const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

  if (storedVersion !== CURRENT_VERSION) {
    // Clear old data on version change (in production, you might want to migrate)
    if (storedVersion) {
      console.log(`Upgrading from version ${storedVersion} to ${CURRENT_VERSION}`);
      // In a real app, you'd migrate data here
    }

    // Set current version
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);

    // Initialize with demo data if no data exists
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      // Activities are imported from data file, not stored in localStorage
      // But we need to initialize other storage
      localStorage.setItem(STORAGE_KEYS.SAVED_ACTIVITIES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.KIT_REQUESTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(getDefaultSettings()));
      localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITY, JSON.stringify([]));
    }
  }
}

// Get default settings
function getDefaultSettings(): Settings {
  return {
    darkMode: false,
    fontSize: 'base',
    highContrast: false,
    connectionSimulation: 'auto'
  };
}

/* ACTIVITIES */
// Activities are imported statically, not stored in localStorage
export function getActivities(): Activity[] {
  // In a real app, you might fetch these from an API or bundle
  // For now, we import them from the data file
  // This is a placeholder - in actual implementation, you'd import from data/activities.ts
  return [];
}

export function saveActivity(_activity: Activity): void {
  // Activities are reference data, not user-generated
  // This function exists for API consistency
  console.warn('Activities are reference data and cannot be saved by users');
}

export function removeActivity(_id: string): void {
  // Activities are reference data
  console.warn('Activities are reference data and cannot be removed by users');
}

/* SAVED ACTIVITIES */
export function getSavedActivities(): SavedActivity[] {
  const saved = localStorage.getItem(STORAGE_KEYS.SAVED_ACTIVITIES);
  return saved ? JSON.parse(saved) : [];
}

export function saveActivityOffline(activityId: string): void {
  const savedActivities = getSavedActivities();

  // Avoid duplicates
  if (!savedActivities.some(saved => saved.activityId === activityId)) {
    const newSaved: SavedActivity = {
      activityId,
      savedAt: new Date().toISOString()
    };

    savedActivities.push(newSaved);
    localStorage.setItem(STORAGE_KEYS.SAVED_ACTIVITIES, JSON.stringify(savedActivities));
    addRecentActivity('saved_activity', `Saved activity for offline use`);
  }
}

export function removeSavedActivity(activityId: string): void {
  const savedActivities = getSavedActivities();
  const filtered = savedActivities.filter(saved => saved.activityId !== activityId);
  localStorage.setItem(STORAGE_KEYS.SAVED_ACTIVITIES, JSON.stringify(filtered));

  // Remove from recent activity if needed
  addRecentActivity('removed_saved_activity', `Removed saved activity`);
}

export function isActivitySaved(activityId: string): boolean {
  return getSavedActivities().some(saved => saved.activityId === activityId);
}

/* SESSION PLANS */
export function getPlans(): SessionPlan[] {
  const plans = localStorage.getItem(STORAGE_KEYS.PLANS);
  return plans ? JSON.parse(plans) : [];
}

export function savePlan(plan: SessionPlan): void {
  const plans = getPlans();
  const existingIndex = plans.findIndex(p => p.id === plan.id);

  if (existingIndex >= 0) {
    // Update existing plan
    plans[existingIndex] = plan;
  } else {
    // Add new plan
    plans.push(plan);
  }

  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  addRecentActivity('plan_created', `Created plan: "${plan.title}"`);
}

export function deletePlan(id: string): void {
  const plans = getPlans();
  const filtered = plans.filter(plan => plan.id !== id);
  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(filtered));

  // Also remove from sync queue if present
  removeFromSyncQueue(id);
  addRecentActivity('plan_deleted', `Deleted plan`);
}

export function getPlanById(id: string): SessionPlan | undefined {
  return getPlans().find(plan => plan.id === id);
}

/* KIT REQUESTS */
export function getKitRequests(): KitRequest[] {
  const requests = localStorage.getItem(STORAGE_KEYS.KIT_REQUESTS);
  return requests ? JSON.parse(requests) : [];
}

export function saveKitRequest(request: KitRequest): void {
  const requests = getKitRequests();
  const existingIndex = requests.findIndex(r => r.id === request.id);

  if (existingIndex >= 0) {
    // Update existing request
    requests[existingIndex] = request;
  } else {
    // Add new request
    requests.push(request);
  }

  localStorage.setItem(STORAGE_KEYS.KIT_REQUESTS, JSON.stringify(requests));

  if (request.status === 'current') {
    addRecentActivity('kit_requested', `Requested kit: "${request.kitName}"`);
  } else if (request.status === 'returned') {
    addRecentActivity('kit_returned', `Returned kit: "${request.kitName}"`);
  }
}

export function deleteKitRequest(id: string): void {
  const requests = getKitRequests();
  const filtered = requests.filter(request => request.id !== id);
  localStorage.setItem(STORAGE_KEYS.KIT_REQUESTS, JSON.stringify(filtered));

  addRecentActivity('kit_request_deleted', `Deleted kit request`);
}

/* SYNC QUEUE */
export function getSyncQueue(): SyncQueueItem[] {
  const queue = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
  return queue ? JSON.parse(queue) : [];
}

export function addToSyncQueue(planId: string, planTitle: string): void {
  const queue = getSyncQueue();

  // Avoid duplicates
  if (!queue.some(item => item.planId === planId)) {
    const newItem: SyncQueueItem = {
      id: `${planId}-sync-${Date.now()}`,
      planId,
      planTitle,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    };

    queue.push(newItem);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    addRecentActivity('sync_queued', `Queued plan for sync: "${planTitle}"`);
  }
}

export function updateSyncStatus(syncId: string, status: SyncStatus): void {
  const queue = getSyncQueue();
  const item = queue.find(item => item.id === syncId);

  if (item) {
    item.status = status;
    if (status === 'synced' || status === 'failed') {
      item.lastAttempt = new Date().toISOString();
    }
    if (status === 'failed') {
      item.retryCount += 1;
    }

    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));

    if (status === 'synced') {
      addRecentActivity('sync_completed', `Sync completed successfully`);
    } else if (status === 'failed') {
      addRecentActivity('sync_failed', `Sync failed - retry available`);
    }
  }
}

export function removeFromSyncQueue(planId: string): void {
  const queue = getSyncQueue();
  const filtered = queue.filter(item => item.planId !== planId);
  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
}

export function clearSyncedItems(): void {
  const queue = getSyncQueue();
  const pendingOnly = queue.filter(item => item.status !== 'synced');
  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(pendingOnly));
}

/* SETTINGS */
export function getSettings(): Settings {
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return settings ? JSON.parse(settings) : getDefaultSettings();
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

  // Apply settings immediately
  applySettingsToDOM(settings);
}

/* RECENT ACTIVITY */
export function getRecentActivity(): RecentActivity[] {
  const activity = localStorage.getItem(STORAGE_KEYS.RECENT_ACTIVITY);
  return activity ? JSON.parse(activity) : [];
}

export function addRecentActivity(type: RecentActivity['type'], description: string): void {
  const activities = getRecentActivity();
  const newActivity: RecentActivity = {
    id: `activity-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    description,
    timestamp: new Date().toISOString()
  };

  activities.push(newActivity);

  // Keep only last 50 activities
  if (activities.length > 50) {
    activities.splice(0, activities.length - 50);
  }

  localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITY, JSON.stringify(activities));
}

/* CONNECTION STATUS */
export function isOnline(): boolean {
  return navigator.onLine;
}

/* APPLY SETTINGS TO DOM */
function applySettingsToDOM(settings: Settings): void {
  const root = document.documentElement;

  // Dark mode
  if (settings.darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // High contrast
  if (settings.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // Font size
  root.dataset.fontSize = settings.fontSize;

  // Connection simulation (override for testing)
  if (settings.connectionSimulation !== 'auto') {
    // This would be used to simulate online/offline states for testing
    // In production, you'd use the actual navigator.onLine
    console.log(`Connection simulation set to: ${settings.connectionSimulation}`);
  }
}

/* DATA MIGRATION / CLEANUP */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  localStorage.removeItem(STORAGE_KEYS.SAVED_ACTIVITIES);
  localStorage.removeItem(STORAGE_KEYS.PLANS);
  localStorage.removeItem(STORAGE_KEYS.KIT_REQUESTS);
  localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.RECENT_ACTIVITY);

  // Reset to default settings
  localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(getDefaultSettings()));
  localStorage.setItem(STORAGE_KEYS.SAVED_ACTIVITIES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.KIT_REQUESTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITY, JSON.stringify([]));

  // Reapply default settings
  applySettingsToDOM(getDefaultSettings());
}

/* EXPORT/IMPORT */
export function exportAllData(): string {
  const data = {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    savedActivities: getSavedActivities(),
    plans: getPlans(),
    kitRequests: getKitRequests(),
    syncQueue: getSyncQueue(),
    settings: getSettings(),
    recentActivity: getRecentActivity()
  };

  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    // Validate version compatibility
    if (data.version && data.version !== CURRENT_VERSION) {
      console.warn(`Importing data from version ${data.version}, current version is ${CURRENT_VERSION}`);
    }

    // Import data
    if (data.savedActivities !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SAVED_ACTIVITIES, JSON.stringify(data.savedActivities));
    }
    if (data.plans !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data.plans));
    }
    if (data.kitRequests !== undefined) {
      localStorage.setItem(STORAGE_KEYS.KIT_REQUESTS, JSON.stringify(data.kitRequests));
    }
    if (data.syncQueue !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(data.syncQueue));
    }
    if (data.settings !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      applySettingsToDOM(data.settings);
    }
    if (data.recentActivity !== undefined) {
      localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITY, JSON.stringify(data.recentActivity));
    }

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

// Initialize storage when module is loaded
if (typeof window !== 'undefined') {
  initializeStorage();
}