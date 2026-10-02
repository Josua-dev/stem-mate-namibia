// STEMMate Namibia - Core Types
// Version: v1.0.0

export type ActivityLevel = 'primary' | 'secondary' | 'community'
export type ActivityDuration = '15m' | '30m' | '45m' | '60m' | '90m'
export type ConnectionStatus = 'online' | 'offline'
export type SyncStatus = 'pending' | 'synced' | 'failed'

export interface Activity {
  id: string
  title: string
  description: string
  level: ActivityLevel
  duration: ActivityDuration
  topic: string
  materials: string[]
  steps: string[]
  safetyNotes: string
  inclusionPrompts: string[]
  namibiaContext: string
  createdAt: string
}

export interface SavedActivity {
  activityId: string
  savedAt: string
}

export interface PlanStep {
  id: string
  order: number
  description: string
  duration: string
}

export interface SessionPlan {
  id: string
  title: string
  activityId: string
  activityTitle: string
  duration: string
  materials: string[]
  steps: PlanStep[]
  safetyNotes: string
  inclusionPrompts: string[]
  participationCount: number
  createdAt: string
  updatedAt: string
  status: 'draft' | 'completed'
}

export interface KitRequest {
  id: string
  kitName: string
  intendedDate: string
  responsibleFacilitator: string
  createdAt: string
  status: 'current' | 'returned'
  returnedAt?: string
}

export interface SyncQueueItem {
  id: string
  planId: string
  planTitle: string
  createdAt: string
  status: SyncStatus
  retryCount: number
  lastAttempt?: string
}

export interface Settings {
  darkMode: boolean
  fontSize: 'base' | 'large' | 'xl'
  highContrast: boolean
  connectionSimulation: 'auto' | 'online' | 'offline'
}

export interface RecentActivity {
  id: string
  type: 'saved_activity' | 'plan_created' | 'plan_completed' | 'plan_deleted' | 'kit_requested' | 'kit_returned' | 'kit_request_deleted' | 'removed_saved_activity' | 'sync_queued' | 'sync_completed' | 'sync_failed' | 'sync_attempt' | 'connection' | 'sign_out'
  description: string
  timestamp: string
}

export interface PrivacyCheckResult {
  valid: boolean
  violations: string[]
}

export interface PrivacyContext {
  title: string
  description: string
  notes: string
  materials: string[]
  steps: string[]
  safetyNotes: string
  inclusionPrompts: string[]
  facilitator: string
}

// Pupils are never users: no pupil name, photo, audio, identifier or profile
// may exist anywhere. See FORBIDDEN_PATTERNS below for what is blocked.

// Forbidden: content that indicates pupil data is present in a form.
// Pupils are never users: no pupil name, photo, audio, identifier or profile
// may exist anywhere. These patterns catch pupil DATA references (e.g.
// "pupil name", "student ID: 20230123", "learner photo") — not the everyday
// instructional words ("students", "classroom") that appear in legitimate
// activity content.
const PUPIL_WORD = '(pupil|learner|student|child)';
const DATA_WORDS = 'name|photo|image|audio|video|profile|identifier|id|dob|date of birth|address|phone|email|age|grade|class|record|result|mark|score';

export const FORBIDDEN_PATTERNS = [
  // "pupil name", "student ID", "learner photo", "child's address"…
  { pattern: new RegExp(`\\b${PUPIL_WORD}s?\\s+(${DATA_WORDS})\\b`, 'i'), name: 'pupil data reference' },
  // "photo of the pupil", "record for the learner"…
  { pattern: new RegExp(`\\b(${DATA_WORDS})\\s+(?:of|for)\\s+(?:the\\s+|a\\s+)?${PUPIL_WORD}s?\\b`, 'i'), name: 'pupil data reference' },
  // possessives: "student's name", "learners' marks"
  { pattern: new RegExp(`\\b${PUPIL_WORD}s?\\s*[''’]\\s*s?\\b`, 'i'), name: 'pupil name (possessive)' },
  // student ID numbers: "S123456", "ID: 20230123"
  { pattern: /\bS\d{6,}\b/, name: 'student ID number' },
  { pattern: /\bID\s*[:#]?\s*\d{4,}\b/i, name: 'student ID number' },
]