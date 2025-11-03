import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { calculateStreakDiscount, fetchDiscountTiers, fetchStreak } from '@/lib/api/streak';
import type { DiscountCalculation, DiscountTier, StreakInfo } from '@/types/streak';

export const STREAK_QUERY_KEY = ['streak'];
export const STREAK_TIERS_QUERY_KEY = ['streak-tiers'];

export function useStreak() {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: STREAK_QUERY_KEY,
    queryFn: async () => {
      const res = await fetchStreak();
      return (res.data as any)?.streak as StreakInfo;
    },
    staleTime: 60_000,
    retry: 1,
    enabled: !!localStorage.getItem('authToken'),
  });

  const tiersQuery = useQuery({
    queryKey: STREAK_TIERS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetchDiscountTiers();
      return (res.data as any)?.tiers as DiscountTier[];
    },
    staleTime: Infinity,
  });

  const updateCache = (next: Partial<StreakInfo>) => {
    queryClient.setQueryData(STREAK_QUERY_KEY, (prev: any) => ({
      ...(prev as StreakInfo | undefined),
      ...(next as StreakInfo),
    }));
  };

  return {
    streak: data,
    isLoading: isLoading || isFetching,
    refetch,
    tiers: tiersQuery.data,
    isLoadingTiers: tiersQuery.isLoading,
    updateCache,
  };
}

export function useStreakDiscount() {
  const mutation = useMutation({
    mutationFn: (orderAmount: number) =>
      calculateStreakDiscount(orderAmount).then((res) =>
        (res.data as any)?.discount as DiscountCalculation,
      ),
  });

  return mutation;
}


