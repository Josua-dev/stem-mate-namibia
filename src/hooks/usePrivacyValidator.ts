import type { PrivacyCheckResult } from '../types';
import { FORBIDDEN_PATTERNS } from '../types';

/**
 * Checks text content for forbidden patterns that might indicate pupil data
 * Pupil data is NEVER allowed: no names, photos, audio, identifiers, or profiles
 */
export function validatePrivacy(text: string): PrivacyCheckResult {
  const violations: string[] = [];
  const lowerText = text.toLowerCase();

  for (const { pattern, name } of FORBIDDEN_PATTERNS) {
    if (pattern.test(lowerText)) {
      violations.push(`"${name}" detected - not allowed`);
    }
  }

  return { valid: violations.length === 0, violations };
}