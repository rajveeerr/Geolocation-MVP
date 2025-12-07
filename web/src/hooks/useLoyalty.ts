import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import loyaltyService from '@/services/loyaltyService';
import type {
  LoyaltyBalancesResponse,
  LoyaltyBalance,
  RedemptionOptionsResponse,
  LoyaltyTransactionsResponse,
  ValidateRedemptionResponse,
  CalculatePointsResponse,
  CalculateRedemptionResponse,
} from '@/types/loyalty';

export const LOYALTY_KEYS = {
  balances: ['loyalty', 'balances'] as const,
  balance: (merchantId: number) => ['loyalty', 'balance', merchantId] as const,
  program: (merchantId: number) => ['loyalty', 'program', merchantId] as const,
  options: (merchantId: number) => ['loyalty', 'options', merchantId] as const,
  transactions: (merchantId: number, limit: number, offset: number) =>
    ['loyalty', 'tx', merchantId, limit, offset] as const,
};

export function useLoyaltyBalances() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: LOYALTY_KEYS.balances,
    queryFn: () => loyaltyService.getAllBalances(),
    enabled: !!localStorage.getItem('authToken'),
    staleTime: 60_000,
    retry: 1,
  });

  const totalPoints = (data?.totalPoints ?? 0) as number;

  return {
    balancesResponse: data as LoyaltyBalancesResponse | undefined,
    totalPoints,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

export function useLoyaltyBalance(merchantId: number) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: LOYALTY_KEYS.balance(merchantId),
    queryFn: () => loyaltyService.getBalance(merchantId),
    enabled: !!localStorage.getItem('authToken') && !!merchantId,
    staleTime: 30_000,
    retry: 1,
  });

  return {
    balance: data?.balance as LoyaltyBalance | undefined,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

export function useLoyaltyProgram(merchantId: number) {
  return useQuery({
    queryKey: LOYALTY_KEYS.program(merchantId),
    queryFn: () => loyaltyService.getProgram(merchantId),
    enabled: !!merchantId,
    staleTime: 5 * 60_000,
  });
}

export function useRedemptionOptions(merchantId: number) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: LOYALTY_KEYS.options(merchantId),
    queryFn: () => loyaltyService.getRedemptionOptions(merchantId),
    enabled: !!localStorage.getItem('authToken') && !!merchantId,
    staleTime: 30_000,
  });

  return {
    options: (data as RedemptionOptionsResponse | undefined)?.tiers,
    currentBalance: (data as RedemptionOptionsResponse | undefined)?.currentBalance,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

export function useLoyaltyTransactions(merchantId: number, limit = 50, offset = 0) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: LOYALTY_KEYS.transactions(merchantId, limit, offset),
    queryFn: () => loyaltyService.getTransactions(merchantId, limit, offset),
    enabled: !!localStorage.getItem('authToken') && !!merchantId,
    staleTime: 15_000,
  });

  return {
    transactionsResponse: data as LoyaltyTransactionsResponse | undefined,
    isLoading: isLoading || isFetching,
    error,
    refetch,
  };
}

export function useValidateRedemption() {
  return useMutation<{ data: ValidateRedemptionResponse }, unknown, { merchantId: number; points: number; orderAmount: number }>(
    {
      mutationFn: ({ merchantId, points, orderAmount }) =>
        loyaltyService.validateRedemption(merchantId, points, orderAmount) as unknown as Promise<{
          data: ValidateRedemptionResponse;
        }>,
    }
  );
}

export function useCalculatePoints() {
  return useMutation<{ data: CalculatePointsResponse }, unknown, { merchantId: number; amount: number }>({
    mutationFn: ({ merchantId, amount }) =>
      loyaltyService.calculatePoints(merchantId, amount) as unknown as Promise<{ data: CalculatePointsResponse }>,
  });
}

export function useCalculateRedemption() {
  return useMutation<{ data: CalculateRedemptionResponse }, unknown, { merchantId: number; points: number }>({
    mutationFn: ({ merchantId, points }) =>
      loyaltyService.calculateRedemption(merchantId, points) as unknown as Promise<{ data: CalculateRedemptionResponse }>,
  });
}

export function useLoyaltyCache() {
  const queryClient = useQueryClient();

  const updateBalanceCache = (merchantId: number, next: Partial<LoyaltyBalance>) => {
    queryClient.setQueryData(LOYALTY_KEYS.balance(merchantId), (prev: any) => ({
      ...(prev || {}),
      balance: {
        ...(prev?.balance || {}),
        ...next,
      },
    }));
  };

  return { updateBalanceCache };
}


