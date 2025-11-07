// Hook for fetching heist statistics

import { useQuery } from '@tanstack/react-query';
import { getHeistStats } from '@/services/heistService';
import type { HeistStats } from '@/types/heist';

export function useHeistStats() {
  return useQuery<HeistStats, Error>({
    queryKey: ['heist', 'stats'],
    queryFn: getHeistStats,
    staleTime: 60 * 1000, // 1 minute
  });
}

