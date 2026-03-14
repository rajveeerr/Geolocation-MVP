import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import type {
  AISurpriseSuggestion,
  CreateSurpriseDealPayload,
  MerchantSurpriseDeal,
  NearbySurprise,
  RevealHistoryItem,
  SurpriseAnalytics,
  SurpriseDealDetail,
  SurpriseRevealResponse,
} from '@/types/surprises';

const KEYS = {
  nearby: (lat: number, lng: number, radius: number) =>
    ['surprises', 'nearby', lat, lng, radius] as const,
  deal: (dealId: number) => ['surprises', 'deal', dealId] as const,
  myHistory: (page: number) => ['surprises', 'my-history', page] as const,
  merchantList: () => ['merchant', 'surprises'] as const,
  merchantAnalytics: (dealId: number) =>
    ['merchant', 'surprises', 'analytics', dealId] as const,
};

// ─── Consumer hooks ────────────────────────────────────────────────────────────

export const useNearbySurprises = (
  lat: number | null,
  lng: number | null,
  radius = 10,
) => {
  return useQuery({
    queryKey: KEYS.nearby(lat ?? 0, lng ?? 0, radius),
    queryFn: async () => {
      const res = await apiGet<{ surprises: NearbySurprise[]; count: number }>(
        `/surprises/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to load surprises');
      return res.data!;
    },
    enabled: lat !== null && lng !== null,
    // Poll every 60 s so RANDOM_DROP slot counts stay fresh
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};

export const useRevealSurprise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dealId,
      lat,
      lng,
    }: {
      dealId: number;
      lat?: number;
      lng?: number;
    }) =>
      apiPost<SurpriseRevealResponse, { lat?: number; lng?: number }>(
        `/surprises/${dealId}/reveal`,
        { lat, lng },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surprises'] });
    },
  });
};

export const useSurpriseDeal = (dealId: number | null) => {
  return useQuery({
    queryKey: KEYS.deal(dealId ?? 0),
    queryFn: async () => {
      const res = await apiGet<SurpriseDealDetail>(`/surprises/${dealId}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to load deal');
      return res.data!;
    },
    enabled: dealId !== null,
    staleTime: 30_000,
  });
};

export const useRedeemSurprise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dealId: number) =>
      apiPost<{ message: string }, Record<string, never>>(
        `/surprises/${dealId}/redeem`,
        {},
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surprises'] });
    },
  });
};

export const useMyRevealHistory = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: KEYS.myHistory(page),
    queryFn: async () => {
      const res = await apiGet<{
        reveals: RevealHistoryItem[];
        total: number;
        page: number;
        limit: number;
      }>(`/surprises/my/reveals?page=${page}&limit=${limit}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to load history');
      return res.data!;
    },
    staleTime: 60_000,
  });
};

// ─── Merchant hooks ────────────────────────────────────────────────────────────

export const useMerchantSurprises = () => {
  return useQuery({
    queryKey: KEYS.merchantList(),
    queryFn: async () => {
      const res = await apiGet<{ deals: MerchantSurpriseDeal[]; count: number }>(
        '/merchant/surprises',
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to load surprises');
      return res.data!;
    },
    staleTime: 30_000,
  });
};

export const useCreateSurpriseDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSurpriseDealPayload) =>
      apiPost<{ message: string; deal: MerchantSurpriseDeal }, CreateSurpriseDealPayload>(
        '/merchant/surprises',
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.merchantList() });
    },
  });
};

export const useUpdateSurpriseDeal = (dealId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateSurpriseDealPayload>) =>
      apiPut<{ message: string; deal: MerchantSurpriseDeal }, Partial<CreateSurpriseDealPayload>>(
        `/merchant/surprises/${dealId}`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.merchantList() });
    },
  });
};

export const useDeactivateSurpriseDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dealId: number) =>
      apiDelete<{ message: string }>(`/merchant/surprises/${dealId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.merchantList() });
    },
  });
};

export const useSurpriseAnalytics = (dealId: number | null) => {
  return useQuery({
    queryKey: KEYS.merchantAnalytics(dealId ?? 0),
    queryFn: async () => {
      const res = await apiGet<SurpriseAnalytics>(
        `/merchant/surprises/${dealId}/analytics`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to load analytics');
      return res.data!;
    },
    enabled: dealId !== null,
    staleTime: 60_000,
  });
};

export const useGenerateSurpriseAI = () => {
  return useMutation({
    mutationFn: ({
      intent,
      surpriseType,
    }: {
      intent: string;
      surpriseType?: string;
    }) =>
      apiPost<{ suggestion: AISurpriseSuggestion }, { intent: string; surpriseType?: string }>(
        '/ai/deals/surprise/generate',
        { intent, surpriseType },
      ),
  });
};
