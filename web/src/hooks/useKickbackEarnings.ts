import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface KickbackSpendingDetail {
  dealTitle: string;
  dealId: number;
  amountSpent: number;
  amountEarned: number;
  inviteeCount: number;
  date: string;
}

export interface KickbackEarningRow {
  user: {
    id?: number;
    name: string;
    avatarUrl?: string | null;
  };
  earned: number;
  invitedCount: number;
  totalSpentByInvitees: number;
  spendingDetail: KickbackSpendingDetail[];
}

export interface KickbackEarningsResponse {
  summary: {
    revenue: number;
    totalKickbackHandout: number;
    totalTransactions?: number;
  };
  details: KickbackEarningRow[];
  timeSeriesData?: Array<{
    date: string;
    revenue: number;
    kickback: number;
  }>;
}

export const useKickbackEarnings = (period: string) => {
  return useQuery<KickbackEarningsResponse>({
    queryKey: ['kickbackEarnings', period],
    queryFn: async () => {
      const response = await apiGet<KickbackEarningsResponse>(`/merchants/me/kickback-earnings?period=${period}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch earnings');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
