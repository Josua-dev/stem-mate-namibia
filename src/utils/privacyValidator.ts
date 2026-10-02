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

  // Heuristic checks run only on free-text fields where pupil information
  // might be typed. Title is excluded (title-case activity names like
  // "Water Cycle Simulation" and year numbers cause false positives) and
  // facilitator is excluded (adult facilitator names are allowed).
  const heuristicFields: Array<{ field: string; value: string }> = [
    { field: 'description', value: context.description },
    { field: 'notes', value: context.notes },
    { field: 'safetyNotes', value: context.safetyNotes },
  ];

  // Check for possible personal names ("John Smith" patterns)
  const pupilNamePatterns = [
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
  ];

  for (const { field, value } of heuristicFields) {
    for (const pattern of pupilNamePatterns) {
      const matches = value.match(pattern);
      if (matches && matches.length > 0) {
        violations.push(`Possible pupil name "${matches[0]}" detected in ${field} field`);
      }
    }
  }

  // Check for numeric patterns that might be student IDs.
  // 5+ digit bare numbers are flagged (Namibian student numbers are long);
  // shorter numbers allow legitimate notes such as "150 learners attended".
  // "ID:"-prefixed and S-prefixed IDs are caught globally by FORBIDDEN_PATTERNS.
  const idPatterns = [
    /\b\d{5,}\b/g,
  ];

  for (const { field, value } of heuristicFields) {
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