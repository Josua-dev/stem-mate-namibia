// STEMMate Namibia - Privacy Validator
// Validates that no pupil data is present in form fields before saving
// Version: v1.0.0

import type { PrivacyCheckResult, PrivacyContext } from '../types';
import { FORBIDDEN_PATTERNS } from '../types';

/**
 * Checks text content for forbidden patterns that might indicate pupil data
 * Pupil data is NEVER allowed: no names, photos, audio, identifiers, or profiles
 */
export function validatePrivacy(context: PrivacyContext): PrivacyCheckResult {
  const violations: string[] = [];

  // Check all text fields for pupil data patterns
  const fieldsToCheck: Array<{ field: string; value: string }> = [
    { field: 'title', value: context.title },
    { field: 'description', value: context.description },
    { field: 'notes', value: context.notes },
    { field: 'safetyNotes', value: context.safetyNotes },
    { field: 'facilitator', value: context.facilitator },
  ];

  // Check array fields (materials, steps, inclusionPrompts)
  const arrayFields: Array<{ field: string; values: string[] }> = [
    { field: 'materials', values: context.materials },
    { field: 'steps', values: context.steps },
    { field: 'inclusionPrompts', values: context.inclusionPrompts },
  ];

  // Check text fields for forbidden patterns
  for (const { field, value } of fieldsToCheck) {
    const lowerValue = value.toLowerCase();

    for (const { pattern, name } of FORBIDDEN_PATTERNS) {
      if (pattern.test(lowerValue)) {
        violations.push(`"${name}" detected in ${field} field`);
      }
    }
  }

  // Check array fields for forbidden patterns
  for (const { field, values } of arrayFields) {
    for (const item of values) {
      const lowerItem = item.toLowerCase();
      for (const { pattern, name } of FORBIDDEN_PATTERNS) {
        if (pattern.test(lowerItem)) {
          violations.push(`"${name}" detected in ${field} item`);
        }
      }
    }
  }

  // Check for pupil name patterns (capitalized names in suspicious contexts)
  const pupilNamePatterns = [
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,  // "John Smith" patterns
  ];

  for (const { field, value } of fieldsToCheck) {
    for (const pattern of pupilNamePatterns) {
      const matches = value.match(pattern);
      if (matches && matches.length > 0) {
        violations.push(`Possible pupil name "${matches[0]}" detected in ${field} field`);
      }
    }
  }

  // Check for numeric patterns that might be student IDs
  const idPatterns = [
    /\b\d{3,}\b/g,  // 3+ digit numbers
    /ID[:\s]?\d+/gi,  // ID followed by number
    /\bS\d{6,}\b/,  // Student ID pattern like S123456
  ];

  for (const { field, value } of fieldsToCheck) {
    for (const pattern of idPatterns) {
      const matches = value.match(pattern);
      if (matches && matches.length > 0) {
        violations.push(`Possible identifier "${matches[0]}" detected in ${field} field`);
      }
    }
  }

  const valid = violations.length === 0;
  return { valid, violations };
}

/**
 * Sanitize a string by removing potential pupil data patterns
 */
export function sanitizeContent(text: string): string {
  let sanitized = text;

  // Remove patterns that look like identifiers
  sanitized = sanitized.replace(/\bID[:\s]?\d+\b/gi, '[REDACTED]');
  sanitized = sanitized.replace(/\bS\d{6,}\b/g, '[REDACTED]');
  sanitized = sanitized.replace(/\b\d{3,}\b/g, '[REDACTED]');

  return sanitized;
}

/**
 * Quick validation - just check if any forbidden pattern exists in text
 */
export function quickPrivacyCheck(text: string): boolean {
  const lowerText = text.toLowerCase();
  return !FORBIDDEN_PATTERNS.some(({ pattern }) => pattern.test(lowerText));
}