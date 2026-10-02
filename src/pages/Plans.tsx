import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../contexts/ConnectionContext';
import {
  getPlans,
  savePlan,
  deletePlan,
  getSavedActivities,
  addToSyncQueue,
  addRecentActivity
} from '../services/storageService';
import type { Activity, SessionPlan, PlanStep } from '../services/storageService';
import { NAMIBIAN_ACTIVITIES } from '../data/activities';
import { validatePrivacy } from '../utils/privacyValidator';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { v4 as uuidv4 } from 'uuid';

interface PlanForm {
  title: string;
  activityId: string;
  duration: string;
  materials: string;
  stepCount: number;
  safetyNotes: string;
  inclusionPrompts: string;
  participationCount: number;
}

export const Plans: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline } = useConnection();
  const [plans, setPlans] = useState<SessionPlan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SessionPlan | null>(null);
  const [formData, setFormData] = useState<PlanForm>({
    title: '',
    activityId: '',
    duration: '45m',
    materials: '',
    stepCount: 3,
    safetyNotes: '',
    inclusionPrompts: '',
    participationCount: 0
  });
  const [privacyError, setPrivacyError] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SessionPlan | null>(null);
  const [lastSaved, setLastSaved] = useState<string>('');

  // Load plans
  useEffect(() => {
    const loadedPlans = getPlans();
    setPlans(loadedPlans);
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (showCreateForm || editingPlan) {
      // Clear any existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Only auto-save if there's content
      if (formData.title.trim()) {
        const timeout = setTimeout(() => {
          handleSaveDraft();
        }, 2000);

        setAutoSaveTimeout(timeout);
      }
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [formData, showCreateForm, editingPlan]);

  const handleInputChange = (field: keyof PlanForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && formError) {
      setFormError('');
    }
  };

  const handleSelectActivity = (activityId: string) => {
    const activity = NAMIBIAN_ACTIVITIES.find(a => a.id === activityId);
    if (activity) {
      setFormData(prev => ({
        ...prev,
        activityId,
        duration: activity.duration,
        materials: activity.materials.join(', '),
        safetyNotes: activity.safetyNotes,
        inclusionPrompts: activity.inclusionPrompts.join(', '),
        stepCount: activity.steps.length
      }));
    }
  };

  const generateSteps = (activityId: string): PlanStep[] => {
    const activity = NAMIBIAN_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return [];

    return activity.steps.map((step, index) => ({
      id: `step-${index + 1}`,
      order: index + 1,
      description: step,
      duration: activity.duration
    }));
  };

  const handleSaveDraft = async () => {
    // Privacy check
    const privacyResult = validatePrivacy({
      title: formData.title,
      description: '',
      notes: '',
      safetyNotes: formData.safetyNotes,
      facilitator: '',
      materials: formData.materials.split(',').map(s => s.trim()).filter(Boolean),
      steps: [],
      inclusionPrompts: formData.inclusionPrompts.split(',').map(s => s.trim()).filter(Boolean)
    });

    if (!privacyResult.valid) {
      setPrivacyError(privacyResult.violations.join(', '));
      return;
    }

    const activity = NAMIBIAN_ACTIVITIES.find(a => a.id === formData.activityId);
    const steps = generateSteps(formData.activityId);

    const plan: SessionPlan = {
      id: editingPlan?.id || uuidv4(),
      title: formData.title,
      activityId: formData.activityId as string,
      activityTitle: activity?.title || '',
      duration: formData.duration,
      materials: formData.materials.split(',').map(s => s.trim()).filter(Boolean),
      steps,
      safetyNotes: formData.safetyNotes,
      inclusionPrompts: formData.inclusionPrompts.split(',').map(s => s.trim()).filter(Boolean),
      participationCount: Number(formData.participationCount),
      createdAt: editingPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };

    await savePlan(plan);

    // If online, add to sync queue
    if (isOnline && plan.status === 'completed') {
      addToSyncQueue(plan.id, plan.title);
    }

    setPlans(prev => isEditing(plan.id)
      ? prev.map(p => p.id === plan.id ? plan : p)
      : [...prev, plan]
    );

    setPrivacyError('');
    setLastSaved(new Date().toLocaleTimeString());

    // Don't navigate - just save as draft
  };

  const handleCompletePlan = async () => {
    if (!formData.title.trim()) {
      setFormError('Please enter a plan title before completing the plan.');
      return;
    }

    const activity = NAMIBIAN_ACTIVITIES.find(a => a.id === formData.activityId);
    const steps = generateSteps(formData.activityId);

    const plan: SessionPlan = {
      id: editingPlan?.id || uuidv4(),
      title: formData.title,
      activityId: formData.activityId as string,
      activityTitle: activity?.title || '',
      duration: formData.duration,
      materials: formData.materials.split(',').map(s => s.trim()).filter(Boolean),
      steps,
      safetyNotes: formData.safetyNotes,
      inclusionPrompts: formData.inclusionPrompts.split(',').map(s => s.trim()).filter(Boolean),
      participationCount: Number(formData.participationCount),
      createdAt: editingPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'completed'
    };

    await savePlan(plan, false);
    addRecentActivity('plan_completed', `Completed plan: "${plan.title}"`);

    // Add to sync queue for online sync
    addToSyncQueue(plan.id, plan.title);

    setPlans(prev => isEditing(plan.id)
      ? prev.map(p => p.id === plan.id ? plan : p)
      : [...prev, plan]
    );

    setShowCreateForm(false);
    setEditingPlan(null);
    setFormError('');
    setFormData({
      title: '',
      activityId: '',
      duration: '45m',
      materials: '',
      stepCount: 3,
      safetyNotes: '',
      inclusionPrompts: '',
      participationCount: 0
    });
  };

  const handleDeletePlan = async (plan: SessionPlan) => {
    await deletePlan(plan.id);
    setPlans(prev => prev.filter(p => p.id !== plan.id));
    setPlanToDelete(null);
  };

  const handleNavigateToPlan = (planId: string) => {
    navigate(`/plans/${planId}`);
  };

  const openCreateForm = () => {
    setShowCreateForm(true);
    setEditingPlan(null);
    setLastSaved('');
    setFormData({
      title: '',
      activityId: '',
      duration: '45m',
      materials: '',
      stepCount: 3,
      safetyNotes: '',
      inclusionPrompts: '',
      participationCount: 0
    });
  };

  const openEditPlan = (plan: SessionPlan) => {
    setEditingPlan(plan);
    setShowCreateForm(true);
    setLastSaved(new Date(plan.updatedAt).toLocaleTimeString());
    setFormData({
      title: plan.title,
      activityId: plan.activityId,
      duration: plan.duration,
      materials: plan.materials.join(', '),
      stepCount: plan.steps.length,
      safetyNotes: plan.safetyNotes,
      inclusionPrompts: plan.inclusionPrompts.join(', '),
      participationCount: plan.participationCount
    });
  };

  const isEditing = (planId: string): boolean => {
    return editingPlan?.id === planId;
  };

  // Escape closes the plan form dialog; focus moves to the dialog heading on
  // open and returns to the previously focused element on close
  useEffect(() => {
    if (!showCreateForm) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const heading = document.querySelector<HTMLElement>('#plan-form-title');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreateForm(false);
        setEditingPlan(null);
        setFormError('');
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
  }, [showCreateForm]);

  const savedActivityOptions = getSavedActivities().map(sa =>
    NAMIBIAN_ACTIVITIES.find(a => a.id === sa.activityId)
  ).filter(Boolean) as Activity[];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Page header */}
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Plans</h1>
            <p className="text-gray-600">
              Create, edit, and manage STEM session plans. Drafts are auto-saved.
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
            aria-label="Create new plan"
          >
            + New Plan
          </button>
        </div>
      </header>

      {/* Privacy error */}
      {privacyError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4" role="alert">
          <h3 className="font-medium text-yellow-800 mb-1">Privacy Check Failed</h3>
          <p className="text-sm text-yellow-700">{privacyError}</p>
        </div>
      )}

      {/* Draft/final status indicator */}
      {isOnline === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <span>🔴 Offline</span>
            <span className="text-gray-600">•</span>
            <span>New plans will be queued for sync</span>
          </p>
        </div>
      )}

      {/* Plans grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {plans.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-card border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plans yet</h3>
            <p className="text-gray-500 mb-4">Create your first session plan</p>
            <button
              onClick={openCreateForm}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Plan
            </button>
          </div>
        ) : (
          plans.map(plan => (
            <article key={plan.id} className="bg-white rounded-lg shadow-card border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-lg font-medium text-gray-900">
                  {plan.title}
                </h2>
                <span className={`
                  text-xs font-medium px-2 py-1 rounded-full
                  ${plan.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }
                `}>
                  {plan.status === 'completed' ? 'Final' : 'Draft'}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <p className="font-medium">{plan.activityTitle}</p>
                <p>Duration: {plan.duration} • Participants: {plan.participationCount}</p>
              </div>

              {/* Steps preview */}
              {plan.steps.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Steps ({plan.steps.length})</p>
                  <ul className="text-xs text-gray-600">
                    {plan.steps.slice(0, 3).map(step => (
                      <li key={step.id} className="flex items-start gap-2">
                        <span className="text-gray-500" aria-hidden="true">•</span>
                        <span className="line-clamp-1">{step.description}</span>
                      </li>
                    ))}
                    {plan.steps.length > 3 && (
                      <li className="text-xs text-gray-600">
                        +{plan.steps.length - 3} more steps
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleNavigateToPlan(plan.id)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View
                </button>
                <button
                  onClick={() => openEditPlan(plan)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => setPlanToDelete(plan)}
                  className="rounded-md bg-red-100 text-red-700 px-3 py-2 text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Delete plan ${plan.title}`}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Create/Edit Form modal */}
      {showCreateForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-form-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateForm(false);
              setEditingPlan(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mt-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 id="plan-form-title" className="text-xl font-bold text-gray-900">
                  {editingPlan ? 'Edit Plan' : 'New Plan'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPlan(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 rounded p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close form"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Plan title */}
              <div>
                <label htmlFor="plan-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Title
                </label>
                <input
                  type="text"
                  id="plan-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Water Cycle Session"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              {/* Activity selection */}
              <div>
                <label htmlFor="activity-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Activity
                </label>
                <select
                  id="activity-select"
                  value={formData.activityId}
                  onChange={(e) => handleSelectActivity(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                >
                  <option value="">Choose an activity...</option>
                  {[...NAMIBIAN_ACTIVITIES, ...savedActivityOptions].map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                >
                  <option value="15m">15 minutes</option>
                  <option value="30m">30 minutes</option>
                  <option value="45m">45 minutes</option>
                  <option value="60m">60 minutes</option>
                  <option value="90m">90 minutes</option>
                </select>
              </div>

              {/* Participation count */}
              <div>
                <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Participants (numbers only)
                </label>
                <input
                  type="number"
                  id="participants"
                  value={formData.participationCount}
                  onChange={(e) => handleInputChange('participationCount', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              {/* Materials */}
              <div>
                <label htmlFor="materials" className="block text-sm font-medium text-gray-700 mb-1">
                  Materials (comma-separated)
                </label>
                <input
                  type="text"
                  id="materials"
                  value={formData.materials}
                  onChange={(e) => handleInputChange('materials', e.target.value)}
                  placeholder="e.g., cup, water, plastic wrap"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              {/* Safety notes */}
              <div>
                <label htmlFor="safety-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Safety Notes
                </label>
                <textarea
                  id="safety-notes"
                  rows={2}
                  value={formData.safetyNotes}
                  onChange={(e) => handleInputChange('safetyNotes', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              {/* Inclusion prompts */}
              <div>
                <label htmlFor="inclusion" className="block text-sm font-medium text-gray-700 mb-1">
                  Inclusion Prompts
                </label>
                <input
                  type="text"
                  id="inclusion"
                  value={formData.inclusionPrompts}
                  onChange={(e) => handleInputChange('inclusionPrompts', e.target.value)}
                  placeholder="e.g., alternative materials for allergies, seating for mobility issues"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              {/* Auto-save indicator */}
              <div className="text-xs text-gray-500">
                {lastSaved ? (
                  <>Draft saved at <span className="font-medium">{lastSaved}</span> — keeps saving as you type</>
                ) : (
                  'Draft saves automatically as you type'
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              {/* Form error */}
              {formError && (
                <p className="text-sm text-red-700 mb-3" role="alert">
                  ⚠ {formError}
                </p>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPlan(null);
                    setFormError('');
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="rounded-md border border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleCompletePlan}
                  className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
                >
                  Complete Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={planToDelete !== null}
        title="Delete this plan?"
        description={`"${planToDelete?.title}" will be permanently removed from this device, along with its sync queue entry. This cannot be undone.`}
        confirmLabel="Delete plan"
        cancelLabel="Keep plan"
        destructive
        onConfirm={() => { if (planToDelete) handleDeletePlan(planToDelete); }}
        onCancel={() => setPlanToDelete(null)}
      />
    </div>
  );
};