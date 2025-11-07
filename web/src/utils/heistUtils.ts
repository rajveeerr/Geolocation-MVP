// Utility functions for heist feature

import type { HeistEligibilityResponse } from '@/types/heist';

/**
 * Format time remaining in a human-readable format
 */
export function formatTimeRemaining(hours: number): string {
  if (hours < 1) {
    const minutes = Math.ceil(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.ceil((hours - wholeHours) * 60);
    if (minutes > 0) {
      return `${wholeHours}h ${minutes}m`;
    }
    return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  
  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }
  return `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Get user-friendly error message from eligibility response
 */
export function getEligibilityErrorMessage(eligibility: HeistEligibilityResponse): string {
  if (eligibility.eligible) {
    return '';
  }
  
  if (eligibility.reason) {
    return eligibility.reason;
  }
  
  // Fallback based on checks
  if (!eligibility.checks.sufficientTokens) {
    return 'You need at least 1 Heist Token. Refer friends to earn tokens!';
  }
  
  if (!eligibility.checks.notOnCooldown) {
    const hours = eligibility.details?.hoursRemaining || 0;
    return `You can perform another heist in ${formatTimeRemaining(hours)}`;
  }
  
  if (!eligibility.checks.targetNotProtected) {
    const hours = eligibility.details?.hoursRemaining || 0;
    return `This player is protected for ${formatTimeRemaining(hours)}`;
  }
  
  if (!eligibility.checks.targetHasSufficientPoints) {
    return `Target must have at least ${eligibility.details?.minimumRequired || 20} points`;
  }
  
  if (!eligibility.checks.notAlreadyRobbed) {
    return eligibility.reason || 'You have already robbed this user. You cannot rob the same person twice.';
  }
  
  if (!eligibility.checks.withinDailyLimit) {
    return `You have reached the daily heist limit of ${eligibility.details?.limit || 3}`;
  }
  
  return 'Unable to perform heist at this time';
}

/**
 * Calculate potential steal amount from victim points
 */
export function calculatePotentialSteal(victimPoints: number, stealPercentage: number = 0.05, maxSteal: number = 100): number {
  const calculated = Math.floor(victimPoints * stealPercentage);
  return Math.min(calculated, maxSteal);
}

/**
 * Format points with proper sign
 */
export function formatPointsChange(points: number): string {
  if (points > 0) {
    return `+${points}`;
  }
  return points.toString();
}

/**
 * Get status badge color
 */
export function getHeistStatusColor(status: string): string {
  switch (status) {
    case 'SUCCESS':
      return 'bg-green-100 text-green-800';
    case 'FAILED_COOLDOWN':
    case 'FAILED_TARGET_PROTECTED':
    case 'FAILED_SHIELD':
      return 'bg-yellow-100 text-yellow-800';
    case 'FAILED_INSUFFICIENT_POINTS':
    case 'FAILED_INSUFFICIENT_TOKENS':
    case 'FAILED_INVALID_TARGET':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'HEIST_SUCCESS':
      return '🎯';
    case 'HEIST_VICTIM':
      return '🚨';
    case 'TOKEN_EARNED':
      return '🪙';
    case 'SHIELD_ACTIVATED':
      return '🛡️';
    case 'SHIELD_EXPIRED':
      return '⏰';
    default:
      return '📢';
  }
}

