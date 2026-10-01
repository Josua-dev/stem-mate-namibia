// STEMMate Namibia - Kit Clash Detector
// Detects date overlaps for kit requests
// Version: v1.0.0

import type { KitRequest } from '../types';

export interface ClashResult {
  hasClash: boolean;
  conflictingRequest?: KitRequest;
  message: string;
}

/**
 * Check if a new kit request clashes with existing requests
 * A clash occurs when the same kit is requested for the same or overlapping dates
 */
export function detectKitClash(
  newRequest: { kitName: string; intendedDate: string },
  existingRequests: KitRequest[]
): ClashResult {
  // Parse the intended date
  const newDate = new Date(newRequest.intendedDate);

  // Check for exact date match
  const exactMatch = existingRequests.find(request => {
    if (request.kitName.toLowerCase() !== newRequest.kitName.toLowerCase()) {
      return false;
    }

    const requestDate = new Date(request.intendedDate);
    return requestDate.toDateString() === newDate.toDateString();
  });

  if (exactMatch) {
    return {
      hasClash: true,
      conflictingRequest: exactMatch,
      message: `⚠ Clash Detected: Kit "${newRequest.kitName}" is already requested for ${newDate.toDateString()} by "${exactMatch.responsibleFacilitator}". Please choose a different date or kit.`
    };
  }

  // Check for same-day conflicts (different date formats)
  const sameDayConflict = existingRequests.find(request => {
    if (request.kitName.toLowerCase() !== newRequest.kitName.toLowerCase()) {
      return false;
    }

    const requestDate = new Date(request.intendedDate);
    const timeDiff = Math.abs(requestDate.getTime() - newDate.getTime());
    const dayDiff = timeDiff / (1000 * 60 * 60 * 24);

    return dayDiff === 0;
  });

  if (sameDayConflict) {
    return {
      hasClash: true,
      conflictingRequest: sameDayConflict,
      message: `⚠ Clash Detected: Kit "${newRequest.kitName}" is already requested for the same date by "${sameDayConflict.responsibleFacilitator}".`
    };
  }

  // No clash found
  return {
    hasClash: false,
    conflictingRequest: undefined,
    message: 'No clashes detected. This kit is available for the selected date.'
  };
}

/**
 * Get all clashes for a kit request
 */
export function getAllClashes(
  kitName: string,
  intendedDate: string,
  existingRequests: KitRequest[]
): ClashResult[] {
  const clashes: ClashResult[] = [];
  const newDate = new Date(intendedDate);

  for (const request of existingRequests) {
    if (request.kitName.toLowerCase() !== kitName.toLowerCase()) {
      continue;
    }

    const requestDate = new Date(request.intendedDate);
    const timeDiff = Math.abs(requestDate.getTime() - newDate.getTime());
    const dayDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (dayDiff === 0) {
      clashes.push({
        hasClash: true,
        conflictingRequest: request,
        message: `Clash with existing request by "${request.responsibleFacilitator}"`
      });
    }
  }

  return clashes;
}

/**
 * Validate kit request data
 */
export function validateKitRequest(request: {
  kitName: string;
  intendedDate: string;
  responsibleFacilitator: string;
}): string[] {
  const errors: string[] = [];

  if (!request.kitName.trim()) {
    errors.push('Kit name is required');
  }

  if (!request.intendedDate) {
    errors.push('Intended date is required');
  } else {
    const date = new Date(request.intendedDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }

  if (!request.responsibleFacilitator.trim()) {
    errors.push('Responsible facilitator is required');
  }

  return errors;
}