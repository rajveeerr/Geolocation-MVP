import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface MerchantDashboardStats {
  period: string;
  kpis: {
    grossSales: number;
    orderVolume: number;
    averageOrderValue: number;
    totalKickbackHandout: number;
  };
  metrics: {
    activeDeals: number;
    totalSavedDeals: number;
    totalKickbackEvents: number;
  };
  dateRange: {
    from: string | null;
    to: string;
  };
}

interface UseMerchantDashboardStatsParams {
  period?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' | 'all_time';
}

export const useMerchantDashboardStats = (params: UseMerchantDashboardStatsParams = {}) => {
  const { period = 'all_time' } = params;

  return useQuery<MerchantDashboardStats, Error>({
    queryKey: ['merchant-dashboard-stats', period],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);

      const response = await apiGet<MerchantDashboardStats>(
        `/merchants/dashboard/stats?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant dashboard stats');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
