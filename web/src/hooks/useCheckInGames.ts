import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/services/api';

export type CheckInGameType = 'SCRATCH_CARD' | 'SPIN_WHEEL' | 'PICK_A_CARD';
export type CheckInGameRewardType =
  | 'DISCOUNT_PERCENTAGE'
  | 'DISCOUNT_FIXED'
  | 'FREE_ITEM'
  | 'COINS'
  | 'BONUS_POINTS';

export interface MerchantCheckInGameReward {
  id?: number;
  label: string;
  description?: string | null;
  imageUrl?: string | null;
  rewardType: CheckInGameRewardType;
  rewardValue: number;
  rewardLabel?: string | null;
  probabilityWeight: number;
  isActive: boolean;
  maxWins?: number | null;
  currentWins?: number;
}

export interface MerchantCheckInGameConfig {
  id?: number;
  merchantId?: number;
  isEnabled: boolean;
  gameType: CheckInGameType;
  title: string;
  subtitle?: string | null;
  accentColor?: string | null;
  cooldownMinutes: number;
  maxPlaysPerCheckIn: number;
  sessionExpiryMinutes: number;
  rewardExpiryHours: number;
  settings?: Record<string, unknown> | null;
  rewards: MerchantCheckInGameReward[];
}

export interface CheckInGameBoardSlot {
  index: number;
  rewardId: number;
  label: string;
  rewardType: CheckInGameRewardType;
  imageUrl?: string | null;
}

export interface CheckInGameIssuedReward {
  id: number;
  rewardType: CheckInGameRewardType;
  rewardValue: number;
  rewardLabel?: string | null;
  imageUrl?: string | null;
  claimCode: string;
  status: 'AVAILABLE' | 'REDEEMED' | 'EXPIRED';
  expiresAt?: string | null;
  createdAt: string;
}

export interface MerchantCheckInGameAnalytics {
  sessions: number;
  playedSessions: number;
  conversionRate: number;
  recentRewards: CheckInGameIssuedReward[];
  config?: MerchantCheckInGameConfig | null;
}

export interface CheckInGameSession {
  sessionToken: string;
  status: 'ELIGIBLE' | 'PLAYED' | 'EXPIRED';
  gameType: CheckInGameType;
  title: string;
  subtitle?: string | null;
  accentColor?: string | null;
  expiresAt: string;
  board: CheckInGameBoardSlot[];
  reward?: CheckInGameIssuedReward | null;
  resultSlot?: number | null;
}

const merchantConfigKey = ['merchant', 'checkInGames', 'config'];
const merchantAnalyticsKey = ['merchant', 'checkInGames', 'analytics'];

export function useMerchantCheckInGameConfig() {
  return useQuery<MerchantCheckInGameConfig>({
    queryKey: merchantConfigKey,
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: MerchantCheckInGameConfig }>('/merchants/check-in-games/config');
      const payload = response.data;
      if (!response.success || !payload?.success || !payload.data) {
        throw new Error(response.error || 'Failed to load check-in game config');
      }
      return payload.data;
    },
  });
}

export function useSaveMerchantCheckInGameConfig() {
  const queryClient = useQueryClient();

  return useMutation<MerchantCheckInGameConfig, Error, MerchantCheckInGameConfig>({
    mutationFn: async (payload) => {
      const response = await apiPut<{ success: boolean; data: MerchantCheckInGameConfig }, MerchantCheckInGameConfig>(
        '/merchants/check-in-games/config',
        payload,
      );
      const body = response.data;
      if (!response.success || !body?.success || !body.data) {
        throw new Error(response.error || 'Failed to save check-in game config');
      }
      return body.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: merchantConfigKey });
      queryClient.invalidateQueries({ queryKey: merchantAnalyticsKey });
    },
  });
}

export function useMerchantCheckInGameAnalytics() {
  return useQuery<MerchantCheckInGameAnalytics>({
    queryKey: merchantAnalyticsKey,
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: MerchantCheckInGameAnalytics }>('/merchants/check-in-games/analytics');
      const payload = response.data;
      if (!response.success || !payload?.success || !payload.data) {
        throw new Error(response.error || 'Failed to load analytics');
      }
      return payload.data;
    },
  });
}

export function useCheckInGameSession(sessionToken: string | null, enabled = true) {
  return useQuery<CheckInGameSession>({
    queryKey: ['checkInGameSession', sessionToken],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: CheckInGameSession }>(`/check-in-games/session/${sessionToken}`);
      const payload = response.data;
      if (!response.success || !payload?.success || !payload.data) {
        throw new Error(response.error || 'Failed to load check-in game session');
      }
      return payload.data;
    },
    enabled: enabled && !!sessionToken,
    staleTime: 0,
  });
}

export function usePlayCheckInGameSession(sessionToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    { sessionToken: string; gameType: CheckInGameType; resultSlot: number; board: CheckInGameBoardSlot[]; reward: CheckInGameIssuedReward },
    Error,
    void
  >({
    mutationFn: async () => {
      if (!sessionToken) {
        throw new Error('Missing game session token');
      }

      const response = await apiPost<
        {
          success: boolean;
          data: {
            sessionToken: string;
            gameType: CheckInGameType;
            resultSlot: number;
            board: CheckInGameBoardSlot[];
            reward: CheckInGameIssuedReward;
          };
        },
        Record<string, never>
      >(`/check-in-games/session/${sessionToken}/play`, {});
      const payload = response.data;
      if (!response.success || !payload?.success || !payload.data) {
        throw new Error(response.error || 'Failed to play check-in game');
      }
      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkInGameSession', sessionToken] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useMyCheckInGameRewards() {
  return useQuery<CheckInGameIssuedReward[]>({
    queryKey: ['myCheckInGameRewards'],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; data: CheckInGameIssuedReward[] }>('/check-in-games/my-rewards');
      const payload = response.data;
      if (!response.success || !payload?.success || !payload.data) {
        throw new Error(response.error || 'Failed to load check-in game rewards');
      }
      return payload.data;
    },
  });
}
