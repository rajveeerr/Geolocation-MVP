// Hook for fetching heist token balance

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHeistTokens } from '@/services/heistService';
import type { TokenBalance } from '@/types/heist';

export function useHeistTokens() {
  return useQuery<TokenBalance, Error>({
    queryKey: ['heist', 'tokens'],
    queryFn: getHeistTokens,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to invalidate token balance cache
 * Use this after executing a heist or earning a token
 */
export function useInvalidateHeistTokens() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['heist', 'tokens'] });
  };
}

