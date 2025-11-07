// web/src/utils/dealTypeUtils.ts
import type { DealCreationState } from '@/context/DealCreationContext';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Maps frontend deal type to backend deal type name
 */
export function mapDealTypeToBackend(frontendType: string | null): string {
  const mapping: Record<string, string> = {
    'STANDARD': 'Standard',
    'HAPPY_HOUR': 'Happy Hour',
    'RECURRING': 'Recurring Deal',
    'BOUNTY': 'Bounty Deal',
    'HIDDEN': 'Hidden Deal',
    'REDEEM_NOW': 'Redeem Now',
  };

  if (!frontendType) {
    return 'Standard';
  }

  return mapping[frontendType] || 'Standard';
}

/**
 * Gets required fields for a specific deal type
 */
export function getDealTypeRequirements(dealType: string | null): string[] {
  if (!dealType) return [];

  const requirements: Record<string, string[]> = {
    'BOUNTY': ['bountyRewardAmount', 'minReferralsRequired'],
    'HIDDEN': [], // accessCode is optional (auto-generated)
    'REDEEM_NOW': ['discountPercentage'],
    'RECURRING': ['recurringDays'],
  };

  return requirements[dealType] || [];
}

/**
 * Validates deal type specific data
 */
export function validateDealTypeData(
  dealType: string | null,
  state: DealCreationState
): ValidationResult {
  const errors: string[] = [];

  if (!dealType) {
    return { isValid: false, errors: ['Deal type is required'] };
  }

  // Bounty Deal validation
  if (dealType === 'BOUNTY') {
    if (!state.bountyRewardAmount || state.bountyRewardAmount <= 0) {
      errors.push('Bounty reward amount is required and must be positive');
    }
    if (!state.minReferralsRequired || state.minReferralsRequired < 1) {
      errors.push('Minimum referrals required must be at least 1');
    }
  }

  // Redeem Now validation
  if (dealType === 'REDEEM_NOW') {
    if (!state.discountPercentage || state.discountPercentage <= 0) {
      errors.push('Discount percentage is required for Redeem Now deals');
    }
    
    // Validate 24-hour duration
    if (state.startTime && state.endTime) {
      const start = new Date(state.startTime);
      const end = new Date(state.endTime);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      if (durationHours > 24) {
        errors.push('Redeem Now deals must be 24 hours or less');
      }
    }
  }

  // Recurring Deal validation
  if (dealType === 'RECURRING') {
    if (!state.recurringDays || state.recurringDays.length === 0) {
      errors.push('Please select at least one day for recurring deals');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generates a random access code for hidden deals
 */
export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

