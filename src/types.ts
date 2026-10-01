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

// Allowed fields for any form - pupil data is NEVER allowed
export const ALLOWED_FORM_FIELDS = [
  'title', 'description', 'materials', 'steps', 'safetyNotes',
  'inclusionPrompts', 'facilitator', 'duration', 'participationCount',
  'kitName', 'intendedDate', 'planTitle', 'activityTitle'
]

export const FORBIDDEN_PATTERNS = [
  { pattern: /\bpupil\b/i, name: 'pupil' },
  { pattern: /\bstudent\b/i, name: 'student' },
  { pattern: /\bchild\b/i, name: 'child' },
  { pattern: /\bchildren\b/i, name: 'children' },
  { pattern: /\bname\b/i, name: 'name' },
  { pattern: /\bphoto\b/i, name: 'photo' },
  { pattern: /\bimage\b/i, name: 'image' },
  { pattern: /\baudio\b/i, name: 'audio' },
  { pattern: /\bvideo\b/i, name: 'video' },
  { pattern: /\bprofile\b/i, name: 'profile' },
  { pattern: /\bidentifier\b/i, name: 'identifier' },
  { pattern: /\bID\b/i, name: 'identifier' },
  { pattern: /\bDOB\b/i, name: 'date of birth' },
  { pattern: /\bdate of birth\b/i, name: 'date of birth' },
  { pattern: /\baddress\b/i, name: 'address' },
  { pattern: /\bphone\b/i, name: 'phone' },
  { pattern: /\bemail\b/i, name: 'email' },
  { pattern: /\bage\b/i, name: 'age' },
  { pattern: /\bgrade\b/i, name: 'grade' },
  { pattern: /\bclass\b/i, name: 'class' },
  { pattern: /\bsex\b/i, name: 'sex' },
  { pattern: /\bgender\b/i, name: 'gender' },
  { pattern: /\bethnicity\b/i, name: 'ethnicity' },
  { pattern: /\bdisability\b/i, name: 'disability' },
  { pattern: /\bmedical\b/i, name: 'medical' },
  { pattern: /\bhealth\b/i, name: 'health' },
  { pattern: /\ballergy\b/i, name: 'allergy' },
  { pattern: /\bemergency contact\b/i, name: 'emergency contact' },
  { pattern: /\bparent\b/i, name: 'parent' },
  { pattern: /\bguardian\b/i, name: 'guardian' },
  { pattern: /\bteacher\b/i, name: 'teacher' },
  { pattern: /\blearner\b/i, name: 'learner' },
  { pattern: /\blearners\b/i, name: 'learners' },
  { pattern: /\bpupil name\b/i, name: 'pupil name' },
  { pattern: /\bpersonal\b/i, name: 'personal' },
  { pattern: /\bcontact\b/i, name: 'contact' },
]