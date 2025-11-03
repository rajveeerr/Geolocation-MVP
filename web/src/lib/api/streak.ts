import { apiGet, apiPost } from '@/services/api';
import type {
  DiscountCalculation,
  DiscountTiersResponse,
  StreakApiResponse,
  StreakLeaderboardResponse,
} from '@/types/streak';

export const fetchStreak = () => apiGet<StreakApiResponse>('/streak');

export const fetchDiscountTiers = () =>
  apiGet<DiscountTiersResponse>('/streak/discount-tiers');

export const fetchStreakLeaderboard = (limit = 10) =>
  apiGet<StreakLeaderboardResponse>(`/streak/leaderboard?limit=${limit}`);

export const calculateStreakDiscount = (orderAmount: number) =>
  apiPost<{ discount: DiscountCalculation }, { orderAmount: number }>(
    '/streak/calculate-discount',
    { orderAmount },
  );


