// Unit tests for the kit clash detector (STE MMate Namibia v1.0.0)
import { describe, it, expect } from 'vitest';
import { detectKitClash, validateKitRequest, getAllClashes } from '../utils/clashDetector';
import type { KitRequest } from '../types';

const makeRequest = (overrides: Partial<KitRequest> = {}): KitRequest => ({
  id: 'req-1',
  kitName: 'Microscope Kit',
  intendedDate: '2026-10-10',
  responsibleFacilitator: 'Anna Shikongo',
  createdAt: '2026-10-01T08:00:00Z',
  status: 'current',
  ...overrides,
});

describe('detectKitClash', () => {
  it('flags an exact clash when the same kit is requested for the same date', () => {
    const existing = [makeRequest()];
    const result = detectKitClash(
      { kitName: 'Microscope Kit', intendedDate: '2026-10-10' },
      existing
    );

    expect(result.hasClash).toBe(true);
    expect(result.message).toContain('Clash Detected');
    expect(result.conflictingRequest?.responsibleFacilitator).toBe('Anna Shikongo');
  });

  it('matches kit names case-insensitively', () => {
    const existing = [makeRequest({ kitName: 'microscope kit' })];
    const result = detectKitClash(
      { kitName: 'Microscope Kit', intendedDate: '2026-10-10' },
      existing
    );

    expect(result.hasClash).toBe(true);
  });

  it('allows the same kit on a different date', () => {
    const existing = [makeRequest()];
    const result = detectKitClash(
      { kitName: 'Microscope Kit', intendedDate: '2026-10-17' },
      existing
    );

    expect(result.hasClash).toBe(false);
    expect(result.message).toContain('No clashes');
  });

  it('allows a different kit on the same date', () => {
    const existing = [makeRequest()];
    const result = detectKitClash(
      { kitName: 'Circuit Builder Kit', intendedDate: '2026-10-10' },
      existing
    );

    expect(result.hasClash).toBe(false);
  });

  it('finds no clash when there are no existing requests', () => {
    const result = detectKitClash(
      { kitName: 'Microscope Kit', intendedDate: '2026-10-10' },
      []
    );

    expect(result.hasClash).toBe(false);
  });

  it('ignores returned requests when only current ones are passed in', () => {
    const existing = [makeRequest({ status: 'returned' })];
    const result = detectKitClash(
      { kitName: 'Microscope Kit', intendedDate: '2026-10-10' },
      existing
    );

    // detectKitClash checks whatever list it is given; the page passes only
    // current requests, so a returned request in the list would still clash —
    // this test pins that the caller, not the detector, filters by status.
    expect(result.hasClash).toBe(true);
  });
});

describe('getAllClashes', () => {
  it('returns one clash per conflicting current request', () => {
    const existing = [
      makeRequest({ id: 'req-1', responsibleFacilitator: 'Anna Shikongo' }),
      makeRequest({ id: 'req-2', responsibleFacilitator: 'Peter Nangolo' }),
      makeRequest({ id: 'req-3', kitName: 'Circuit Builder Kit' }),
    ];
    const clashes = getAllClashes('Microscope Kit', '2026-10-10', existing);

    expect(clashes).toHaveLength(2);
  });

  it('returns an empty list when there are no conflicts', () => {
    const existing = [makeRequest()];
    const clashes = getAllClashes('Microscope Kit', '2026-10-17', existing);

    expect(clashes).toHaveLength(0);
  });
});

describe('validateKitRequest', () => {
  it('requires kit name, date and facilitator', () => {
    const errors = validateKitRequest({ kitName: '', intendedDate: '', responsibleFacilitator: '' });

    expect(errors).toHaveLength(3);
    expect(errors).toContain('Kit name is required');
    expect(errors).toContain('Intended date is required');
    expect(errors).toContain('Responsible facilitator is required');
  });

  it('accepts a complete request', () => {
    const errors = validateKitRequest({
      kitName: 'Microscope Kit',
      intendedDate: '2026-10-10',
      responsibleFacilitator: 'Anna Shikongo',
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects an unparseable date', () => {
    const errors = validateKitRequest({
      kitName: 'Microscope Kit',
      intendedDate: 'not-a-date',
      responsibleFacilitator: 'Anna Shikongo',
    });

    expect(errors).toContain('Invalid date format');
  });

  it('rejects whitespace-only names', () => {
    const errors = validateKitRequest({
      kitName: '   ',
      intendedDate: '2026-10-10',
      responsibleFacilitator: '  ',
    });

    expect(errors).toContain('Kit name is required');
    expect(errors).toContain('Responsible facilitator is required');
  });
});
