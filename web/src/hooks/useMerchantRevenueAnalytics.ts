import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface RevenueAnalytics {
  totalRevenue: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  revenueByCategory: {
    category: string;
    revenue: number;
    percentage: number;
    change: number;
  }[];
  revenueByDealType: {
    dealType: string;
    revenue: number;
    percentage: number;
    change: number;
  }[];
  revenueByTime: {
    period: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }[];
  kickbackAnalytics: {
    totalKickbackPaid: number;
    totalKickbackEarned: number;
    netKickback: number;
    kickbackRate: number;
  };
  topPerformingDeals: {
    dealId: number;
    title: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }[];
}

export interface MerchantRevenueAnalyticsResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  analytics: RevenueAnalytics;
}

interface UseMerchantRevenueAnalyticsParams {
  period?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year';
}

export const useMerchantRevenueAnalytics = (params: UseMerchantRevenueAnalyticsParams = {}) => {
  const { period = 'last_30_days' } = params;

  return useQuery<MerchantRevenueAnalyticsResponse, Error>({
    queryKey: ['merchant-revenue-analytics', period],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);

      const response = await apiGet<MerchantRevenueAnalyticsResponse>(
        `/merchants/dashboard/revenue-analytics?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant revenue analytics');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
