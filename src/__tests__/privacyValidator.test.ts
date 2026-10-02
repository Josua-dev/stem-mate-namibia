// Unit tests for the privacy validator (STE MMate Namibia v1.0.0)
// Pupils are never users: no pupil name, photo, audio, identifier or profile
// may exist anywhere.
import { describe, it, expect } from 'vitest';
import { validatePrivacy } from '../utils/privacyValidator';
import type { PrivacyContext } from '../types';

const cleanContext = (): PrivacyContext => ({
  title: 'Water Cycle Simulation',
  description: 'Students create a mini-water cycle using household materials.',
  notes: '',
  safetyNotes: 'Supervise use of scissors. Ensure all materials are clean.',
  facilitator: '',
  materials: ['cup', 'water', 'plastic wrap'],
  steps: ['Fill the cup with water', 'Cover with plastic wrap'],
  inclusionPrompts: ['Offer alternative materials for allergies'],
});

describe('validatePrivacy — legitimate content passes', () => {
  it('accepts a clean activity with no pupil data', () => {
    const result = validatePrivacy(cleanContext());

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('accepts everyday instructional words that mention students', () => {
    const context = cleanContext();
    context.description = 'Divide the class into groups. Students record their observations.';

    expect(validatePrivacy(context).valid).toBe(true);
  });

  it('accepts counts written as plain numbers', () => {
    const context = cleanContext();
    context.description = '150 learners attended the science fair.';

    expect(validatePrivacy(context).valid).toBe(true);
  });

  it('accepts adult facilitator names (heuristics do not run on facilitator)', () => {
    const context = cleanContext();
    context.facilitator = 'Anna Shikongo';

    expect(validatePrivacy(context).valid).toBe(true);
  });

  it('accepts title-case activity titles (heuristics do not run on title)', () => {
    const context = cleanContext();
    context.title = 'Water Cycle Simulation for Katutura Community Centre';

    expect(validatePrivacy(context).valid).toBe(true);
  });
});

describe('validatePrivacy — pupil data references are blocked', () => {
  it('blocks "pupil name" references', () => {
    const context = cleanContext();
    context.description = 'Write each pupil name on the attendance sheet.';

    const result = validatePrivacy(context);
    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.includes('pupil data reference'))).toBe(true);
  });

  it('blocks "learner photo" references', () => {
    const context = cleanContext();
    context.notes = 'Attach a learner photo to the report.';

    const result = validatePrivacy(context);
    expect(result.valid).toBe(false);
  });

  it('blocks "photo of the pupil" (reversed phrasing)', () => {
    const context = cleanContext();
    context.description = 'Take a photo of the pupil during the experiment.';

    expect(validatePrivacy(context).valid).toBe(false);
  });

  it('blocks possessives like "learner\'s marks"', () => {
    const context = cleanContext();
    context.notes = 'Record the learner\'s marks in the register.';

    expect(validatePrivacy(context).valid).toBe(false);
  });

  it('blocks pupil data typed in array fields (inclusion prompts)', () => {
    const context = cleanContext();
    context.inclusionPrompts = ['Write each pupil name on the seating chart'];

    const result = validatePrivacy(context);
    expect(result.valid).toBe(false);
  });
});

describe('validatePrivacy — identifiers are blocked', () => {
  it('blocks S-prefixed student numbers', () => {
    const context = cleanContext();
    context.description = 'Check equipment out to S223078816.';

    const result = validatePrivacy(context);
    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.includes('student ID number'))).toBe(true);
  });

  it('blocks ID-prefixed numbers', () => {
    const context = cleanContext();
    context.notes = 'ID: 20230123';

    const result = validatePrivacy(context);
    expect(result.valid).toBe(false);
  });

  it('flags bare 5-digit numbers in free text', () => {
    const context = cleanContext();
    context.description = 'Register number 20231 was issued.';

    const result = validatePrivacy(context);
    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.includes('Possible identifier'))).toBe(true);
  });
});

describe('validatePrivacy — heuristics for typed names', () => {
  it('flags capitalized full names in free-text fields', () => {
    const context = cleanContext();
    context.description = 'John Smith will demonstrate the experiment.';

    const result = validatePrivacy(context);
    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.includes('Possible pupil name'))).toBe(true);
  });

  it('does not flag capitalized names in the facilitator field', () => {
    const context = cleanContext();
    context.facilitator = 'John Smith';

    expect(validatePrivacy(context).valid).toBe(true);
  });
});
