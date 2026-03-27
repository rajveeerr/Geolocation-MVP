import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api';

export interface KittyGame {
  id: number;
  title?: string;
  name?: string;
  description?: string | null;
  status?: string;
  jackpotCoins?: number;
  guessCostCoins?: number;
  minGuess?: number;
  maxGuess?: number;
  merchantId?: number;
  closesAt?: string | null;
}

export interface KittyGameDetail extends KittyGame {
  userGuess?: number | null;
  remainingAttempts?: number | null;
  rules?: string | null;
}

export interface KittyGuessResult {
  correct?: boolean;
  hint?: string;
  difference?: number;
  remainingAttempts?: number;
  coinsSpent?: number;
  message?: string;
}

export interface BountyDashboard {
  activeBounties?: unknown[];
  completedBounties?: unknown[];
  totalEarned?: number;
  totalReferrals?: number;
}

export function useKittyGames(merchantId?: number) {
  return useQuery<KittyGame[]>({
    queryKey: ['kittyGames', merchantId ?? 'all'],
    queryFn: async () => {
      const response = await apiGet<KittyGame[]>(`/kitty/games${merchantId ? `?merchantId=${merchantId}` : ''}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load games');
      }
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useKittyGameDetail(gameId: number | null) {
  return useQuery<KittyGameDetail>({
    queryKey: ['kittyGame', gameId],
    queryFn: async () => {
      const response = await apiGet<KittyGameDetail>(`/kitty/games/${gameId}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load game details');
      }
      return response.data;
    },
    enabled: !!gameId,
    staleTime: 30 * 1000,
  });
}

export function useSubmitKittyGuess(gameId: number | null) {
  const queryClient = useQueryClient();

  return useMutation<KittyGuessResult, Error, { guessValue: number }>({
    mutationFn: async ({ guessValue }) => {
      const response = await apiPost<KittyGuessResult, { guessValue: number }>(`/kitty/games/${gameId}/guess`, {
        guessValue,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to submit guess');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kittyGame', gameId] });
      queryClient.invalidateQueries({ queryKey: ['kittyGames'] });
    },
  });
}

export function useBountyDashboard() {
  return useQuery<BountyDashboard>({
    queryKey: ['kittyBountyDashboard'],
    queryFn: async () => {
      const response = await apiGet<BountyDashboard>('/kitty/bounty/dashboard');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load bounty dashboard');
      }
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useStartBounty() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { dealId: number }>({
    mutationFn: async ({ dealId }) => {
      const response = await apiPost<unknown, { dealId: number }>('/kitty/bounty/start', { dealId });
      if (!response.success) {
        throw new Error(response.error || 'Failed to join bounty');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kittyBountyDashboard'] });
    },
  });
}
