import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import loyaltyService from '@/services/loyaltyService';
import type {
  LoyaltyAnalyticsResponse,
  LoyaltyCustomersResponse,
  LoyaltyProgramConfig,
  LoyaltyProgramResponse,
  LoyaltyTransactionsResponse,
  AdjustPointsPayload,
  AdjustPointsResponse,
  CancelRedemptionPayload,
  CancelRedemptionResponse,
} from '@/types/loyalty';

export const MERCHANT_LOYALTY_KEYS = {
  program: ['merchant', 'loyalty', 'program'] as const,
  analytics: ['merchant', 'loyalty', 'analytics'] as const,
  customers: (limit: number, offset: number, sortBy: string, order: string) =>
    ['merchant', 'loyalty', 'customers', limit, offset, sortBy, order] as const,
  transactions: (limit: number, offset: number, type?: string) =>
    ['merchant', 'loyalty', 'tx', limit, offset, type] as const,
};

export function useMerchantLoyaltyProgram() {
  return useQuery<LoyaltyProgramResponse>({
    queryKey: MERCHANT_LOYALTY_KEYS.program,
    queryFn: () => loyaltyService.getMerchantProgram(),
    staleTime: 5 * 60_000,
    retry: false, // Don't retry on 404 (program not initialized)
  });
}

export function useInitializeLoyaltyProgram() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; program: any; message: string }, unknown, Partial<LoyaltyProgramConfig>>({
    mutationFn: (payload) => loyaltyService.initializeProgram(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LOYALTY_KEYS.program });
    },
  });
}

export function useUpdateLoyaltyProgram() {
  const queryClient = useQueryClient();
  return useMutation<LoyaltyProgramResponse, unknown, Partial<LoyaltyProgramConfig>>({
    mutationFn: (payload) => loyaltyService.updateMerchantProgram(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LOYALTY_KEYS.program });
    },
  });
}

export function useSetProgramStatus() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, unknown, { isActive: boolean }>({
    mutationFn: ({ isActive }) => loyaltyService.setProgramStatus(isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LOYALTY_KEYS.program });
      queryClient.invalidateQueries({ queryKey: MERCHANT_LOYALTY_KEYS.analytics });
    },
  });
}

export function useLoyaltyAnalytics() {
  return useQuery<LoyaltyAnalyticsResponse>({
    queryKey: MERCHANT_LOYALTY_KEYS.analytics,
    queryFn: () => loyaltyService.getAnalytics(),
    staleTime: 60_000,
    retry: false, // Don't retry on errors (program might not exist)
  });
}

export function useLoyaltyCustomers(limit = 50, offset = 0, sortBy = 'currentBalance', order: 'asc' | 'desc' = 'desc') {
  return useQuery<LoyaltyCustomersResponse>({
    queryKey: MERCHANT_LOYALTY_KEYS.customers(limit, offset, sortBy, order),
    queryFn: () => loyaltyService.getCustomers({ limit, offset, sortBy, order }),
    keepPreviousData: true,
  });
}

export function useAdjustLoyaltyPoints() {
  const queryClient = useQueryClient();
  return useMutation<AdjustPointsResponse, unknown, AdjustPointsPayload>({
    mutationFn: (payload) => loyaltyService.adjustPoints(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LOYALTY_KEYS.customers(50, 0, 'currentBalance', 'desc') });
      queryClient.invalidateQueries({ queryKey: MERCHANT_LOYALTY_KEYS.analytics });
    },
  });
}

export function useCancelLoyaltyRedemption() {
  const queryClient = useQueryClient();
  return useMutation<CancelRedemptionResponse, unknown, CancelRedemptionPayload>({
    mutationFn: (payload) => loyaltyService.cancelRedemption(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANT_LOYALTY_KEYS.analytics });
    },
  });
}

export function useMerchantLoyaltyTransactions(limit = 50, offset = 0, type?: string) {
  return useQuery<LoyaltyTransactionsResponse>({
    queryKey: MERCHANT_LOYALTY_KEYS.transactions(limit, offset, type),
    queryFn: () => loyaltyService.getMerchantTransactions(limit, offset, type),
    keepPreviousData: true,
  });
}


