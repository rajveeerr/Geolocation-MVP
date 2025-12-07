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
 * Formats deal type name for frontend display
 * Converts backend names to user-friendly frontend labels
 */
export function formatDealTypeForDisplay(dealType: string | { name: string } | null | undefined): string {
  if (!dealType) return 'Item Deal';
  
  const typeName = typeof dealType === 'string' ? dealType : dealType.name;
  
  // Map backend names to frontend display names
  const displayMapping: Record<string, string> = {
    'Standard': 'Item Deal',
    'STANDARD': 'Item Deal',
    'Happy Hour': 'Happy Hour',
    'HAPPY_HOUR': 'Happy Hour',
    'Recurring Deal': 'Daily Deal',
    'RECURRING': 'Daily Deal',
    'Bounty Deal': 'Bounty Deal',
    'BOUNTY': 'Bounty Deal',
    'Hidden Deal': 'Hidden Deal',
    'HIDDEN': 'Hidden Deal',
    'Redeem Now': 'Redeem Now',
    'REDEEM_NOW': 'Redeem Now',
  };
  
  return displayMapping[typeName] || typeName || 'Item Deal';
}

/**
 * Gets required fields for a specific deal type
 */
export function getDealTypeRequirements(dealType: string | null): string[] {
  if (!dealType) return [];

  const requirements: Record<string, string[]> = {
    'BOUNTY': ['bountyRewardAmount', 'minReferralsRequired'],
    'HIDDEN': [], // accessCode is optional (auto-generated)
    'REDEEM_NOW': ['discountPercentage', 'minOrderAmount'],
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
    // Redeem Now deals are fixed at 50% off
    if (!state.discountPercentage || state.discountPercentage !== 50) {
      errors.push('Redeem Now deals must have exactly 50% discount');
    }
    
    // Validate minimum order amount is required
    if (!state.minOrderAmount || state.minOrderAmount <= 0) {
      errors.push('Minimum order amount is required for Redeem Now deals');
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

  // Recurring Deal / Daily Deal validation
  if (dealType === 'RECURRING') {
    if (!state.recurringDays || state.recurringDays.length === 0) {
      errors.push('Please select at least one day for recurring deals');
    }
    
    // Frequency is required for Daily Deals
    if (!state.recurringFrequency) {
      errors.push('Please select a frequency (week/month/year) for your daily deal');
    }
    
    // Date range is required
    if (!state.activeStartDate || !state.activeEndDate) {
      errors.push('Please set a start and end date for your daily deal');
    }
    
    // Validate date range
    if (state.activeStartDate && state.activeEndDate) {
      const start = new Date(state.activeStartDate);
      const end = new Date(state.activeEndDate);
      if (end <= start) {
        errors.push('End date must be after start date');
      }
    }
    
    // Streak validation (if enabled)
    if (state.streakEnabled) {
      if (!state.streakMinVisits || state.streakMinVisits < 2) {
        errors.push('Minimum consecutive visits must be at least 2');
      }
      if (!state.streakRewardType) {
        errors.push('Please select a streak reward type (percentage or amount)');
      }
      if (!state.streakRewardValue || state.streakRewardValue <= 0) {
        errors.push('Streak reward value must be greater than 0');
      }
    }
    
    // Bounty validation (if enabled)
    if (state.bountyRewardAmount && state.bountyRewardAmount > 0) {
      if (!state.minReferralsRequired || state.minReferralsRequired < 1) {
        errors.push('Minimum referrals required must be at least 1 when bounty is enabled');
      }
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

