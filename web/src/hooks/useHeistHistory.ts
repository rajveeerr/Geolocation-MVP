// Hook for fetching heist history

import { useQuery } from '@tanstack/react-query';
import { getHeistHistory } from '@/services/heistService';
import type { HeistHistoryResponse } from '@/types/heist';

export interface UseHeistHistoryParams {
  role?: 'attacker' | 'victim' | 'both';
  status?: string;
  limit?: number;
  offset?: number;
}

export function useHeistHistory(params?: UseHeistHistoryParams) {
  return useQuery<HeistHistoryResponse, Error>({
    queryKey: ['heist', 'history', params],
    queryFn: () => getHeistHistory(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

