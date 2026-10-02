import React, { useState, useMemo, useEffect } from 'react';
// import { useSettings } from '../contexts/SettingsContext';
import { NAMIBIAN_ACTIVITIES } from '../data/activities';
import { isActivitySaved, saveActivityOffline, removeSavedActivity } from '../services/storageService';
import type { Activity } from '../services/storageService';
import { validatePrivacy } from '../utils/privacyValidator';
import type { PrivacyCheckResult } from '../types';

export const Activities: React.FC = () => {
  // const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [privacyResult, setPrivacyResult] = useState<PrivacyCheckResult>({ valid: true, violations: [] });
  const [toastMessage, setToastMessage] = useState<string>('');

  // Load saved status on mount
  useEffect(() => {
    const statuses: Record<string, boolean> = {};
    NAMIBIAN_ACTIVITIES.forEach(activity => {
      statuses[activity.id] = isActivitySaved(activity.id);
    });
    setSavedStatus(statuses);
  }, []);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return NAMIBIAN_ACTIVITIES.filter(activity => {
      // Search query filter
      const matchesSearch = searchQuery === '' ||
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.materials.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

      // Level filter
      const matchesLevel = levelFilter === 'all' || activity.level === levelFilter;

      // Duration filter
      const matchesDuration = durationFilter === 'all' || activity.duration === durationFilter;

      return matchesSearch && matchesLevel && matchesDuration;
    });
  }, [searchQuery, levelFilter, durationFilter]);

  const handleSave = (activity: Activity) => {
    // Privacy check before saving
    const privacyResult = validatePrivacy({
      title: activity.title,
      description: activity.description,
      notes: '',
      safetyNotes: activity.safetyNotes,
      facilitator: '',
      materials: activity.materials,
      steps: activity.steps,
      inclusionPrompts: activity.inclusionPrompts
    });

    if (!privacyResult.valid) {
      setPrivacyResult(privacyResult);
      setToastMessage('⚠ Cannot save: potential pupil data detected');
      return;
    }

    if (savedStatus[activity.id]) {
      removeSavedActivity(activity.id);
      setSavedStatus(prev => ({ ...prev, [activity.id]: false }));
      setToastMessage('Activity removed from offline');
    } else {
      saveActivityOffline(activity.id);
      setSavedStatus(prev => ({ ...prev, [activity.id]: true }));
      setToastMessage('Activity saved for offline use');
    }

    // Clear toast after 3 seconds
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDetails = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleCloseDetails = () => {
    setSelectedActivity(null);
  };

  // Escape closes the details dialog; focus moves to the dialog heading on
  // open and returns to the previously focused element on close
  useEffect(() => {
    if (!selectedActivity) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const heading = document.querySelector<HTMLElement>('#activity-details-title');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseDetails();
        return;
      }
      // Tab trap: keep keyboard focus inside the open dialog
      if (e.key === 'Tab') {
        const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActivity]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          STEM Activities
        </h1>
        <p className="text-gray-600">
          Browse, search, and filter activities. Save for offline use.
        </p>
      </header>

      {/* Search and filters */}
      <section className="bg-white rounded-lg shadow-card p-4 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search activities
            </label>
            <input
              type="search"
              id="search"
              placeholder="Search by title, topic, or material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
            />
          </div>

          {/* Level filter */}
          <div>
            <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              id="level-filter"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
            >
              <option value="all">All Levels</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="community">Community</option>
            </select>
          </div>

          {/* Duration filter */}
          <div>
            <label htmlFor="duration-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <select
              id="duration-filter"
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
            >
              <option value="all">All Durations</option>
              <option value="15m">15 minutes</option>
              <option value="30m">30 minutes</option>
              <option value="45m">45 minutes</option>
              <option value="60m">60 minutes</option>
              <option value="90m">90 minutes</option>
            </select>
          </div>
        </div>

        {/* Active filter count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredActivities.length} of {NAMIBIAN_ACTIVITIES.length} activities
        </div>
      </section>

      {/* Privacy validation alert */}
      {!privacyResult.valid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4" role="alert">
          <h3 className="font-medium text-yellow-800 mb-2">Privacy Validation Warning</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700">
            {privacyResult.violations.map((violation, i) => (
              <li key={i}>{violation}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div
          className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-sm mb-4 flex items-center justify-between"
          role="status"
          aria-live="polite"
        >
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="ml-4 text-blue-100 hover:text-white text-lg"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Activities grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No activities found matching your search</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <article key={activity.id} className="bg-white rounded-lg shadow-card border border-gray-100 overflow-hidden">
              {/* Activity header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-lg font-medium text-gray-900">{activity.title}</h2>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                    {activity.level}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {activity.description}
                </p>

                {/* Activity meta */}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <span className="px-2 py-1 bg-gray-100 rounded">{activity.topic}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">{activity.duration}</span>
                </div>

                {/* Materials preview */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Materials needed:</p>
                  <div className="flex flex-wrap gap-1">
                    {activity.materials.slice(0, 3).map((material, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gray-50 border border-gray-200 rounded">
                        {material}
                      </span>
                    ))}
                    {activity.materials.length > 3 && (
                      <span className="text-xs text-gray-500 px-1">
                        +{activity.materials.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDetails(activity)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
                    aria-label={`View details for ${activity.title}`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleSave(activity)}
                    className={`
                      flex-1 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]
                      ${savedStatus[activity.id]
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                    aria-label={savedStatus[activity.id] ? `Remove ${activity.title} from offline` : `Save ${activity.title} for offline`}
                  >
                    {savedStatus[activity.id] ? '✓ Saved' : 'Save Offline'}
                  </button>
                </div>
              </div>

              {/* Saved indicator */}
              {savedStatus[activity.id] && (
                <div className="bg-green-50 border-t border-green-200 px-4 py-2 text-xs text-green-700">
                  Available offline ✓
                </div>
              )}
            </article>
          ))
        )}
      </section>

      {/* Activity details modal */}
      {selectedActivity && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-details-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDetails();
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 id="activity-details-title" className="text-xl font-bold text-gray-900">
                  {selectedActivity.title}
                </h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {selectedActivity.level}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {selectedActivity.duration}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {selectedActivity.topic}
                </span>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedActivity.description}</p>
              </div>

              {/* Materials */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Materials Needed</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedActivity.materials.map((material, i) => (
                    <li key={i}>{material}</li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Steps</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  {selectedActivity.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Safety Notes */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Safety Notes</h3>
                <p className="text-gray-700">{selectedActivity.safetyNotes}</p>
              </div>

              {/* Inclusion Prompts */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Inclusion Prompts</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedActivity.inclusionPrompts.map((prompt, i) => (
                    <li key={i}>{prompt}</li>
                  ))}
                </ul>
              </div>

              {/* Namibia Context */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Namibia Context</h3>
                <p className="text-gray-700">{selectedActivity.namibiaContext}</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleSave(selectedActivity)}
                  className={`
                    flex-1 rounded-md px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${savedStatus[selectedActivity.id]
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {savedStatus[selectedActivity.id] ? 'Remove from Offline' : 'Save for Offline'}
                </button>
                <button
                  onClick={handleCloseDetails}
                  className="rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline counter */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-2">
        <span className="text-blue-700 text-sm font-medium" aria-live="polite">
          📌 {Object.values(savedStatus).filter(Boolean).length} activities saved offline
        </span>
      </div>
    </div>
  );
};