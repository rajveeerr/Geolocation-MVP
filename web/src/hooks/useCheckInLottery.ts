import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/services/api';

export type CheckInLotteryRewardType = 'CASH' | 'FREE_REWARD' | 'COINS';
export type CheckInLotteryStatus = 'SCHEDULED' | 'ACTIVE' | 'DRAWN' | 'CANCELLED';

export interface CheckInLotteryGame {
  id: string;
  title: string;
  startAt: string;
  cutoffAt: string;
  drawAt: string;
  rewardType: CheckInLotteryRewardType;
  rewardValue: number;
  rewardLabel?: string;
  status: CheckInLotteryStatus;
  winnerUserId?: number;
  winnerCheckInId?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  totalEntries: number;
}

export interface CurrentLotteryUserStatus {
  game: CheckInLotteryGame | null;
  entered: boolean;
  eligible: boolean;
  totalEntries: number;
}

export interface CreateCheckInLotteryPayload {
  title: string;
  startAt: string;
  cutoffAt: string;
  drawAt: string;
  rewardType: CheckInLotteryRewardType;
  rewardValue: number;
  rewardLabel?: string;
}

const ADMIN_GAMES_QUERY_KEY = ['admin', 'checkinLotteryGames'];
const ADMIN_CURRENT_QUERY_KEY = ['admin', 'checkinLotteryCurrent'];
const USER_CURRENT_QUERY_KEY = ['user', 'checkinLotteryCurrent'];

export function useAdminCheckInLotteryGames(limit = 20) {
  return useQuery<CheckInLotteryGame[]>({
    queryKey: [...ADMIN_GAMES_QUERY_KEY, limit],
    queryFn: async () => {
      const res = await apiGet<CheckInLotteryGame[]>(`/admin/games/checkin-lottery/list?limit=${limit}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load check-in lottery games');
      }
      return res.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useAdminCurrentCheckInLotteryGame() {
  return useQuery<CheckInLotteryGame | null>({
    queryKey: ADMIN_CURRENT_QUERY_KEY,
    queryFn: async () => {
      const res = await apiGet<CheckInLotteryGame | null>('/admin/games/checkin-lottery/current');
      if (!res.success) {
        throw new Error(res.error || 'Failed to load current check-in lottery game');
      }
      return (res.data ?? null) as CheckInLotteryGame | null;
    },
    staleTime: 15 * 1000,
  });
}

export function useCreateCheckInLotteryGame() {
  const queryClient = useQueryClient();
  return useMutation<CheckInLotteryGame, Error, CreateCheckInLotteryPayload>({
    mutationFn: async (payload) => {
      const res = await apiPost<CheckInLotteryGame, CreateCheckInLotteryPayload>('/admin/games/checkin-lottery/create', payload);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create check-in lottery game');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GAMES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_CURRENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_CURRENT_QUERY_KEY });
    },
  });
}

export function useResolveCheckInLotteryGame() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: async (gameId) => {
      const res = await apiPut<unknown, Record<string, never>>(`/admin/games/checkin-lottery/${gameId}/resolve`, {});
      if (!res.success) {
        throw new Error(res.error || 'Failed to resolve game');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GAMES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_CURRENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_CURRENT_QUERY_KEY });
    },
  });
}

export function useCancelCheckInLotteryGame() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: async (gameId) => {
      const res = await apiPut<unknown, Record<string, never>>(`/admin/games/checkin-lottery/${gameId}/cancel`, {});
      if (!res.success) {
        throw new Error(res.error || 'Failed to cancel game');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GAMES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_CURRENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_CURRENT_QUERY_KEY });
    },
  });
}

export function useUserCheckInLotteryStatus() {
  return useQuery<CurrentLotteryUserStatus>({
    queryKey: USER_CURRENT_QUERY_KEY,
    queryFn: async () => {
      const res = await apiGet<CurrentLotteryUserStatus>('/checkin-lottery/current');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load current lottery status');
      }
      return res.data;
    },
    staleTime: 15 * 1000,
  });
}
