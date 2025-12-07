// Hook for checking heist eligibility

import { useQuery } from '@tanstack/react-query';
import { checkHeistEligibility } from '@/services/heistService';
import type { HeistEligibilityResponse } from '@/types/heist';

export function useHeistEligibility(victimId: number | null, enabled: boolean = true) {
  return useQuery<HeistEligibilityResponse, Error>({
    queryKey: ['heist', 'eligibility', victimId],
    queryFn: () => {
      if (!victimId) {
        throw new Error('Victim ID is required');
      }
      return checkHeistEligibility(victimId);
    },
    enabled: enabled && victimId !== null,
    staleTime: 10 * 1000, // 10 seconds
    retry: false, // Don't retry on eligibility checks
  });
}

